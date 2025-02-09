export const singlePostPrompt = ({ topic, targetAudience = "adults", style = "casual", maxLength = 280, platform = "Instagram", language = "English" }) => {
    const platformGuidelines = {
        Instagram: "Visual-first content, use emojis, hashtags, and engaging captions up to 2,200 characters",
        Facebook: "Longer form content, focus on community engagement, support rich media",
        LinkedIn: "Professional tone, industry insights, thought leadership content",
        TikTok: "Trendy, short-form content, focus on entertainment and engagement",
        X: "Concise messaging, trending topics, hashtags, limited to 280 characters"
    };

    const maxLengthPlatforms = {
        Instagram: 280,
        Facebook: 400,
        LinkedIn: 1000,
        TikTok: 280,
        X: 280
    };

    const languageInstructions = {
        English: {
            instruction: "Write the content in English using natural, fluent language",
            direction: "left-to-right"
        },
        Hebrew: {
            instruction: "Write the content in Hebrew using proper Hebrew grammar and RTL text",
            direction: "right-to-left"
        }
    };

    const currentLang = languageInstructions[language] || languageInstructions.English;

    return {
        prompt: `
    Generate a social media post specifically for ${platform} about ${topic}.
        Style: ${style}
        Target Audience: ${targetAudience}
        Maximum Length: ${maxLengthPlatforms[platform] || maxLength} characters
        Platform Guidelines: ${platformGuidelines[platform] || platformGuidelines.Instagram}
        Language Instructions: ${currentLang.instruction}
        Text Direction: ${currentLang.direction}
        
        The post should be engaging and follow ${platform}'s best practices.
        Return only the JSON object with post, title, and subtitle.`,
        system: `You are a skilled social media content creator specializing in ${platform} content and ${language} language content creation.
        
        Important Language Instructions:
        1. Generate all content in ${language}
        2. Follow ${currentLang.direction} text direction
        3. Use appropriate cultural context for ${language} speakers
        4. Maintain proper grammar and style for ${language}
        5. Keep JSON keys in English: {post, title, subtitle}
        
        Generate engaging posts that follow the platform's best practices and language requirements while maintaining brand voice.
        Always output valid JSON in the format: {post, title, subtitle}.
        The JSON keys must always be in English, but the values should be in ${language}.
        Omit preamble and postamble.`
    };
};

export const contentPlanPrompt = ({
    accountName,
    accountReview,
    audience,
    guidelines,
    startDate,
    endDate,
    frequency,
    voice,
}) => {
    return {
        prompt: `You are a social media content strategist. Generate a social media content plan based on the following inputs:

Company Name: ${accountName}
Company Description: ${accountReview}
Guidelines: ${guidelines} // Include any specific date-bound content requirements here
Target Audience: ${audience}
Start Date: ${startDate}
End Date: ${endDate}
Frequency: ${frequency} // Number representing "post every X days"
Style: ${voice} // e.g., business, funny, engaging, professional, casual, etc.

Create a content plan with post ideas that align with the company's identity and target audience. Generate brief, concise post ideas rather than complete posts. Respect any date-specific content requirements mentioned in the guidelines. Maintain the specified posting frequency and style throughout the plan.

Example Input:
Company Name: "TechFlow Solutions"
Company Description: "IT consulting and cloud migration services"
Guidelines: "Post about team building event on 2024-01-05, include AWS certification celebration on 2024-01-10"
Target Audience: "IT managers and CTOs in mid-sized companies"
Start Date: "2024-01-01"
End Date: "2024-01-14"
Frequency: "1" // Post every day, if frequency is 2, post every 2 days
Style: "professional"

Example Output:
{
  "2024-01-01": "Cloud migration success metrics overview",
  "2024-01-03": "Common IT infrastructure challenges",
  "2024-01-05": "Behind the scenes: Annual team building event",
  "2024-01-07": "Client case study highlights",
  "2024-01-09": "Industry trends for 2024",
  "2024-01-10": "Celebrating our team's AWS certifications",
  "2024-01-11": "Cybersecurity best practices",
  "2024-01-13": "Digital transformation roadmap tips"
}

Alternative Example Input:
Company Name: "Happy Paws Pet Shop"
Company Description: "Local pet store and grooming services"
Guidelines: "Post about Santa Paws event on 2024-12-25, weekly pet care tips every Monday"
Target Audience: "Pet owners in downtown area"
Start Date: "2024-12-20"
End Date: "2024-12-27"
Frequency: "1" // Post every day
Style: "funny"

Example Output:
{
  "2024-12-20": "Weird things pets do when nobody's watching",
  "2024-12-21": "Cats vs Christmas trees: eternal battle",
  "2024-12-22": "Dogs reacting to snow compilation",
  "2024-12-23": "Pet fashion fails",
  "2024-12-24": "Last-minute pet gift ideas",
  "2024-12-25": "Santa Paws is coming to town - annual pet photo event",
  "2024-12-26": "Post-holiday pet shenanigans",
  "2024-12-27": "Friday fun: derpy pet faces"
}

Generate a content plan based on the provided inputs, ensuring:
1. Post ideas are brief and conceptual
2. Specified frequency is maintained (every X days)
3. Date-specific content requirements are included exactly on requested dates
4. Style consistency throughout the plan
5. All ideas align with company identity and target audience`,
system: `You are a skilled social media strategist. Generate brief content ideas following the specified style, frequency, and guidelines. Always output valid JSON with dates as keys and content ideas as values. Respect date-specific requirements and maintain consistent brand voice. Omit any explanations or additional commentary.`
    }
}


