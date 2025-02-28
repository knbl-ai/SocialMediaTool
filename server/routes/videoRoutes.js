import express from 'express';
import { auth } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { generateVideo } from '../controllers/postsController.js';
import { imageToVideo } from '../services/videoService.js';
import Post from '../models/Post.js';

const router = express.Router();

// Generate video from text
router.post('/generate', auth, generateVideo);

// Generate video from image
router.post('/generate-from-image', auth, async (req, res, next) => {
  try {
    const { prompt, model, imageUrl, size, postId } = req.body;

    if (!prompt || !model || !imageUrl) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Generate video and get both video URL and screenshot URL
    const { videoUrl, screenshotUrl, requestId } = await imageToVideo(prompt, model, imageUrl, { size });
    
    // Update post with video URL and screenshot URL if postId is provided
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        throw new ApiError(404, 'Post not found');
      }

      // Preserve all existing image fields and only update the video URL and screenshot URL
      await Post.findByIdAndUpdate(
        postId,
        {
          $set: {
            'image.video': videoUrl,
            'image.videoscreenshot': screenshotUrl,
            'prompts.video': prompt,
            'models.video': model
          }
        },
        { new: true }
      );
    }

    res.json({ 
      success: true,
      videoUrl,
      screenshotUrl,
      requestId
    });
  } catch (error) {
    next(error);
  }
});

export default router; 