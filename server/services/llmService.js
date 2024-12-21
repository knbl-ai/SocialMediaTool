import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required');
}

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate text using Anthropic's Claude model
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - The prompt to send to the model
 * @param {string} params.model - The model to use (e.g., 'claude-3-opus-20240229')
 * @param {number} [params.maxTokens=1000] - Maximum tokens to generate
 * @param {number} [params.temperature=0.7] - Temperature for generation (0-1)
 * @param {Object} [params.systemPrompt] - Optional system prompt to set context
 * @returns {Promise<string>} Generated text
 */
export const generateText = async ({
    prompt,
    model = 'claude-3-opus-20240229',
    maxTokens = 1000,
    temperature = 0.7,
    systemPrompt = null
}) => {
    try {
        const messages = [];
        
        // Add system prompt if provided
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }

        // Add user prompt
        messages.push({
            role: 'user',
            content: prompt
        });

        const response = await client.messages.create({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
        });

        return response.content[0].text;
    } catch (error) {
        console.error('LLM generation error:', error);
        throw new Error(`Failed to generate text: ${error.message}`);
    }
};

/**
 * Stream text generation using Anthropic's Claude model
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - The prompt to send to the model
 * @param {string} params.model - The model to use
 * @param {number} [params.maxTokens=1000] - Maximum tokens to generate
 * @param {number} [params.temperature=0.7] - Temperature for generation
 * @param {Object} [params.systemPrompt] - Optional system prompt
 * @param {Function} params.onToken - Callback function for each token
 * @returns {Promise<void>}
 */
export const streamText = async ({
    prompt,
    model = 'claude-3-opus-20240229',
    maxTokens = 1000,
    temperature = 0.7,
    systemPrompt = null,
    onToken
}) => {
    try {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }

        messages.push({
            role: 'user',
            content: prompt
        });

        const stream = await client.messages.create({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
            stream: true,
        });

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.text) {
                onToken(chunk.delta.text);
            }
        }
    } catch (error) {
        console.error('LLM streaming error:', error);
        throw new Error(`Failed to stream text: ${error.message}`);
    }
};
