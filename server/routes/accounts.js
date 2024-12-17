import express from 'express';
import auth from '../middleware/auth.js';
import Account from '../models/Account.js';
import mongoose from 'mongoose';
import multer from 'multer';
import { uploadImage } from '../config/storage.js';

const router = express.Router();

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid account ID' });
  }
  next();
};

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
    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update an account
router.patch('/:id', [auth, validateObjectId], async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
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

// Delete an account
router.delete('/:id', [auth, validateObjectId], async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    await Account.deleteOne({ _id: req.params.id });
    res.json({ message: 'Account deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
