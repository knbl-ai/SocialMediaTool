import sharp from 'sharp';
import fetch from 'node-fetch';

// Standard aspect ratios and their dimensions
const STANDARD_ASPECT_RATIOS = [
  { name: '1:1', width: 1080, height: 1080 },
  { name: '4:3', width: 1280, height: 960 },
  { name: '16:9', width: 1280, height: 720 },
  { name: '9:16', width: 720, height: 1280 },
  // Add more common aspect ratios to support a wider range of videos
  { name: '3:2', width: 1200, height: 800 },
  { name: '2:3', width: 800, height: 1200 },
  { name: '5:4', width: 1250, height: 1000 },
  { name: '4:5', width: 1000, height: 1250 }
];

/**
 * Prepare an image for video generation by converting it to the closest standard aspect ratio
 * @param {string} imageUrl - URL of the source image
 * @returns {Promise<{buffer: Buffer, info: Object, contentType: string, aspectRatio: string, width: number, height: number}>}
 */
export const prepareImageForVideo = async (imageUrl) => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('Received empty image buffer');
    }

    // Get image metadata
    const image = sharp(Buffer.from(buffer));
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Could not determine image dimensions');
    }
    
    const { width, height } = metadata;
    const originalRatio = width / height;

    // Find the closest standard aspect ratio
    let closestRatio = STANDARD_ASPECT_RATIOS[0];
    let minDifference = Infinity;

    for (const ratio of STANDARD_ASPECT_RATIOS) {
      const ratioValue = ratio.width / ratio.height;
      const difference = Math.abs(originalRatio - ratioValue);
      
      if (difference < minDifference) {
        minDifference = difference;
        closestRatio = ratio;
      }
    }

    // For extreme aspect ratios, we might want to use a different approach
    if (minDifference > 0.5) {
      // Removed console.warn about unusual aspect ratio
    }

    // Resize and crop the image to match the target aspect ratio
    const resizedImage = await image
      .resize({
        width: closestRatio.width,
        height: closestRatio.height,
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: resizedImage.data,
      info: resizedImage.info,
      contentType: 'image/jpeg',
      aspectRatio: closestRatio.name,
      width: closestRatio.width,
      height: closestRatio.height
    };
  } catch (error) {
    console.error('Error preparing image for video:', error);
    throw error;
  }
};

export const resizeForPlatform = async (imageUrl, platform, baseWidth = 1200, baseHeight = 960) => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    // Create Sharp instance
    const image = sharp(Buffer.from(buffer));
    let resizedImage;

    switch (platform) {
      case 'Instagram':
        resizedImage = await image
          .resize(1080, 1080, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 90 })
          .toBuffer({ resolveWithObject: true });
        break;

      case 'TikTok':
        resizedImage = await image
          .resize(1080, 1920, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 90 })
          .toBuffer({ resolveWithObject: true });
        break;

      default:
        resizedImage = await image
          .resize(baseWidth, baseHeight, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 90 })
          .toBuffer({ resolveWithObject: true });
    }

    return {
      buffer: resizedImage.data,
      info: resizedImage.info,
      contentType: 'image/jpeg'
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

export const determineImageDimensions = (platforms) => {
  // If only Instagram
  if (platforms.length === 1 && platforms[0] === 'Instagram') {
    return { width: 1080, height: 1080 };
  }

  // If only TikTok
  if (platforms.length === 1 && platforms[0] === 'TikTok') {
    return { width: 1080, height: 1920 };
  }

  // For all other cases, use the standard landscape format
  return { width: 1200, height: 960 };
}; 