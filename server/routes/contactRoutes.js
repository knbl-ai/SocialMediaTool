import express from 'express';
import { saveFormToSpreadSheet } from '../services/GoogleDocsService.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      throw new ApiError(400, 'All fields are required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Invalid email format');
    }

    // Save to Google Sheets
    await saveFormToSpreadSheet({ name, email, message });

    res.json({
      success: true,
      message: 'Form submitted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router; 