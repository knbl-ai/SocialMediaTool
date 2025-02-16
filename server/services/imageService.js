import { fal } from "@fal-ai/client";
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY is required');
}

// Initialize fal client
fal.config({
    credentials: process.env.FAL_KEY
});

const calculateAspectRatio = (width, height) => {
    if (width === height) return "1:1"
    if (width > height && height === 720) return "16:9"
    if (width > height && height === 960) return "4:3"
    if (height > width) return "9:16"
}

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
