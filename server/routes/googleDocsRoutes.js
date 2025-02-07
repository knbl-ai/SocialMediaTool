import express from 'express';
import { parseGoogleDoc, saveGoogleDocContent } from '../services/GoogleDocsService.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

router.post('/parse', async (req, res, next) => {
  try {
    const { url, accountId, isContentPlanner = true } = req.body;

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

    // Convert isContentPlanner to boolean if it's a string
    const isContentPlannerBool = isContentPlanner === true || isContentPlanner === 'true';

    // Save to database based on context
    const result = await saveGoogleDocContent(accountId, text, isContentPlannerBool);

    // Return appropriate response based on context
    if (isContentPlannerBool) {
      res.json({
        message: 'Google Doc processed successfully',
        textGuidelines: result.textGuidelines
      });
    } else {
      res.json({
        message: 'Google Doc processed successfully',
        accountReview: result.accountReview
      });
    }
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