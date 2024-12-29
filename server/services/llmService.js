import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});


export const generateText = async ({ topic, model = 'claude-3-5-haiku-20241022',  maxTokens = 1024, system, temperature = 0.3  }) => {
    try {
        const response = await client.messages.create({
            system: system,
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: topic }],
            model,
            temperature
        });

        const text = response.content[0].text;
        
        // Ensure we have valid JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse LLM response as JSON:', text);
            // If parsing fails, create a default structure with the entire text as post
            parsedResponse = {
                post: text,
                title: '',
                subtitle: ''
            };
        }

        // Validate the structure
        if (!parsedResponse.post || typeof parsedResponse.post !== 'string') {
            parsedResponse.post = '';
        }
        if (!parsedResponse.title || typeof parsedResponse.title !== 'string') {
            parsedResponse.title = '';
        }
        if (!parsedResponse.subtitle || typeof parsedResponse.subtitle !== 'string') {
            parsedResponse.subtitle = '';
        }

        return parsedResponse;
    } catch (error) {
        console.error('LLM generation error:', error);
        throw new Error('Failed to generate text content. Please try again.');
    }
};
