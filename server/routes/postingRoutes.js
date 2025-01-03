import express from 'express';
import postingService from '../services/postingService.js';

const router = express.Router();

router.post('/:accountId/publish', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { post } = req.body;


    if (!post) {
      return res.status(400).json({ error: 'Post data is required' });
    }

    const result = await postingService.publishToAllPlatforms(accountId, post);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
        error: 'Some platforms failed to publish',
        details: result
      });
    }
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 