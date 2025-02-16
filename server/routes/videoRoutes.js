import express from 'express';
import { textToVideo, imageToVideo } from '../services/videoService.js';
import Post from '../models/Post.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

router.post('/generate', async (req, res, next) => {
  try {
    const { prompt, model, imageUrl, size, postId } = req.body;

    if (!prompt) {
      throw new ApiError(400, 'Prompt is required');
    }
    if (!model) {
      throw new ApiError(400, 'Model ID is required');
    }
    if (!size || !size.width || !size.height) {
      throw new ApiError(400, 'Size with width and height is required');
    }
    if (!postId) {
      throw new ApiError(400, 'Post ID is required');
    }

    // Choose generation method based on imageUrl presence
    const result = imageUrl ? 
      await imageToVideo(prompt, model, imageUrl, { size }) :
      await textToVideo(prompt, model, { size });

    // Update post with video URL
    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Preserve all existing image fields and only update the video URL
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          'image.video': result.data.video.url,
          'prompts.video': prompt,
          'models.video': model
        }
      },
      { new: true }
    );

    res.json({ 
      success: true,
      videoUrl: result.data.video.url,
      requestId: result.requestId 
    });
  } catch (error) {
    next(error);
  }
});

export default router; 