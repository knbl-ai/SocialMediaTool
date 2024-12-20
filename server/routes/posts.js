import express from 'express';
import Joi from 'joi';
import { validateRequest, schemas } from '../middleware/validateRequest.js';
import auth from '../middleware/auth.js';
import {
  createPost,
  updatePost,
  getPost,
  searchPosts,
  deletePost
} from '../controllers/postsController.js';

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

export default router;
