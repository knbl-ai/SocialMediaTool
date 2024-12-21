import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

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
    const { accountId, date, platform } = req.query;
    console.log('Search params:', { accountId, date, platform });
    
    if (!accountId) {
      throw new Error('accountId is required');
    }
    
    if (!date) {
      throw new Error('date is required');
    }
    
    // Try to find existing post
    const { startDate, endDate } = createDateRange(date);
    const query = {
      accountId,
      datePost: { $gte: startDate, $lte: endDate }
    };
    
    if (platform) {
      query.platforms = platform;
    }
    
    console.log('Search query:', query);
    let post = await Post.findOne(query).session(session);
    
    if (!post) {
      console.log('No post found, creating new one');
      post = await Post.create([{
        accountId,
        platforms: platform ? [platform] : [],
        datePost: parseDate(date),
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
      }], { session });
      post = post[0];
    }
    
    await session.commitTransaction();
    res.json([post]); // Return as array for consistency
  } catch (error) {
    await session.abortTransaction();
    console.error('Search/create error:', error);
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
      accountId: req.body.accountId,
      platforms: req.body.platforms || [],
      datePost: parseDate(req.body.datePost),
      timePost: req.body.timePost || "10:00",
      image: req.body.image || {
        url: '',
        size: { width: 0, height: 0 },
        template: ''
      },
      text: req.body.text || {
        post: '',
        title: '',
        subtitle: ''
      },
      prompts: req.body.prompts || {
        image: '',
        video: '',
        text: ''
      },
      models: {
        image: req.body.models?.image || '',
        video: req.body.models?.video || '',
        text: req.body.models?.text || ''
      }
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
