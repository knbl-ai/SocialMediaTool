import Post from '../models/Post.js';
import { ApiError } from '../utils/ApiError.js';
import { generateImage as generateImageService } from '../services/imageService.js';
import { generateText as generateTextService } from '../services/llmService.js';

export const createPost = async (req, res) => {
  const post = new Post({
    accountId: req.body.accountId,
    platforms: req.body.platforms,
    datePost: req.body.datePost,
    timePost: req.body.timePost,
    text: req.body.text || { post: '', title: '', subtitle: '' },
    image: req.body.image || { url: '', size: { width: 0, height: 0 }, template: '' },
    prompts: req.body.prompts || { image: '', video: '', text: '' },
    models: req.body.models || { image: '', video: '', text: '' }
  });

  const savedPost = await post.save();
  res.status(201).json(savedPost);
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
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
  const post = await Post.findByIdAndDelete(id);
  
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

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
    const { prompt, model } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new ApiError(500, 'ANTHROPIC_API_KEY is not configured');
    }
    
    const generatedText = await generateTextService({
      prompt,
      model
    });

    res.json({ text: generatedText });
  } catch (error) {
    console.error('Error generating text:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to generate text: ${error.message}`);
  }
};
