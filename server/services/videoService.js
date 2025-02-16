import { fal } from '@fal-ai/client';
import { ApiError } from '../utils/ApiError.js';

if (!process.env.FAL_KEY) {
  throw new ApiError(500, 'FAL_KEY environment variable is required');
}

// Initialize fal client with API key
fal.config({
  credentials: process.env.FAL_KEY
});

const DURATIONS = ['5', '10'];

/**
 * Calculate aspect ratio from dimensions
 * @param {{ width: number, height: number }} size - Image dimensions
 * @returns {string} - Formatted aspect ratio for API
 */
const calculateAspectRatio = (size) => {
  if (!size?.width || !size?.height) {
    throw new ApiError(400, 'Both width and height are required');
  }

  const ratio = size.width / size.height;
  
  // Round to common aspect ratios
  if (Math.abs(ratio - 1) < 0.1) return '1:1'; 
  else if (size.width > size.height && size.height === 720) return '16:9';
  else if (size.width > size.height && size.height === 960) return '4:3';
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
    if (!options.size) {
      throw new ApiError(400, 'Size is required');
    }

    const duration = DURATIONS.includes(options.duration) ? options.duration : '5';
    let aspect_ratio = calculateAspectRatio(options.size);
    if (model === 'fal-ai/luma-dream-machine/ray-2' && aspect_ratio === '1:1') aspect_ratio = '16:9';

    console.log('model', model);
    console.log('prompt', prompt);
    console.log('duration', duration);
    console.log('aspect_ratio', aspect_ratio);
    console.log('width', options.size.width);
    console.log('height', options.size.height);

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

    console.log('result', result);

    return result;
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
    if (!options.size) {
      throw new ApiError(400, 'Size is required');
    }

    let duration = DURATIONS.includes(options.duration) ? options.duration : '5';
    if (model === 'fal-ai/luma-dream-machine/ray-2') duration = '5s'

    let aspect_ratio = calculateAspectRatio(options.size);
    if (model === 'fal-ai/luma-dream-machine/ray-2' && aspect_ratio === '1:1') aspect_ratio = '16:9';

    const result = await fal.subscribe(`${model}/image-to-video`, {
      input: {
        prompt,
        image_url: imageUrl,
        duration,
        aspect_ratio,
        loop: true,
        resolution: '720p'
      },
      logs: options.logs || false,
      onQueueUpdate: options.onQueueUpdate
    });

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Video generation failed: ${error.message}`);
  }
};

/**
 * Upload a file to fal.ai storage
 * @param {File} file - File to upload
 * @returns {Promise<string>} - URL of the uploaded file
 */
export const uploadFile = async (file) => {
  try {
    const url = await fal.storage.upload(file);
    return url;
  } catch (error) {
    throw new ApiError(500, `File upload failed: ${error.message}`);
  }
}; 