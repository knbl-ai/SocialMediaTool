import express from 'express';
import Joi from 'joi';
import { validateRequest, schemas } from '../middleware/validateRequest.js';
import { auth } from '../middleware/auth.js';
import {
  createPost,
  updatePost,
  getPost,
  searchPosts,
  deletePost,
  generateImage,
  generateText,
  generateTemplates
} from '../controllers/postsController.js';
import { ApiError } from '../utils/ApiError.js';
import Post from '../models/Post.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Search posts with pagination and date range validation
router.get('/search', 
  validateRequest(Joi.object({
    query: Joi.object({
      accountId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      platform: Joi.string(),
      ...schemas.query.pagination.query,
      ...schemas.query.dateRange.query
    })
  })),
  searchPosts
);

// Get single post
router.get('/:id',
  validateRequest(schemas.id),
  getPost
);

// Create new post
router.post('/',
  validateRequest(schemas.post),
  createPost
);

// Update post
router.put('/:id',
  validateRequest(Joi.object({
    ...schemas.id.describe().keys,
    body: schemas.post.describe().keys.body
  })),
  updatePost
);

// Delete post
router.delete('/:id',
  validateRequest(schemas.id),
  deletePost
);

// Generate image
router.post('/generate-image',
  validateRequest(Joi.object({
    body: Joi.object({
      prompt: Joi.string().required(),
      model: Joi.string().required(),
      width: Joi.number().required(),
      height: Joi.number().required()
    })
  })),
  generateImage
);

// Generate text
router.post('/generate-text',
  validateRequest(Joi.object({
    body: Joi.object({
      prompt: Joi.string().required(),
      model: Joi.string().required()
    })
  })),
  generateText
);

// Generate templates for a post
router.post('/:id/generate-templates',
  validateRequest(schemas.id),
  generateTemplates
);

// Add new PATCH endpoint for updating specific fields
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { image } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Only update showVideo while preserving other image properties
    if (image && 'showVideo' in image) {
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { 
          $set: { 
            'image.showVideo': image.showVideo 
          }
        },
        { new: true }
      );
      res.json(updatedPost);
    } else {
      throw new ApiError(400, 'Invalid update data');
    }
  } catch (error) {
    next(error);
  }
});

export default router;
