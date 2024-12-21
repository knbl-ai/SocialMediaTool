import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

// Default post structure
const DEFAULT_POST = {
  platforms: [],
  timePost: "10:00",
  image: {
    url: '',
    size: { width: 0, height: 0 },
    template: ''
  },
  text: {
    post: '',
    title: '',
    subtitle: ''
  },
  prompts: {
    image: '',
    video: '',
    text: ''
  },
  models: {
    image: '',
    video: '',
    text: ''
  }
};

// Helper to parse and validate date
const parseDate = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date;
};

// Helper to create date range
const createDateRange = (dateStr) => {
  const date = parseDate(dateStr);
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

// Search for posts
router.get('/search', async (req, res) => {
  const session = await Post.startSession();
  session.startTransaction();
  
  try {
    const { accountId, startDate, endDate, platform, createIfNotFound } = req.query;
    console.log('Search params:', { accountId, startDate, endDate, platform, createIfNotFound });
    
    if (!accountId) {
      throw new Error('accountId is required');
    }
    
    // Build date range query
    const query = { accountId };
    
    if (startDate || endDate) {
      query.datePost = {};
      if (startDate) {
        query.datePost.$gte = parseDate(startDate);
      }
      if (endDate) {
        query.datePost.$lte = parseDate(endDate);
      }
    }
    
    if (platform) {
      query.platforms = platform;
    }
    
    console.log('Search query:', query);
    let posts = await Post.find(query).session(session);

    // If createIfNotFound is true and no posts found, create a new one
    if (createIfNotFound === 'true' && posts.length === 0 && startDate && platform) {
      console.log('No post found, creating new one');
      const newPost = await Post.create([{
        ...DEFAULT_POST,
        accountId,
        platforms: [platform],
        datePost: parseDate(startDate)
      }], { session });
      posts = [newPost[0]];
    }
    
    await session.commitTransaction();
    res.json(posts);
  } catch (error) {
    await session.abortTransaction();
    console.error('Search error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Create new post
router.post('/', async (req, res) => {
  try {
    console.log('Creating post with data:', req.body);
    
    if (!req.body.accountId) {
      throw new Error('accountId is required');
    }
    
    if (!req.body.datePost) {
      throw new Error('datePost is required');
    }

    const post = new Post({
      ...DEFAULT_POST,
      ...req.body,
      datePost: parseDate(req.body.datePost)
    });

    const savedPost = await post.save();
    console.log('Created post:', savedPost);
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Create error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update post
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating post:', req.params.id, req.body);
    
    if (req.body.datePost) {
      req.body.datePost = parseDate(req.body.datePost);
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log('Updated post:', post);
    res.json(post);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
