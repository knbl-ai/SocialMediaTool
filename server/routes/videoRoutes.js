import express from 'express';
import { auth } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { generateVideo } from '../controllers/postsController.js';
import Post from '../models/Post.js';

const router = express.Router();

// Route for generating video from text or image
router.post('/generate', auth, generateVideo);

// Legacy route for backward compatibility - can be removed later
router.post('/generate-from-image', auth, async (req, res) => {
  try {
    const { prompt, model, imageUrl, postId } = req.body;
    
    // Validate required fields
    if (!prompt || !model || !imageUrl) {
      throw new ApiError(400, 'Missing required fields: prompt, model, and imageUrl are required');
    }
    
    // Forward to the main generateVideo controller with imageUrl
    req.body = { ...req.body, imageUrl };
    return generateVideo(req, res);
  } catch (error) {
    console.error('Error generating video from image:', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: `Failed to generate video: ${error.message}` });
    }
  }
});

export default router; 