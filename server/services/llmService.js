import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateText = async ({ topic, model = 'claude-3-5-haiku-20241022', maxTokens = 1024, system, temperature = 0.3, responseFormat = 'json' }) => {
    try {
        const response = await client.messages.create({
            system: system,
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: topic }],
            model,
            temperature
        });

        const text = response.content[0].text;
        
        if (responseFormat === 'json') {
            // Ensure we have valid JSON
            try {
                const parsedResponse = JSON.parse(text);
                
                // Validate the structure for post content
                if (parsedResponse.post !== undefined) {
                    if (!parsedResponse.post || typeof parsedResponse.post !== 'string') {
                        parsedResponse.post = '';
                    }
                    if (!parsedResponse.title || typeof parsedResponse.title !== 'string') {
                        parsedResponse.title = '';
                    }
                    if (!parsedResponse.subtitle || typeof parsedResponse.subtitle !== 'string') {
                        parsedResponse.subtitle = '';
                    }
                }

                return parsedResponse;
            } catch (parseError) {
                console.error('Failed to parse LLM response as JSON:', text);
                throw new Error('Invalid JSON response from LLM');
            }
        } else {
            // Return text as is for non-JSON responses (like image prompts)
            return text.trim();
        }
    } catch (error) {
        console.error('LLM generation error:', error);
        throw new Error('Failed to generate text content. Please try again.');
    }
};
