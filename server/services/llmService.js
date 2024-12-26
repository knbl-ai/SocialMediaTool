import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a skilled social media content creator. Generate engaging posts that follow the given style and structure guidelines while maintaining brand voice. Always output valid JSON in the format: {post, title, subtitle}. Omit preamble and postamble.`;

const generatePromptService = ({ topic, targetAudience = "adults", style = "casual", maxLength = 280, platform = "instagram" }) => {
    return `
    Generate a social media post for ${platform} about ${topic}.
        Style: ${style}
        Target Audience: ${targetAudience}
        Maximum Length: ${maxLength} characters
        
        The post should be engaging and follow ${platform}'s best practices.
        Return only the JSON object with post, title, and subtitle.`
}

export const generateText = async ({ topic, model = 'claude-3-5-haiku-20241022', targetAudience = "adults", style = "casual", maxLength = 280, platform = "instagram"  }) => {
    try {

        const response = await client.messages.create({
            system: SYSTEM_PROMPT,
            max_tokens: 1024,
            messages: [{ role: 'user', content: generatePromptService({ topic, targetAudience, style, maxLength, platform }) }],
            model,
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
