import * as fal from '@fal-ai/serverless-client';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY is required');
}

// Initialize fal client
fal.config({
    credentials: process.env.FAL_KEY
});

/**
 * Generate an image using Stable Diffusion XL
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - The prompt to generate image from
 * @param {string} [params.negativePrompt] - Things to avoid in the image
 * @param {number} [params.width=1024] - Image width
 * @param {number} [params.height=1024] - Image height
 * @param {number} [params.numberOfImages=1] - Number of images to generate
 * @param {number} [params.steps=30] - Number of inference steps
 * @param {number} [params.seed] - Random seed for reproducibility
 * @returns {Promise<Array<string>>} Array of image URLs
 */
export const generateImage = async ({
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    numberOfImages = 1,
    steps = 30,
    seed = undefined
}) => {
    try {
        const result = await fal.subscribe('fal-ai/stable-diffusion-xl', {
            input: {
                prompt,
                negative_prompt: negativePrompt,
                image_size: {
                    width,
                    height
                },
                num_images: numberOfImages,
                steps,
                seed
            }
        });

        return result.images.map(img => img.url);
    } catch (error) {
        console.error('Image generation error:', error);
        throw new Error(`Failed to generate image: ${error.message}`);
    }
};

/**
 * Generate image variations from an existing image
 * @param {Object} params - Generation parameters
 * @param {string} params.imageUrl - URL or Base64 of the source image
 * @param {string} [params.prompt] - Optional prompt to guide the variation
 * @param {number} [params.numberOfVariations=4] - Number of variations to generate
 * @param {number} [params.variationStrength=0.7] - How different variations should be (0-1)
 * @returns {Promise<Array<string>>} Array of variation image URLs
 */
export const generateImageVariations = async ({
    imageUrl,
    prompt = '',
    numberOfVariations = 4,
    variationStrength = 0.7
}) => {
    try {
        const result = await fal.subscribe('fal-ai/stable-diffusion-variation', {
            input: {
                image_url: imageUrl,
                prompt,
                num_images: numberOfVariations,
                strength: variationStrength
            }
        });

        return result.images.map(img => img.url);
    } catch (error) {
        console.error('Image variation error:', error);
        throw new Error(`Failed to generate image variations: ${error.message}`);
    }
};

/**
 * Upscale an image to a higher resolution
 * @param {Object} params - Upscaling parameters
 * @param {string} params.imageUrl - URL or Base64 of the image to upscale
 * @param {number} [params.scale=2] - Scale factor (2x or 4x)
 * @param {string} [params.mode='fast'] - Upscaling mode ('fast' or 'quality')
 * @returns {Promise<string>} URL of the upscaled image
 */
export const upscaleImage = async ({
    imageUrl,
    scale = 2,
    mode = 'fast'
}) => {
    try {
        const result = await fal.subscribe('fal-ai/real-esrgan', {
            input: {
                image_url: imageUrl,
                scale,
                mode
            }
        });

        return result.image.url;
    } catch (error) {
        console.error('Image upscaling error:', error);
        throw new Error(`Failed to upscale image: ${error.message}`);
    }
};

/**
 * Remove background from an image
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL or Base64 of the image
 * @returns {Promise<string>} URL of the image with removed background
 */
export const removeBackground = async ({ imageUrl }) => {
    try {
        const result = await fal.subscribe('fal-ai/background-removal', {
            input: {
                image_url: imageUrl
            }
        });

        return result.image.url;
    } catch (error) {
        console.error('Background removal error:', error);
        throw new Error(`Failed to remove background: ${error.message}`);
    }
};
