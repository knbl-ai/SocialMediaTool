export const resizeImage = async (file, maxSizeMB = 5) => {
  return new Promise((resolve, reject) => {
    // Use a more conservative target size (4.5MB) to ensure we stay well under the 5MB limit
    const targetSizeMB = Math.min(maxSizeMB, 4.5);
    const maxSizeBytes = targetSizeMB * 1024 * 1024;
    
    // If file is already smaller than max size, return original
    if (file.size <= maxSizeBytes) {
      console.log(`Image ${file.name} is already under ${targetSizeMB}MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      resolve(file);
      return;
    }

    console.log(`Resizing image ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)}MB to under ${targetSizeMB}MB`);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // Start with a more aggressive scale factor based on file size
        // Use a more conservative initial scale (0.7 instead of 0.9)
        let scale = Math.min(0.7, Math.sqrt(maxSizeBytes / file.size));
        let quality = 0.8; // Start with lower quality (0.8 instead of 0.9)
        let attempt = 1;
        const maxAttempts = 5;
        
        const tryResize = (currentScale, currentQuality) => {
          const canvas = document.createElement('canvas');
          let width = Math.floor(img.width * currentScale);
          let height = Math.floor(img.height * currentScale);

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }
              
              console.log(`Attempt ${attempt}: Scale ${currentScale.toFixed(2)}, Quality ${currentQuality.toFixed(2)}, Size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
              
              // Check if the blob is still too large
              if (blob.size > maxSizeBytes && attempt < maxAttempts) {
                attempt++;
                // Reduce scale and quality more aggressively on subsequent attempts
                const newScale = currentScale * 0.8; // More aggressive reduction (0.8 instead of 0.9)
                const newQuality = currentQuality * 0.8; // More aggressive reduction
                tryResize(newScale, newQuality);
                return;
              }
              
              // If we've reached max attempts and the image is still too large,
              // make one final aggressive resize attempt
              if (blob.size > maxSizeBytes) {
                console.warn(`Still too large after ${attempt} attempts. Making final aggressive resize.`);
                
                // Create a new canvas with fixed dimensions that will guarantee a small file size
                const finalCanvas = document.createElement('canvas');
                const maxDimension = 1000; // Limit max dimension to 1000px
                
                let finalWidth, finalHeight;
                if (img.width > img.height) {
                  finalWidth = Math.min(img.width, maxDimension);
                  finalHeight = (img.height / img.width) * finalWidth;
                } else {
                  finalHeight = Math.min(img.height, maxDimension);
                  finalWidth = (img.width / img.height) * finalHeight;
                }
                
                finalCanvas.width = Math.floor(finalWidth);
                finalCanvas.height = Math.floor(finalHeight);
                
                const finalCtx = finalCanvas.getContext('2d');
                finalCtx.drawImage(img, 0, 0, finalWidth, finalHeight);
                
                finalCanvas.toBlob(
                  (finalBlob) => {
                    if (!finalBlob) {
                      reject(new Error('Final canvas to Blob conversion failed'));
                      return;
                    }
                    
                    console.log(`Final aggressive resize: Width ${finalWidth}px, Height ${finalHeight}px, Size: ${(finalBlob.size / 1024 / 1024).toFixed(2)}MB`);
                    
                    const resizedFile = new File([finalBlob], file.name, {
                      type: file.type,
                      lastModified: Date.now(),
                    });
                    
                    resolve(resizedFile);
                  },
                  file.type,
                  0.6 // Use a very low quality for the final attempt
                );
                return;
              }
              
              // Create a new file from the blob
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              console.log(`Final image size: ${(resizedFile.size / 1024 / 1024).toFixed(2)}MB`);
              
              // Double-check size and warn if still too large
              if (resizedFile.size > maxSizeBytes) {
                console.warn(`Warning: Could not resize ${file.name} below ${targetSizeMB}MB after ${attempt} attempts. Final size: ${(resizedFile.size / 1024 / 1024).toFixed(2)}MB`);
              }
              
              resolve(resizedFile);
            },
            file.type,
            currentQuality
          );
        };
        
        // Start the resizing process
        tryResize(scale, quality);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}; 