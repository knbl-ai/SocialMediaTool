import sharp from 'sharp';
import fetch from 'node-fetch';

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