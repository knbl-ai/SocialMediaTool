import { fal } from "@fal-ai/client";
import dotenv from 'dotenv';
import { response } from "express";

dotenv.config();

if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY is required');
}

// Initialize fal client
fal.config({
    credentials: process.env.FAL_KEY
});


export const generateImage = async ({
    prompt,
    width = 1024,
    height = 1024,
    model
 
}) => {
    try {
        const result = await fal.subscribe(model, {
            input: {
                prompt,
                image_size: {
                    width,
                    height
                },
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
