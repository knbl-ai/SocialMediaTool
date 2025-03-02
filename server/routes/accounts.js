import express from 'express';
import { auth } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import Account from '../models/Account.js';
import { createContentPlanner } from '../services/contentPlannerService.js';
import multer from 'multer';
import { uploadImage, deleteFiles } from '../config/storage.js';
import axios from 'axios';
import { formatUrl } from '../utils/urlHelper.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get all accounts for a user
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.id });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single account
router.get('/:id', [auth, validateObjectId], async (req, res) => {
  try {
    const account = await Account.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new account
router.post('/', auth, async (req, res) => {
  try {
    const account = new Account({
      name: req.body.name || '',
      userId: req.user.id,
      position: (await Account.countDocuments({ userId: req.user.id }))
    });
    const newAccount = await account.save();

    // Create associated content planner
    await createContentPlanner(newAccount._id);

    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update an account
router.patch('/:id', [auth, validateObjectId], async (req, res) => {
  try {
    const { colors, position, ...otherUpdates } = req.body;
    
    // Validate colors if they are being updated
    if (colors) {
      const requiredColors = ['main', 'secondary', 'title', 'text'];
      const hasAllColors = requiredColors.every(color => 
        typeof colors[color] === 'string' && 
        colors[color].match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      );
      
      if (!hasAllColors) {
        return res.status(400).json({ 
          message: 'Invalid colors format. All colors must be valid hex values.' 
        });
      }
    }

    // Handle position update
    if (typeof position === 'number') {
      // Get all accounts to update positions
      const accounts = await Account.find({ userId: req.user.id }).sort({ position: 1 });
      const account = accounts.find(acc => acc._id.toString() === req.params.id);
      
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      // Remove account from current position
      accounts.splice(account.position, 1);
      // Insert at new position
      accounts.splice(position, 0, account);
      
      // Update all positions in one batch
      await Promise.all(accounts.map((acc, index) => 
        Account.updateOne(
          { _id: acc._id },
          { $set: { position: index } }
        )
      ));

      account.position = position;
      return res.json(account);
    }

    // Handle non-position updates
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { ...otherUpdates, ...(colors && { colors }) } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: error.message });
  }
});

// Analyze company website
router.post('/:id/analyze', [auth, validateObjectId], async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Format the URL before sending to external API
    const formattedUrl = formatUrl(url);
    if (!formattedUrl) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Save the formatted URL to the account
    account.websiteUrl = formattedUrl;
    
    try {
      // Make request to external API with a longer timeout
      const response = await axios.post(
        `${process.env.COMPANY_ANALYZER_API}/api/analyze`, 
        { url: formattedUrl },
        { timeout: 90000 } 
      );

      if (response.data?.summary) {
        account.accountReview = response.data.summary;
        const updatedAccount = await account.save();
        res.json(updatedAccount);
      } else {
        res.status(400).json({ message: 'Failed to analyze website: No summary generated' });
      }
    } catch (analyzeError) {
      console.error('Website analysis error:', analyzeError);
      
      // Handle specific error cases
      if (analyzeError.code === 'ECONNABORTED' || analyzeError.message.includes('timeout')) {
        return res.status(408).json({ 
          message: 'Website analysis timed out. The website might be slow or unavailable.',
          details: analyzeError.message
        });
      }
      
      if (analyzeError.response?.data?.details) {
        return res.status(400).json({ 
          message: 'Failed to analyze website',
          details: analyzeError.response.data.details
        });
      }

      res.status(500).json({ 
        message: 'Failed to analyze website',
        details: analyzeError.message
      });
    }
  } catch (error) {
    console.error('Error analyzing website:', error);
    res.status(500).json({ 
      message: 'Server error while analyzing website',
      details: error.message
    });
  }
});

// Upload account logo
router.post('/:id/logo', [auth, validateObjectId], upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const logoUrl = await uploadImage(req.file);
    account.logoUrl = logoUrl;
    await account.save();

    res.json(account);
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate templates for an account
router.post('/:id/generate-templates', auth, async (req, res) => {
  try {
    // Find account and get old template URLs
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const oldTemplateUrls = account.templatesURLs || [];

    // Make request to templates API
    const response = await axios.post(
      `${process.env.TEMPLATES_IMAGES_API}/api/template/generate-all`,
      {
        fields: {
          backgroundColor1: account.colors.main,
          backgroundColor2: account.colors.secondary,
          titleColor: account.colors.title,
          subtitleColor: account.colors.text,
          logoURL: account.logoUrl
        },
        accountId: req.params.id
      }
    );

    if (response.data.success) {
      const newTemplateUrls = response.data.results.map(result => result.imageUrl);
      
      // Update account with new template URLs
      const updatedAccount = await Account.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { templatesURLs: newTemplateUrls } },
        { new: true }
      );

      // Delete old templates if they exist
      if (oldTemplateUrls.length > 0) {
        await deleteFiles(oldTemplateUrls);
      }

      res.json({ 
        success: true, 
        templatesURLs: newTemplateUrls 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Failed to generate templates' 
      });
    }
  } catch (error) {
    console.error('Error generating templates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while generating templates' 
    });
  }
});

// Delete an account
router.delete('/:id', [auth, validateObjectId], async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    await account.deleteOne();
    res.json({ message: 'Account deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
