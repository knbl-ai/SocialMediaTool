import express from 'express';
import { parseGoogleDoc, saveGoogleDocContent } from '../services/GoogleDocsService.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

router.post('/parse', async (req, res, next) => {
  try {
    const { url, accountId } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'URL is required'
      });
    }

    if (!accountId) {
      return res.status(400).json({
        error: 'Account ID is required'
      });
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
    
    // Handle known errors
    if (error instanceof ApiError) {
      return res.status(error.status || 500).json({
        error: error.message
      });
    }

    // Handle unknown errors
    return res.status(500).json({
      error: 'Failed to process Google Doc'
    });
  }
});

export default router; 