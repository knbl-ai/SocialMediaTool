import express from 'express';
import postingService from '../services/postingService.js';
import Post from '../models/Post.js';
import axios from 'axios';
import { format } from 'date-fns';
import Account from '../models/Account.js';

const router = express.Router();

router.post('/:accountId/publish', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { post, postId } = req.body;

    if (!post) {
      return res.status(400).json({ error: 'Post data is required' });
    }

    const result = await postingService.publishToAllPlatforms(accountId, post);
    
    if (result.success) {
      // Update post status to published
      await Post.findByIdAndUpdate(postId, { status: 'published' });
      res.json(result);
    } else {
      res.status(500).json({
        error: 'Some platforms failed to publish',
        details: result
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download content plan PDF
router.post('/:accountId/download-pdf', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate, platform } = req.body;

    if (!platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Parse dates and ensure they're valid
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Build query to get posts for specific platform
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1); // Capitalize first letter
    const query = {
      accountId,
      platforms: { $in: [platformName] }, // search for exact platform name
      datePost: {
        $gte: parsedStartDate,
        $lte: parsedEndDate
      }
    };

    // Fetch posts and account info
    const [posts, account] = await Promise.all([
      Post.find(query).sort({ datePost: 1 }),
      Account.findById(accountId)
    ]);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Format posts for PDF generation
    const contents = posts.map(post => ({
      date: format(new Date(post.datePost), 'yyyy-MM-dd'),
      image: post.image?.template || '',
      text: post.text?.post || ''
    }));

    // Ensure all required fields are present
    if (contents.length === 0) {
      return res.status(400).json({ error: 'No posts found for the selected date range and platform' });
    }

    // Format request body according to the specified structure
    const requestBody = {
      account: account.name || 'Unnamed Account',
      platform: platform.charAt(0).toUpperCase() + platform.slice(1), // Capitalize platform name
      startDate: format(parsedStartDate, 'yyyy-MM-dd'),
      endDate: format(parsedEndDate, 'yyyy-MM-dd'),
      contents
    };

    // Make request to templates API
    const response = await axios.post(
      `${process.env.TEMPLATES_IMAGES_API}/api/template/content-plan-pdf`,
      requestBody,
      { 
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json'
        }
      }
    );

    // Verify we got a PDF response
    if (!response.data || response.headers['content-type'] !== 'application/pdf') {
      throw new Error('Invalid response from templates API - expected PDF');
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="content-plan-${platformName.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf"`
    );

    // Send the PDF buffer directly
    res.end(Buffer.from(response.data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 