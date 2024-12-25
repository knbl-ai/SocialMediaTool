import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateText = async ({ prompt, model = 'claude-3-5-haiku-20241022' }) => {
    try {
        const response = await client.messages.create({
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
            model,
        });

        return response.content[0].text;
    } catch (error) {
        console.error('LLM generation error:', error);
        throw error;
    }
};
