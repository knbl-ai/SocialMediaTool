import express from 'express';
import multer from 'multer';
import { parsePDF, savePDFContent } from '../services/PDFService.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new ApiError(400, 'Only PDF files are allowed'));
    }
  },
});

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded or invalid file type'
      });
    }

    const { accountId, isContentPlanner = true } = req.body;
    if (!accountId) {
      return res.status(400).json({
        error: 'Account ID is required'
      });
    }

    // Parse PDF content
    const pdfText = await parsePDF(req.file.buffer);

    // Save to database based on the context
    const result = await savePDFContent(accountId, pdfText, isContentPlanner === 'true');

    // Return appropriate response based on context
    if (isContentPlanner === 'true') {
      return res.json({
        message: 'PDF processed successfully',
        textGuidelines: result.textGuidelines
      });
    } else {
      return res.json({
        message: 'PDF processed successfully',
        accountReview: result.accountReview
      });
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // Handle ApiError instances
    if (error instanceof ApiError) {
      return res.status(error.statusCode || 400).json({
        error: error.message
      });
    }
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        error: 'File upload error: ' + error.message
      });
    }
    
    // Handle any other errors
    return res.status(500).json({
      error: 'Failed to process PDF file. Please try again.'
    });
  }
});

export default router; 