import express from 'express';
import multer from 'multer';
import { deleteFiles, uploadImage } from '../config/storage.js';
import { ApiError } from '../utils/ApiError.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload endpoint
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const url = await uploadImage(req.file);
    res.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new ApiError(500, `Failed to upload file: ${error.message}`);
  }
});

router.post('/delete', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      throw new ApiError(400, 'Invalid or empty URLs array');
    }

    const results = await deleteFiles(urls);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error deleting files:', error);
    throw new ApiError(500, `Failed to delete files: ${error.message}`);
  }
});

export default router;
