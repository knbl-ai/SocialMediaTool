import ContentPlanner from '../models/ContentPlanner.js';
import Account from '../models/Account.js';
import Post from '../models/Post.js';
import { contentPlanPrompt, singlePostPrompt, imagePrompt, textToMatchUploadedImagePrompt } from './promptsService.js';
import { generateText } from './llmService.js';
import { generateImage } from './imageService.js';
import { generateTemplates } from './templateService.js';

const getEndDate = (startDate, duration) => {
  const start = new Date(startDate);
  
  if (duration === 'week') {
    return new Date(start.setDate(start.getDate() + 7));
  } else if (duration === 'month') {
    // Get the last day of the current month
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    return new Date(start.setDate(start.getDate() + lastDay));
  }
  
  throw new Error('Invalid duration specified');
};

export const createContentPlanner = async (accountId) => {
  try {
    const contentPlanner = new ContentPlanner({
      accountId
    });
    return await contentPlanner.save();
  } catch (error) {
    console.error('Error creating content planner:', error);
    throw error;
  }
};

export const getContentPlannerByAccountId = async (accountId) => {
  return await ContentPlanner.findOne({ accountId });
};

export const updateContentPlanner = async (accountId, updates) => {
  return await ContentPlanner.findOneAndUpdate(
    { accountId },
    updates,
    { new: true, runValidators: true }
  );
};

const generatePostContent = async (topic, contentPlanner, platform) => {
  // Generate post text with platform-specific prompt
  const textPromptData = {
    topic,
    targetAudience: contentPlanner.audience,
    style: contentPlanner.voice,
    platform,
    language: contentPlanner.language || 'English'
  };
  const { prompt: textPrompt, system: textSystem } = singlePostPrompt(textPromptData);
  const textContent = await generateText({
    topic: textPrompt,
    system: textSystem,
    model: contentPlanner.llm,
    responseFormat: 'json'
  });

  // Generate image prompt
  const imagePromptData = {
    topic,
    imageGuidelines: contentPlanner.imageGuidelines
  };
  const { prompt: imgPrompt, system: imgSystem } = imagePrompt(imagePromptData);
  const imagePromptResult = await generateText({
    topic: imgPrompt,
    system: imgSystem,
    model: contentPlanner.llm,
    responseFormat: 'text'
  });

  // Generate image if image model is specified
  let imageUrl = '';
  if (contentPlanner.imageModel !== 'no_images') {
    imageUrl = await generateImage({
      prompt: imagePromptResult,
      model: contentPlanner.imageModel
    });
  }

  return {
    textContent,
    imagePromptResult,
    imageUrl
  };
};

