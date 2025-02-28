import { fal } from '@fal-ai/client';
import { ApiError } from '../utils/ApiError.js';
import { prepareImageForVideo } from '../utils/imageProcessor.js';
import fetch from 'node-fetch';

if (!process.env.FAL_KEY) {
  throw new ApiError(500, 'FAL_KEY environment variable is required');
}

if (!process.env.VIDEO_SCREENSHOT_API) {
  throw new ApiError(500, 'VIDEO_SCREENSHOT_API environment variable is required');
}

// Initialize fal client with API key
fal.config({
  credentials: process.env.FAL_KEY
});

const DURATIONS = ['5', '10'];

/**
 * Get a screenshot from a video URL using the dedicated screenshot API
 * @param {string} videoUrl - URL of the video
 * @returns {Promise<string>} - URL of the screenshot
 */
export const getVideoScreenshot = async (videoUrl) => {
  try {
    if (!videoUrl) {
      throw new ApiError(400, 'Video URL is required');
    }
    
    const response = await fetch(`${process.env.VIDEO_SCREENSHOT_API}/process-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Screenshot API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.imageUrl) {
      throw new Error('Screenshot API did not return an image URL');
    }
    
    return data.imageUrl;
  } catch (error) {
    console.error('Error getting video screenshot:', error);
    // Return the original video URL as fallback
    return videoUrl;
  }
};

/**
 * Calculate aspect ratio from dimensions
 * @param {{ width: number, height: number }} size - Image dimensions
 * @returns {string} - Formatted aspect ratio for API
 */
const calculateAspectRatio = (size) => {
  // Add defensive checks
  if (!size || typeof size !== 'object') {
    throw new ApiError(400, 'Size must be a valid object with width and height properties');
  }

  const width = Number(size.width);
  const height = Number(size.height);

  if (isNaN(width) || isNaN(height)) {
    throw new ApiError(400, 'Width and height must be valid numbers');
  }

  if (width <= 0 || height <= 0) {
    throw new ApiError(400, 'Width and height must be positive numbers');
  }

  const ratio = width / height;
  
  // Round to common aspect ratios
  if (Math.abs(ratio - 1) < 0.1) return '1:1'; 
  else if (width > height && height === 720) return '16:9';
  else if (width > height && height === 960) return '4:3';
  else if (Math.abs(ratio - 9/16) < 0.1) return '9:16';
  
  return '1:1';
};

/**
 * Generate video from text prompt
 * @param {string} prompt - Text prompt for video generation
 * @param {string} model - Model ID (e.g., 'fal-ai/kling-video/v1.6/standard/text-to-video')
 * @param {Object} options - Additional options
 * @param {{ width: number, height: number }} options.size - Output video dimensions
 * @param {string} [options.duration='5'] - Duration in seconds (5 or 10)
 * @param {boolean} [options.logs=false] - Whether to include logs
 * @returns {Promise<{data: {video: {url: string}}, requestId: string}>}
 */
export const textToVideo = async (prompt, model, options = {}) => {
  try {
    if (!prompt) {
      throw new ApiError(400, 'Prompt is required');
    }
    if (!model) {
      throw new ApiError(400, 'Model ID is required');
    }
    
    // Enhanced validation for options.size
    if (!options || !options.size) {
      throw new ApiError(400, 'Size option is required');
    }

    const duration = DURATIONS.includes(options.duration) ? options.duration : '5';
    let aspect_ratio = calculateAspectRatio(options.size);
    if (model === 'fal-ai/luma-dream-machine/ray-2' && aspect_ratio === '1:1') aspect_ratio = '16:9';

    const result = await fal.subscribe(model, {
      input: {
        prompt,
        duration,
        aspect_ratio,
        width: options.size.width,
        height: options.size.height
      },
      logs: options.logs || false,
      onQueueUpdate: options.onQueueUpdate
    });

    // Assuming the function returns a videoUrl
    const videoUrl = result.data.video.url;
    
    // Get a screenshot of the video using the dedicated API
    const screenshotUrl = await getVideoScreenshot(videoUrl);
    
    return {
      videoUrl,
      screenshotUrl
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Video generation failed: ${error.message}`);
  }
};

/**
 * Generate video from image and prompt
 * @param {string} prompt - Text prompt for video generation
 * @param {string} model - Model ID (e.g., 'fal-ai/kling-video/v1.6/standard/image-to-video')
 * @param {string} imageUrl - URL of the source image
 * @param {Object} options - Additional options
 * @param {{ width: number, height: number }} options.size - Output video dimensions
 * @param {string} [options.duration='5'] - Duration in seconds (5 or 10)
 * @param {boolean} [options.logs=false] - Whether to include logs
 * @returns {Promise<{data: {video: {url: string}}, requestId: string}>}
 */
export const imageToVideo = async (prompt, model, imageUrl, options = {}) => {
  try {
    if (!prompt) {
      throw new ApiError(400, 'Prompt is required');
    }
    if (!model) {
      throw new ApiError(400, 'Model ID is required');
    }
    if (!imageUrl) {
      throw new ApiError(400, 'Image URL is required');
    }

    // Process the image to ensure it has a standard aspect ratio
  
    const processedImage = await prepareImageForVideo(imageUrl);
    
    // Use the processed image dimensions and aspect ratio
    const timestamp = Date.now();
    const processedImageUrl = await fal.storage.upload(processedImage.buffer, { 
      filename: `${timestamp}-iGentityUploadFile.jpg` 
    });
    
    // Set options.size based on the processed image
    options.size = {
      width: processedImage.width,
      height: processedImage.height
    };

    let duration = DURATIONS.includes(options.duration) ? options.duration : '5';
    if (model === 'fal-ai/luma-dream-machine/ray-2') duration = '5s';

    // Use the aspect ratio from the processed image
    let aspect_ratio = processedImage.aspectRatio;
    if (model === 'fal-ai/luma-dream-machine/ray-2' && aspect_ratio === '1:1') aspect_ratio = '16:9';

    const result = await fal.subscribe(`${model}/image-to-video`, {
      input: {
        prompt,
        image_url: processedImageUrl,
        duration,
        aspect_ratio,
        loop: true,
        resolution: '720p'
      },
      logs: options.logs || false,
      onQueueUpdate: options.onQueueUpdate
    });

    // Get a screenshot of the video using the dedicated API
    const videoUrl = result.data.video.url;
    const screenshotUrl = await getVideoScreenshot(videoUrl);
    
    return {
      videoUrl,
      screenshotUrl,
      requestId: result.requestId
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Video generation failed: ${error.message}`);
  }
}; 