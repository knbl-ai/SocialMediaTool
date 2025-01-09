import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const sanitizeJsonString = (str) => {
    // Remove any potential BOM or hidden characters
    str = str.replace(/^\uFEFF/, '');
    
    // Handle escaped quotes and apostrophes
    str = str.replace(/\\"/g, '"').replace(/\\'/g, "'");
    
    // Remove any markdown code block indicators
    str = str.replace(/```json/g, '').replace(/```/g, '');
    
    // Trim whitespace
    str = str.trim();
    
    // Ensure the string starts and ends with curly braces
    if (!str.startsWith('{')) str = '{' + str;
    if (!str.endsWith('}')) str = str + '}';
    
    return str;
};

const validateAndFixJson = (jsonString) => {
    try {
        // First try to parse as is
        return JSON.parse(jsonString);
    } catch (error) {
        try {
            // Try to sanitize and parse again
            const sanitized = sanitizeJsonString(jsonString);
            return JSON.parse(sanitized);
        } catch (error) {
            // If still fails, try to extract content from the text
            const postMatch = jsonString.match(/"post"\s*:\s*"([^"]+)"/);
            const titleMatch = jsonString.match(/"title"\s*:\s*"([^"]+)"/);
            const subtitleMatch = jsonString.match(/"subtitle"\s*:\s*"([^"]+)"/);

            // Construct a valid JSON object with extracted or default values
            return {
                post: postMatch ? postMatch[1] : '',
                title: titleMatch ? titleMatch[1] : '',
                subtitle: subtitleMatch ? subtitleMatch[1] : ''
            };
        }
    }
};

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
            try {
                // Use the new validation and fixing function
                const parsedResponse = validateAndFixJson(text);
                
                // Ensure all required fields exist with proper types
                const validatedResponse = {
                    post: typeof parsedResponse.post === 'string' ? parsedResponse.post : '',
                    title: typeof parsedResponse.title === 'string' ? parsedResponse.title : '',
                    subtitle: typeof parsedResponse.subtitle === 'string' ? parsedResponse.subtitle : ''
                };

                console.log('Validated response:', validatedResponse);
                return validatedResponse;
            } catch (parseError) {
                console.error('Failed to parse or fix LLM response:', parseError);
                // Return a valid empty response instead of throwing
                return {
                    post: '',
                    title: '',
                    subtitle: ''
                };
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