const createPost = async (date, topic, contentPlanner, generatedContent, platforms, imageDimensions) => {
  try {
    // Ensure date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date provided');
    }

    // Create the post
    const post = new Post({
      accountId: contentPlanner.accountId,
      platforms,
      templatesUrls: [],
      datePost: date,
      timePost: `${contentPlanner.postingTime.toString().padStart(2, '0')}`,
      image: {
        url: generatedContent.imageUrl,
        template: generatedContent.imageUrl,
        ...imageDimensions
      },
      text: {
        post: generatedContent.textContent.post,
        title: generatedContent.textContent.title,
        subtitle: generatedContent.textContent.subtitle
      },
      prompts: {
        image: generatedContent.imagePromptResult,
        video: '',
        text: topic
      },
      models: {
        image: contentPlanner.imageModel,
        text: contentPlanner.llm,
        video: ''
      }
    });

    const savedPost = await post.save();

    // Generate templates if we have an image
    if (savedPost.image?.url) {
      try {
        const templates = await generateTemplates({
          post: savedPost,
          accountId: contentPlanner.accountId
        });

        // Update post with template URLs
        if (templates?.results) {
          const templateUrls = templates.results.map(template => template.imageUrl);
          savedPost.templatesUrls = templateUrls;
          await savedPost.save();
        }
      } catch (error) {
        console.error('Error generating templates for post:', error);
        // Continue with post creation even if template generation fails
      }
    }

    return savedPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const generateContentPlan = async (accountId) => {
  try {
    // Get account and content planner data
    const [account, contentPlanner] = await Promise.all([
      Account.findById(accountId),
      ContentPlanner.findOne({ accountId })
    ]);

    if (!account || !contentPlanner) {
      throw new Error('Account or content planner not found');
    }

    const endDate = getEndDate(contentPlanner.date, contentPlanner.duration);

    // Prepare prompt data
    const promptData = {
      accountName: account.name,
      accountReview: account.accountReview,
      audience: contentPlanner.audience,
      guidelines: contentPlanner.textGuidelines,
      startDate: contentPlanner.date.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      frequency: contentPlanner.frequency,
      voice: contentPlanner.voice
    };

    // Generate content plan using LLM
    const { prompt, system } = contentPlanPrompt(promptData);
    const contentPlan = await generateText({
      topic: prompt,
      system,
      model: contentPlanner.llm,
      responseFormat: 'json',
      isContentPlan: true
    });

    // Validate that we got a valid content plan
    if (!contentPlan || Object.keys(contentPlan).length === 0) {
      throw new Error('Failed to generate valid content plan');
    }

    // Save content plan to database
    await ContentPlanner.findOneAndUpdate(
      { accountId },
      { contentPlanJSON: JSON.stringify(contentPlan) },
      { new: true }
    );

    // Generate posts for each date and platform in the content plan
    const generatedPosts = [];
    for (const [dateStr, topic] of Object.entries(contentPlan)) {
      try {
        // Validate date format
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.error(`Invalid date format for: ${dateStr}, skipping...`);
          continue;
        }
        
        // Generate posts for each platform
        for (const platform of contentPlanner.platforms) {
          try {
            // Set platform-specific image dimensions
            const imageDimensions = platform === 'Instagram' 
              ? { width: 1024, height: 1024, dimensions: 'Square' }
              : { width: 1024, height: 960, dimensions: 'Horizontal' };

            // Generate platform-specific content
            const generatedContent = await generatePostContent(topic, contentPlanner, platform);
            
            // Create post with platform-specific settings
            const post = await createPost(
              date, 
              topic, 
              contentPlanner, 
              generatedContent,
              [platform], // Pass platform as array for platforms field
              imageDimensions
            );
            
            if (post) {
              generatedPosts.push(post);
            }
          } catch (platformError) {
            console.error(`Error generating post for platform ${platform}:`, platformError);
            // Continue with next platform
          }
        }
      } catch (dateError) {
        console.error(`Error processing date ${dateStr}:`, dateError);
        // Continue with next date
      }
    }

    return { 
      message: 'ContentPlanSaved:ok',
      posts: generatedPosts 
    };
  } catch (error) {
    console.error('Error generating content plan:', error);
    throw error;
  }
};

export const generateContentPlanFromUploadedImages = async (accountId) => {
  try {
    // Get content planner data
    const contentPlanner = await ContentPlanner.findOne({ accountId });
    if (!contentPlanner) {
      throw new Error('Content planner not found');
    }

    // Calculate dates for each post based on frequency and start date
    const startDate = new Date(contentPlanner.date);
    const postDates = contentPlanner.uploadedImages.map((_, index) => {
      const postDate = new Date(startDate);
      postDate.setDate(startDate.getDate() + (index * contentPlanner.frequency));
      return postDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    });

    // Create date-description mapping
    const dateDescriptionMap = {};
    contentPlanner.uploadedImages.forEach((image, index) => {
      dateDescriptionMap[postDates[index]] = image.imageDescription;
    });

    const generatedPosts = [];

    // Generate posts for each date
    for (const [date, imageDescription] of Object.entries(dateDescriptionMap)) {
      const matchingImage = contentPlanner.uploadedImages.find(
        img => img.imageDescription === imageDescription
      );

      // Get prompt for text generation
      const { prompt, system } = textToMatchUploadedImagePrompt({
        imageDescription,
        guidelines: contentPlanner.textGuidelines,
        targetAudience: contentPlanner.audience,
        style: contentPlanner.voice,
        platform: contentPlanner.platforms[0],
        language: contentPlanner.language
      });

      // Generate text content with proper parameters
      const generatedContent = await generateText({
        topic: prompt,
        system,
        model: contentPlanner.llm,
        temperature: contentPlanner.creativity
      });

      // Create new post
      const post = new Post({
        accountId,
        datePost: new Date(date),
        platforms: contentPlanner.platforms,
        image: {
          url: matchingImage.imageUrl,
          size: {
            width: 1024,
            height: 1024
          },
          dimensions: 'Square',  // Default to Square for Instagram-like format
          template: matchingImage.imageUrl  // Add the same URL as template
        },
        text: {
          post: generatedContent.post,
          title: generatedContent.title,
          subtitle: generatedContent.subtitle
        },
        prompts: {
          text: prompt
        },
        models: {
          text: contentPlanner.llm
        },
        timePost: contentPlanner.postingTime.toString(),
        language: contentPlanner.language
      });

      await post.save();
      generatedPosts.push(post);
    }

    return { 
      message: 'ContentPlanSaved:ok',
      posts: generatedPosts 
    };
  } catch (error) {
    console.error('Error generating content plan from uploaded images:', error);
    throw error;
  }
}; 