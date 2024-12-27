import express from 'express';
import { deleteFiles } from '../config/storage.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

router.post('/delete', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      throw new ApiError(400, 'Invalid or empty URLs array');
    }

    const results = await deleteFiles(urls);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error deleting files:', error);
    throw new ApiError(500, `Failed to delete files: ${error.message}`);
  }
});

export default router;
