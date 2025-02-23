import { fal } from "@fal-ai/client";
import dotenv from 'dotenv';
import axios from 'axios';
import probe from 'probe-image-size';
import { ApiError } from '../utils/ApiError.js';
import { generateText, generateCategoryName } from './llmService.js';
import { fashionCategoryPrompt } from './promptsService.js';

dotenv.config();

if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY is required');
}

// Initialize fal client
fal.config({
    credentials: process.env.FAL_KEY
});

const calculateAspectRatio = (width, height) => {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
};

const calculateImageSize = async (imageUrl, providedWidth, providedHeight) => {
    // If both dimensions are provided, use them
    if (providedWidth && providedHeight) {
        return {
            width: parseInt(providedWidth),
            height: parseInt(providedHeight)
        };
    }

    try {
        // Get the image dimensions using probe-image-size
        const dimensions = await probe(imageUrl);
        const originalWidth = dimensions.width;
        const originalHeight = dimensions.height;

        // If one dimension is provided, maintain aspect ratio
        if (providedWidth) {
            const aspectRatio = originalHeight / originalWidth;
            return {
                width: parseInt(providedWidth),
                height: parseInt(providedWidth * aspectRatio)
            };
        } else if (providedHeight) {
            const aspectRatio = originalWidth / originalHeight;
            return {
                width: parseInt(providedHeight * aspectRatio),
                height: parseInt(providedHeight)
            };
        }

        // Use original dimensions if no dimensions are provided
        return {
            width: originalWidth,
            height: originalHeight
        };
    } catch (error) {
        console.error('Error calculating image size:', error);
        throw new Error(`Failed to calculate image size: ${error.message}`);
    }
};

export const generateImage = async ({
    prompt,
    width = 1024,
    height = 1024,
    model
}) => {
    if (!width || !height) {
        throw new Error('Width and height are required for image generation');
    }

    // Convert to numbers if they're strings
    const numericWidth = parseInt(width);
    const numericHeight = parseInt(height);

    if (isNaN(numericWidth) || isNaN(numericHeight)) {
        throw new Error('Invalid width or height values');
    }

    try {
        console.log(`Generating image with dimensions: ${numericWidth}x${numericHeight}`);
        
        const result = await fal.subscribe(model, {
            input: {
                prompt,
                image_size: {
                    width: numericWidth,
                    height: numericHeight
                },
                aspect_ratio: calculateAspectRatio(numericWidth, numericHeight)
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.map((log) => log.message).forEach(console.log);
                }
            },
        });

        return result.data.images[0].url;
    } catch (error) {
        console.error('Image generation error:', error);
        throw new Error(`Failed to generate image: ${error.message}`);
    }
};

export const generateBackground = async ({
    prompt,
    imageUrl,
    imageDescription,
    width,
    height,
    guidanceScale = 5,
    numInferenceSteps = 28,
    maskImageUrl = null
}) => {
    try {
       

        // Calculate image size
        const imageSize = await calculateImageSize(imageUrl, width, height);
        console.log(`Using dimensions: ${imageSize.width}x${imageSize.height}`);

        const input = {
            prompt,
            image_url: imageUrl,
            guidance_scale: guidanceScale,
            num_inference_steps: numInferenceSteps,
            enable_safety_checker: false,
            output_format: "png",
            image_size: imageSize
        };

        if (maskImageUrl) {
            input.mask_image_url = maskImageUrl;
        }

        const result = await fal.subscribe("fal-ai/iclight-v2", {
            input,
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.map((log) => log.message).forEach(console.log);
                }
            },
        });

        if (!result.data.images?.[0]?.url) {
            throw new Error('No image generated');
        }
        
        return {
            url: result.data.images[0].url,
            seed: result.data.seed,
            prompt: `${imageDescription}. On background: ${result.data.prompt}`
        };
    } catch (error) {
        console.error('Background generation error:', error);
        throw new Error(`Failed to generate background: ${error.message}`);
    }
};

const identifyFashionCategory = async (imageDescription) => {
  try {
    const prompt = fashionCategoryPrompt({ imageDescription });
    const category = await generateCategoryName({
      system: prompt.system,
      prompt: prompt.prompt
    });
    return category; // generateCategoryName already handles validation and defaults
    
  } catch (error) {
    console.error('Error identifying fashion category:', error);
    return 'tops'; // Default to tops if there's an error
  }
};

export const generateFashionLook = async ({
  modelPrompt = '',
  gender,
  garmentImage,
  imageDescription,
  garmentPhotoType = 'auto',
  guidanceScale = 2,
  timesteps = 50,
  seed = Math.floor(Math.random() * 1000000),
  numSamples = 1,
  coverFeet = false,
  adjustHands = false,
  restoreBackground = false,
  restoreClothes = false,
  longTop = false
}) => {
    const description = modelPrompt.trim() 
      ? `A fashion photo of a ${modelPrompt} ${gender} model in natural light and neutral studio background, wearing ${imageDescription}`
      : `A fashion photo of a ${gender} model in natural light and neutral studio background, wearing ${imageDescription}`;

    try {
        // First identify the category
        console.log('Identifying fashion category...');
        const category = await identifyFashionCategory(imageDescription);
        console.log(`Identified category: ${category}`);

        // Generate the model image
        console.log('Generating model image from prompt...');
        const modelImageResult = await generateImage({
            prompt: description,
            width: 1080,
            height: 1920,
            model: 'fal-ai/flux/dev'
        });

        if (!modelImageResult) {
            throw new Error('Failed to generate model image');
        }

        console.log('Model image generated successfully, proceeding with try-on...');

        // Now proceed with the fashion try-on using the generated model image
        const result = await fal.subscribe('fashn/tryon', {
            input: {
                model_image: modelImageResult,
                garment_image: garmentImage,
                category,  // Use the identified category
                garment_photo_type: garmentPhotoType,
                guidance_scale: guidanceScale,
                timesteps,
                seed,
                num_samples: numSamples,
                cover_feet: coverFeet,
                adjust_hands: adjustHands,
                restore_background: restoreBackground,
                restore_clothes: restoreClothes,
                long_top: longTop
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.map((log) => log.message).forEach(console.log);
                }
            }
        });

        if (!result?.data?.images?.[0]?.url) {
            throw new Error('Failed to generate fashion look: No image URL in response');
        }

        return {
            url: result.data.images[0].url,
            width: result.data.images[0].width,
            height: result.data.images[0].height,
            modelImageUrl: modelImageResult,
            description: description,
            category  // Include the identified category in the response
        };
    } catch (error) {
        console.error('Error generating fashion look:', error);
        throw new Error(`Failed to generate fashion look: ${error.message}`);
    }
};