export const imagePrompt = ({
    topic,
    imageGuidelines,
    maxLength = 150,
})=>{
    return {
        prompt: `You are an expert at creating detailed prompts for AI image generation. Create a descriptive prompt based on the following inputs:

Topic: ${topic}
Image Guidelines: ${imageGuidelines}

Generate a detailed, descriptive prompt that will result in an image that matches the topic and follows the provided guidelines. Output should be a single string without any explanations or additional formatting.

Example Input 1:
Topic: "Behind the scenes: Annual team building event"
Image Guidelines: "Corporate photography style, natural lighting, candid moments, warm colors, office environment"

Example Output 1:
Professional photograph of diverse team members collaborating in modern office space, natural sunlight through large windows, candid interactions, people smiling and engaging in team activity, warm color palette, subtle depth of field, corporate casual attire, high resolution

Example Input 2:
Topic: "Weird things pets do when nobody's watching"
Image Guidelines: "Cartoon style, vibrant colors, humorous, dynamic composition"

Example Output 2:
Whimsical cartoon illustration of playful cat and dog in living room, cat riding robot vacuum cleaner, dog wearing sunglasses raiding treat jar, vibrant colors, dynamic action poses, funny expressions, clean vector style, white background, centered composition

Example Input 3:
Topic: "Cloud migration success metrics overview"
Image Guidelines: "Minimalist infographic style, blue and white color scheme, professional look"

Example Output 3:
Minimalist tech infographic showing cloud icons and upward trending graphs, clean geometric shapes, professional blue gradient color scheme, white background, balanced composition, subtle drop shadows, modern business style, crisp lines

Generate prompts that are:
- Detailed but concise
- Focused on visual elements
- Clear about style and composition
- Specific about lighting and mood
- Free of technical jargon
- Formatted as a single paragraph`,
        system: `You are an expert at crafting image generation prompts. Convert content ideas into detailed visual descriptions. Focus on composition, style, lighting, and mood. Output a single descriptive string without explanations or formatting. Avoid technical jargon and keep descriptions clear and specific.`,
    }
}

export const optimizeGuidelinesPrompt = ({ guidelines }) => {
    return {
        prompt: `Given the following social media guideline:

"${guidelines}"

Optimize it into a structured content plan that includes:

Post Topics – A series of engaging post ideas based on the guideline.
Captions & Hashtags – Creative caption ideas and relevant hashtags.
Engagement Strategy – Best practices for creating engaging posts, such as storytelling, interactive elements, and user participation techniques.
Ensure the plan is concise, actionable, and aligned with social media best practices`,
        system: `You are a social media strategist. Your task is to turn broad guidelines into clear, structured instructions for creating engaging social media content. Provide specific, creative, and actionable steps to maximize audience engagement.`,
    }
}

export const textToMatchUploadedImagePrompt = ({ imageDescription, guidelines, targetAudience = "adults", style = "casual", maxLength = 280, platform = "Instagram", language = "English"  }) => {
    const platformGuidelines = {
        Instagram: "Visual-first content, use emojis, hashtags, and engaging captions up to 2,200 characters",
        Facebook: "Longer form content, focus on community engagement, support rich media",
        LinkedIn: "Professional tone, industry insights, thought leadership content",
        TikTok: "Trendy, short-form content, focus on entertainment and engagement",
        X: "Concise messaging, trending topics, hashtags, limited to 280 characters"
    };

    const maxLengthPlatforms = {
        Instagram: 280,
        Facebook: 400,
        LinkedIn: 1000,
        TikTok: 280,
        X: 280
    };

    const languageInstructions = {
        English: {
            instruction: "Write the content in English using natural, fluent language",
            direction: "left-to-right"
        },
        Hebrew: {
            instruction: "Write the content in Hebrew using proper Hebrew grammar and RTL text",
            direction: "right-to-left"
        }
    };

    const currentLang = languageInstructions[language] || languageInstructions.English;

    return {
       
        prompt: `
        Generate a social media post which will be posted together with an image with following description:
        ${imageDescription}
        
        Text should be aligned with image message.

        Follow general content guidlines for a series of posts. This post should naturally align with a series, but be unique considering the image.

        General guidelines: ${guidelines}
        
        Post should be tailoredspecifically for ${platform}.
            Style: ${style}
            Target Audience: ${targetAudience}
            Maximum Length: ${maxLengthPlatforms[platform] || maxLength} characters
            Platform Guidelines: ${platformGuidelines[platform] || platformGuidelines.Instagram}
            Language Instructions: ${currentLang.instruction}
            Text Direction: ${currentLang.direction}
            
            The post should be engaging and follow ${platform}'s best practices.
            Return only the JSON object with post, title, and subtitle.`,
            system: `You are a skilled social media content creator specializing in ${platform} content and ${language} language content creation.
            
            Important Language Instructions:
            1. Generate all content in ${language}
            2. Follow ${currentLang.direction} text direction
            3. Use appropriate cultural context for ${language} speakers
            4. Maintain proper grammar and style for ${language}
            5. Keep JSON keys in English: {post, title, subtitle}
            
            Generate engaging posts that follow the platform's best practices and language requirements while maintaining brand voice.
            Always output valid JSON in the format: {post, title, subtitle}.
            The JSON keys must always be in English, but the values should be in ${language}.
            Omit preamble and postamble.`
    }
}