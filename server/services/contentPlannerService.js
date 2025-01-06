import ContentPlanner from '../models/ContentPlanner.js';
import Account from '../models/Account.js';
import Post from '../models/Post.js';
import { contentPlanPrompt, singlePostPrompt, imagePrompt } from './promptsService.js';
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

const generatePostContent = async (topic, contentPlanner) => {
  // Generate post text
  const textPromptData = {
    topic,
    targetAudience: contentPlanner.audience,
    style: contentPlanner.voice
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

const createPost = async (date, topic, contentPlanner, generatedContent) => {
  // Create the post
  const post = new Post({
    accountId: contentPlanner.accountId,
    platforms: contentPlanner.platforms,
    templatesUrls: [],
    datePost: date,
    timePost: `${contentPlanner.postingTime.toString().padStart(2, '0')}`,
    image: {
      url: generatedContent.imageUrl,
      template: generatedContent.imageUrl,
      dimensions: 'Square',
      size: {
        width: 1280,
        height: 1280
      }
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
      responseFormat: 'json'
    });

    // Save content plan to database
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
        const generatedContent = await generatePostContent(topic, contentPlanner);
        const post = await createPost(date, topic, contentPlanner, generatedContent);
        generatedPosts.push(post);
      } catch (error) {
        console.error(`Error generating post for ${dateStr}:`, error);
        // Continue with next post even if one fails
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