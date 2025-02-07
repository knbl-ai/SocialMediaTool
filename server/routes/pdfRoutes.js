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
      cb(new ApiError(400, 'Only PDF files are allowed'));
    }
  },
});

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const { accountId, isContentPlanner = true } = req.body;
    if (!accountId) {
      throw new ApiError(400, 'Account ID is required');
    }

    // Parse PDF content
    const pdfText = await parsePDF(req.file.buffer);

    // Save to database based on the context
    const result = await savePDFContent(accountId, pdfText, isContentPlanner === 'true');

    // Return appropriate response based on context
    if (isContentPlanner === 'true') {
      res.json({
        message: 'PDF processed successfully',
        textGuidelines: result.textGuidelines
      });
    } else {
      res.json({
        message: 'PDF processed successfully',
        accountReview: result.accountReview
      });
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to process PDF file');
  }
});

export default router; 