import express from 'express';
import { parseGoogleDoc, saveGoogleDocContent } from '../services/GoogleDocsService.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

router.post('/parse', async (req, res) => {
  try {
    const { url, accountId } = req.body;

    if (!url) {
      throw new ApiError(400, 'URL is required');
    }

    if (!accountId) {
      throw new ApiError(400, 'Account ID is required');
    }

    // Parse the Google Doc content
    const text = await parseGoogleDoc(url);

    // Save to database
    const updatedPlanner = await saveGoogleDocContent(accountId, text);

    res.json({
      message: 'Google Doc processed successfully',
      textGuidelines: updatedPlanner.textGuidelines
    });
  } catch (error) {
    console.error('Error processing Google Doc:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to process Google Doc');
  }
});

export default router; 