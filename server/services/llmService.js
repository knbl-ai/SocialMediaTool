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

const validateAndFixJson = (jsonString, isContentPlan = false) => {
    try {
        // First try to parse as is
        const parsed = JSON.parse(jsonString);

        if (isContentPlan) {
            // For content plan, validate that all keys are valid dates
            const validatedPlan = {};
            for (const [dateStr, content] of Object.entries(parsed)) {
                try {
                    // Attempt to parse the date
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        validatedPlan[dateStr] = content;
                    } else {
                        console.error(`Invalid date in content plan: ${dateStr}`);
                    }
                } catch (error) {
                    console.error(`Error validating date: ${dateStr}`, error);
                }
            }
            return validatedPlan;
        }

        // For regular post content
        return {
            post: typeof parsed.post === 'string' ? parsed.post : '',
            title: typeof parsed.title === 'string' ? parsed.title : '',
            subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : ''
        };
    } catch (error) {
        try {
            // Try to sanitize and parse again
            const sanitized = sanitizeJsonString(jsonString);
            const parsed = JSON.parse(sanitized);

            if (isContentPlan) {
                // For content plan, validate that all keys are valid dates
                const validatedPlan = {};
                for (const [dateStr, content] of Object.entries(parsed)) {
                    try {
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime())) {
                            validatedPlan[dateStr] = content;
                        }
                    } catch (error) {
                        console.error(`Error validating date: ${dateStr}`, error);
                    }
                }
                return validatedPlan;
            }

            // For regular post content
            return {
                post: typeof parsed.post === 'string' ? parsed.post : '',
                title: typeof parsed.title === 'string' ? parsed.title : '',
                subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : ''
            };
        } catch (error) {
            if (isContentPlan) {
                return {}; // Return empty plan if parsing fails
            }

            // For regular post content, try to extract using regex
            const postMatch = jsonString.match(/"post"\s*:\s*"([^"]+)"/);
            const titleMatch = jsonString.match(/"title"\s*:\s*"([^"]+)"/);
            const subtitleMatch = jsonString.match(/"subtitle"\s*:\s*"([^"]+)"/);

            return {
                post: postMatch ? postMatch[1] : '',
                title: titleMatch ? titleMatch[1] : '',
                subtitle: subtitleMatch ? subtitleMatch[1] : ''
            };
        }
    }
};

export const generateText = async ({ topic, model = 'claude-3-5-haiku-20241022', maxTokens = 1024, system, temperature = 0.3, responseFormat = 'json', isContentPlan = false }) => {
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
                console.log('Raw LLM response:', text);
                
                // Use the new validation and fixing function with isContentPlan flag
                const parsedResponse = validateAndFixJson(text, isContentPlan);
                
                console.log('Validated response:', parsedResponse);
                return parsedResponse;
            } catch (parseError) {
                console.error('Failed to parse or fix LLM response:', parseError);
                // Return appropriate empty response based on type
                return isContentPlan ? {} : {
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
