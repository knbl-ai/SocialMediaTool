import ContentPlanner from '../models/ContentPlanner.js';
import Account from '../models/Account.js';
import Post from '../models/Post.js';
import { contentPlanPrompt, singlePostPrompt, imagePrompt, textToMatchUploadedImagePrompt } from './promptsService.js';
import { generateText } from './llmService.js';
import { generateImage } from './imageService.js';
import { generateTemplates } from './templateService.js';
import { resizeForPlatform, determineImageDimensions } from '../utils/imageProcessor.js';
import { uploadImage } from '../config/storage.js';

const getEndDate = (startDate, duration) => {
  const start = new Date(startDate);
  // Adjust for timezone offset (subtract instead of add to move forward)
  start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
  
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

const generatePostContent = async (topic, contentPlanner, platforms, { size }) => {
  // Generate post text with platform-specific prompt
  const textPromptData = {
    topic,
    targetAudience: contentPlanner.audience,
    style: contentPlanner.voice,
    platform: platforms[0], // Use first platform for text generation
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

  // Generate base image if image model is specified
  let baseImageUrl = '';
  if (contentPlanner.imageModel !== 'no_images') {
    baseImageUrl = await generateImage({
      prompt: imagePromptResult,
      model: contentPlanner.imageModel,
      width: size.width,
      height: size.height
    });
  }

  return {
    textContent,
    imagePromptResult,
    baseImageUrl
  };
};

const createPosts = async (date, topic, contentPlanner, generatedContent, platforms) => {
  try {
    const posts = [];
    const { baseImageUrl } = generatedContent;

    // Process each platform
    for (const platform of platforms) {
      try {
        let imageUrl = baseImageUrl;
        let dimensions;

        // Resize image for specific platform if needed
        if (baseImageUrl) {
          const resizedImage = await resizeForPlatform(baseImageUrl, platform);
          
          // Create a unique filename for this image
          const fileName = `${Date.now()}-${platform}-${Math.random().toString(36).substring(7)}.jpg`;
          
          // Upload resized image directly using the buffer
          imageUrl = await uploadImage({
            buffer: resizedImage.buffer,
            originalname: fileName,
            mimetype: resizedImage.contentType
          });
        }

        // Set dimensions based on platform
        switch (platform) {
          case 'Instagram':
            dimensions = { width: 1080, height: 1080, type: 'Square' };
            break;
          case 'TikTok':
            dimensions = { width: 1080, height: 1920, type: 'Story' };
            break;
          default:
            dimensions = { width: 1200, height: 960, type: 'Horizontal' };
        }

        // Create post for this platform
        const post = new Post({
          accountId: contentPlanner.accountId,
          platforms: [platform],
          templatesUrls: [],
          datePost: date,
          timePost: `${contentPlanner.postingTime.toString().padStart(2, '0')}`,
          image: {
            url: imageUrl,
            template: imageUrl,
            size: {
              width: dimensions.width,
              height: dimensions.height
            },
            dimensions: dimensions.type
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

            if (templates?.results) {
              savedPost.templatesUrls = templates.results.map(template => template.imageUrl);
              await savedPost.save();
            }
          } catch (error) {
            console.error('Error generating templates for post:', error);
          }
        }

        posts.push(savedPost);
      } catch (platformError) {
        console.error(`Error creating post for platform ${platform}:`, platformError);
      }
    }

    return posts;
  } catch (error) {
    console.error('Error creating posts:', error);
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
    const startDate = new Date(contentPlanner.date);
    // Adjust for timezone offset (subtract instead of add to move forward)
    startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
    
    const promptData = {
      accountName: account.name,
      accountReview: account.accountReview,
      audience: contentPlanner.audience,
      guidelines: contentPlanner.textGuidelines,
      startDate: startDate.toISOString().split('T')[0],
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

    // Validate content plan
    if (!contentPlan || Object.keys(contentPlan).length === 0) {
      throw new Error('Failed to generate valid content plan');
    }

    // Save content plan
    await ContentPlanner.findOneAndUpdate(
      { accountId },
      { contentPlanJSON: JSON.stringify(contentPlan) },
      { new: true }
    );

    // Generate posts for each date in the content plan
    const generatedPosts = [];
    for (const [dateStr, topic] of Object.entries(contentPlan)) {
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.error(`Invalid date format for: ${dateStr}, skipping...`);
          continue;
        }

        // Adjust date for local timezone (subtract instead of add to move forward)
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

        // Determine optimal image dimensions based on platforms
        const size = determineImageDimensions(contentPlanner.platforms);

        // Generate content once for all platforms
        const generatedContent = await generatePostContent(
          topic,
          contentPlanner,
          contentPlanner.platforms,
          { size }
        );

        // Create posts for all platforms
        const posts = await createPosts(
          date,
          topic,
          contentPlanner,
          generatedContent,
          contentPlanner.platforms
        );

        generatedPosts.push(...posts);
      } catch (dateError) {
        console.error(`Error processing date ${dateStr}:`, dateError);
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
    // Adjust for timezone offset
    startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
    
    const frequency = contentPlanner.frequency;

    // Calculate how many dates we need based on images and platforms
    const totalPosts = contentPlanner.uploadedImages.length * contentPlanner.platforms.length;
    let currentDate = new Date(startDate);

    // Generate enough dates for all posts
    while (dates.length < totalPosts) {
      const newDate = new Date(currentDate);
      dates.push(newDate);
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