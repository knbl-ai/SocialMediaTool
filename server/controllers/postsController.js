import Post from '../models/Post.js';
import { ApiError } from '../utils/ApiError.js';

export const createPost = async (req, res) => {
  const post = new Post({
    accountId: req.body.accountId,
    platforms: req.body.platforms,
    datePost: req.body.datePost,
    timePost: req.body.timePost,
    models: req.body.models || {
      image: '',
      video: '',
      text: ''
    }
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
