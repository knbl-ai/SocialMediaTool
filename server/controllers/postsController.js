import Post from '../models/Post.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteFiles } from '../config/storage.js';
import { generateImage as generateImageService } from '../services/imageService.js';
import { generateText as generateTextService } from '../services/llmService.js';
import { generateTemplates as generateTemplatesService } from '../services/templateService.js';
import { singlePostPrompt } from '../services/promptsService.js';
import ContentPlanner from '../models/ContentPlanner.js';

export const createPost = async (req, res) => {
  try {
    // Validate date
    const datePost = new Date(req.body.datePost);
    if (isNaN(datePost.getTime())) {
      throw new ApiError(400, 'Invalid date format');
    }

    // Prepare the image object with default values
    const image = req.body.image || {};

    const post = new Post({
      accountId: req.body.accountId,
      platforms: req.body.platforms,
      datePost: datePost,
      timePost: req.body.timePost,
      text: req.body.text || { post: '', title: '', subtitle: '' },
      image: {
        url: image.url || '',
        size: image.size || { width: 0, height: 0 },
        template: image.template || '',
        video: image.video || '',
        videoscreenshot: image.videoscreenshot || ''
      },
      prompts: req.body.prompts || { image: '', video: '', text: '' },
      models: req.body.models || { image: '', video: '', text: '' }
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'ValidationError') {
      throw new ApiError(400, `Validation error: ${error.message}`);
    }
    throw new ApiError(500, `Failed to create post: ${error.message}`);
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  
  // Get the old post
  const oldPost = await Post.findById(id);
  if (!oldPost) {
    throw ApiError.notFound('Post not found');
  }

  // If datePost is provided, ensure it's a valid date
  let datePost = req.body.datePost;
  if (datePost) {
    // Just parse the ISO string to ensure it's valid
    const date = new Date(datePost);
    if (isNaN(date.getTime())) {
      throw new ApiError(400, 'Invalid date format');
    }
    // Use the ISO string as is, since it's already in UTC format from the client
    datePost = date.toISOString();
  }

  // Prepare the image object with videoscreenshot if provided
  const image = req.body.image || {};
  
  // Update the post
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      $set: {
        platforms: req.body.platforms,
        datePost: datePost,
        timePost: req.body.timePost,
        text: req.body.text,
        image: {
          url: image.url,
          size: image.size,
          template: image.template,
          video: image.video,
          videoscreenshot: image.videoscreenshot
        },
        prompts: req.body.prompts,
        models: req.body.models,
        templatesUrls: req.body.templatesUrls,
        updatedAt: new Date(),
        status: req.body.status
      }
    },
    { new: true, runValidators: true }
  );

  if (!updatedPost) {
    throw ApiError.notFound('Post not found');
  }

  res.json(updatedPost);
};

export const getPost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  res.json(post);
};

export const searchPosts = async (req, res) => {
  const { accountId, startDate, endDate, platform } = req.query;
  
  const query = { accountId };
  
  if (startDate || endDate) {
    query.datePost = {};
    if (startDate) query.datePost.$gte = new Date(startDate);
    if (endDate) query.datePost.$lte = new Date(endDate);
  }
  
  if (platform) {
    query.platforms = platform;
  }

  const posts = await Post.find(query).sort({ datePost: 1 });
  res.json(posts);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  // Delete template files if they exist
  if (post.templatesUrls?.length > 0) {
    await deleteFiles(post.templatesUrls).catch(error => {
      console.error('Error deleting template files:', error);
    });
  }

  // Delete the post
  await Post.findByIdAndDelete(id);

  res.status(204).send();
};

export const generateImage = async (req, res) => {
  try {
    const { prompt, model, width, height, accountId } = req.body;
    
    if (!process.env.FAL_KEY) {
      throw new ApiError(500, 'FAL_KEY is not configured');
    }
   
    const imageUrl = await generateImageService({
      prompt,
      model,
      width,
      height
    });

    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to generate image: ${error.message}`);
  }
};

export const generateText = async (req, res) => {
  try {
    let { prompt, model, accountId } = req.body;

    const contentPlanner = await ContentPlanner.findOne({ accountId });

    const { system } = singlePostPrompt({
      topic: prompt,
      language: contentPlanner.language
    });

    prompt = singlePostPrompt({
      topic: prompt,
      model
    }).prompt
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new ApiError(500, 'ANTHROPIC_API_KEY is not configured');
    }
    
    const generatedText = await generateTextService({
      topic: prompt,
      model,
      system
    });

    res.json(generatedText);
  } catch (error) {
    console.error('Error generating text:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to generate text: ${error.message}`);
  }
};

export const generateTemplates = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      throw ApiError.notFound('Post not found');
    }

    // Delete old templates if they exist
    if (post.templatesUrls?.length > 0) {
      await deleteFiles(post.templatesUrls).catch(error => {
        console.error('Error deleting old templates:', error);
      });
    }

    const templates = await generateTemplatesService({
      post,
      accountId: post.accountId
    });

    // Get template URLs from results
    const newTemplateUrls = templates.results.map(template => template.imageUrl);

    // Update post with new template URLs
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $set: {
          templatesUrls: newTemplateUrls
        }
      },
      { new: true }
    );

    res.json(updatedPost);
  } catch (error) {
    console.error('Error generating templates:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to generate templates: ${error.message}`);
  }
};

// Clear all posts for a month
export const clearMonthPosts = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate } = req.body;

    // Delete all posts for the specified month and account
    const result = await Post.deleteMany({
      accountId,
      datePost: {
        $gte: startDate,
        $lte: endDate
      }
    });

    res.json({
      message: 'Posts cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

// Add a new function to generate video and take screenshot
export const generateVideo = async (req, res) => {
  try {
    const { prompt, model, size, accountId } = req.body;
    
    if (!process.env.FAL_KEY) {
      throw new ApiError(500, 'FAL_KEY is not configured');
    }

    // Validate size parameter
    if (!size || !size.width || !size.height) {
      throw new ApiError(400, 'Size with valid width and height properties is required');
    }

    // Ensure width and height are numbers
    const width = parseInt(size.width);
    const height = parseInt(size.height);
    
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      throw new ApiError(400, 'Width and height must be positive numbers');
    }
   
    // Import the textToVideo function from videoService
    const { textToVideo } = await import('../services/videoService.js');
    
    // Generate video and get both video URL and screenshot URL
    const { videoUrl, screenshotUrl } = await textToVideo(prompt, model, { 
      size: { width, height } 
    });

    res.json({ 
      videoUrl, 
      screenshotUrl 
    });
  } catch (error) {
    console.error('Error generating video:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to generate video: ${error.message}`);
  }
};
