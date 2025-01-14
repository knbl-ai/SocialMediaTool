import Post from '../models/Post.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteFiles } from '../config/storage.js';
import { generateImage as generateImageService } from '../services/imageService.js';
import { generateText as generateTextService } from '../services/llmService.js';
import { generateTemplates as generateTemplatesService } from '../services/templateService.js';
import { singlePostPrompt } from '../services/promptsService.js';

export const createPost = async (req, res) => {
  try {
    // Validate date
    const datePost = new Date(req.body.datePost);
    if (isNaN(datePost.getTime())) {
      throw new ApiError(400, 'Invalid date format');
    }

    const post = new Post({
      accountId: req.body.accountId,
      platforms: req.body.platforms,
      datePost: datePost,
      timePost: req.body.timePost,
      text: req.body.text || { post: '', title: '', subtitle: '' },
      image: req.body.image || { url: '', size: { width: 0, height: 0 }, template: '' },
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

  // Update the post
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      $set: {
        platforms: req.body.platforms,
        datePost: req.body.datePost,
        timePost: req.body.timePost,
        text: req.body.text,
        image: req.body.image,
        prompts: req.body.prompts,
        models: req.body.models,
        templatesUrls: req.body.templatesUrls,
        updatedAt: new Date()
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
    const { prompt, model, width, height } = req.body;
    
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
    let { prompt, model } = req.body;

    const { system } = singlePostPrompt({
      topic: prompt,
  
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
