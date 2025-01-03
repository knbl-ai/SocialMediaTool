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
    const { colors, ...otherUpdates } = req.body;
    
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
    
    // Make request to external API
    const response = await axios.post(
      `${process.env.COMPANY_ANALYZER_API}/api/analyze`, 
      { url: formattedUrl }
    );

    if (response.data?.summary) {
      account.accountReview = response.data.summary;
      const updatedAccount = await account.save();
      res.json(updatedAccount);
    } else {
      res.status(400).json({ message: 'Failed to analyze website' });
    }
  } catch (error) {
    console.error('Error analyzing website:', error);
    const message = error.response?.data?.message || 'Failed to analyze website';
    res.status(500).json({ message });
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
        }
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

      // Delete old templates from bucket
      if (oldTemplateUrls.length > 0) {
        try {
          await deleteFiles(oldTemplateUrls);
          console.log('Successfully deleted old templates');
        } catch (deleteError) {
          console.error('Error deleting old templates:', deleteError);
          // Don't throw error here, as new templates were successfully generated
        }
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
