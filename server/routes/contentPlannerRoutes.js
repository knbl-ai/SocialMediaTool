import express from 'express';
import { auth } from '../middleware/auth.js';
import * as contentPlannerService from '../services/contentPlannerService.js';
import { generateText } from '../services/llmService.js';
import { optimizeGuidelinesPrompt } from '../services/promptsService.js';

const router = express.Router();

// Get content planner by account ID
router.get('/:accountId', auth, async (req, res) => {
  try {
    const contentPlanner = await contentPlannerService.getContentPlannerByAccountId(req.params.accountId);
    if (!contentPlanner) {
      return res.status(404).json({ message: 'Content planner not found' });
    }
    res.json(contentPlanner);
  } catch (error) {
    res.status(500).json({ message: 'Error getting content planner', error: error.message });
  }
});

// Update content planner
router.put('/:accountId', auth, async (req, res) => {
  try {
    const contentPlanner = await contentPlannerService.updateContentPlanner(
      req.params.accountId,
      req.body
    );
    if (!contentPlanner) {
      return res.status(404).json({ message: 'Content planner not found' });
    }
    res.json(contentPlanner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating content planner', error: error.message });
  }
});

// Generate content plan
router.post('/:accountId/generate', auth, async (req, res) => {
  try {
    const result = await contentPlannerService.generateContentPlan(req.params.accountId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error generating content plan', error: error.message });
  }
});

// Optimize guidelines
router.post('/:accountId/optimize-guidelines', auth, async (req, res) => {
  try {
    const { accountId } = req.params;
    const contentPlanner = await contentPlannerService.getContentPlannerByAccountId(accountId);
    
    if (!contentPlanner) {
      return res.status(404).json({ message: 'Content planner not found' });
    }

    const prompt = optimizeGuidelinesPrompt({ 
      guidelines: contentPlanner.textGuidelines 
    });

    const optimizedGuidelines = await generateText({
      topic: prompt.prompt,
      system: prompt.system,
      maxTokens: 5000,
      responseFormat: 'text'  // We want plain text, not JSON
    });

    const updatedContentPlanner = await contentPlannerService.updateContentPlanner(
      accountId,
      { textGuidelines: optimizedGuidelines }
    );

    res.json(updatedContentPlanner);
  } catch (error) {
    console.error('Error optimizing guidelines:', error);
    res.status(500).json({ message: 'Error optimizing guidelines', error: error.message });
  }
});

export default router; 