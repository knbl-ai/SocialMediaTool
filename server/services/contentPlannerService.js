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

const generatePostContent = async (topic, contentPlanner, platform, { size }) => {
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
    console.log('Generating image with size:', size);
    imageUrl = await generateImage({
      prompt: imagePromptResult,
      model: contentPlanner.imageModel,
      width: size.width,
      height: size.height
    });
  }

  return {
    textContent,
    imagePromptResult,
    imageUrl
  };
};

const createPost = async (date, topic, contentPlanner, generatedContent, platforms, { size, dimensions }) => {
  try {
    // Ensure date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date provided');
    }

    // Validate size
    if (!size || !size.width || !size.height) {
      throw new Error('Invalid image size provided');
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
        size: {
          width: size.width,
          height: size.height
        },
        dimensions: dimensions || 'Square'
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
            let size;
            let dimensions;

            switch (platform) {
              case 'Instagram':
                size = { width: 1080, height: 1080 };
                dimensions = 'Square';
                break;
              case 'Facebook':
                size = { width: 1200, height: 960 };
                dimensions = 'Horizontal';
                break;
              case 'LinkedIn':
                size = { width: 1200, height: 960 };
                dimensions = 'Horizontal';
                break;
              case 'TikTok':
                size = { width: 1080, height: 1920 };
                dimensions = 'Story';
                break;
              case 'X':
                size = { width: 1200, height: 960 };
                dimensions = 'Horizontal';
                break;
              default:
                size = { width: 1080, height: 1080 };
                dimensions = 'Square';
            }

            // Generate platform-specific content
            const generatedContent = await generatePostContent(
              topic, 
              contentPlanner, 
              platform,
              { size }
            );
           
            // Create post with platform-specific settings
            const post = await createPost(
              date, 
              topic, 
              contentPlanner, 
              generatedContent,
              [platform],
              { size, dimensions }
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

    // Validate uploaded images
    if (!contentPlanner.uploadedImages || contentPlanner.uploadedImages.length === 0) {
      throw new Error('No images uploaded');
    }

    // Calculate dates based on the number of images and platforms
    const dates = [];
    const startDate = new Date(contentPlanner.date);
    const frequency = contentPlanner.frequency;

    // Calculate how many dates we need based on images and platforms
    const totalPosts = contentPlanner.uploadedImages.length * contentPlanner.platforms.length;
    let currentDate = new Date(startDate);

    // Generate enough dates for all posts
    while (dates.length < totalPosts) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + frequency);
    }

    const generatedPosts = [];

    // Generate posts for each image
    for (let i = 0; i < contentPlanner.uploadedImages.length; i++) {
      const { imageUrl, imageDescription } = contentPlanner.uploadedImages[i];
      const date = dates[i];

      // Generate text content for the image
      const { prompt, system } = textToMatchUploadedImagePrompt({
        imageDescription,
        guidelines: contentPlanner.textGuidelines,
        targetAudience: contentPlanner.audience,
        style: contentPlanner.voice,
        language: contentPlanner.language
      });

      const textContent = await generateText({
        topic: prompt,
        system,
        model: contentPlanner.llm,
        responseFormat: 'json'
      });

      // Create posts for each platform
      for (const platform of contentPlanner.platforms) {
        try {
          // Set platform-specific image dimensions
          let imageDimensions = { size: { width: 1080, height: 1080 } };
          if (platform === 'Instagram') {
            imageDimensions = { size: { width: 1080, height: 1080 } };
          } else if (platform === 'Facebook') {
            imageDimensions = { size: { width: 1200, height: 630 } };
          } else if (platform === 'LinkedIn') {
            imageDimensions = { size: { width: 1200, height: 627 } };
          } else if (platform === 'TikTok') {
            imageDimensions = { size: { width: 1080, height: 1920 } };
          } else if (platform === 'X') {
            imageDimensions = { size: { width: 1200, height: 675 } };
          }

          // Create post
          const post = new Post({
            accountId: contentPlanner.accountId,
            platforms: [platform],
            templatesUrls: [],
            datePost: date,
            timePost: `${contentPlanner.postingTime.toString().padStart(2, '0')}`,
            image: {
              url: imageUrl,
              template: imageUrl,
              ...imageDimensions
            },
            text: {
              post: textContent.post,
              title: textContent.title,
              subtitle: textContent.subtitle
            },
            prompts: {
              image: imageDescription,
              text: textContent.post
            },
            models: {
              text: contentPlanner.llm
            }
          });

          const savedPost = await post.save();

          // Generate templates if template option is enabled and we have both image and text
          if (savedPost.image?.url && savedPost.text?.title && savedPost.text?.subtitle) {
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

          generatedPosts.push(savedPost);
        } catch (platformError) {
          console.error(`Error generating post for platform ${platform}:`, platformError);
          // Continue with next platform
        }
      }
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