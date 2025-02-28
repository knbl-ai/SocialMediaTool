import express from 'express';
import multer from 'multer';
import { deleteFiles, uploadImage } from '../config/storage.js';
import { ApiError } from '../utils/ApiError.js';
import { auth } from '../middleware/auth.js';
import { getVideoScreenshot } from '../services/videoService.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Accept image or video files based on the endpoint
    const isUploadVideo = req.path === '/upload-video';
    
    if (isUploadVideo && file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else if (!isUploadVideo && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${isUploadVideo ? 'video' : 'image'} files are allowed`));
    }
  },
});

// Upload image endpoint
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

// Upload video endpoint
router.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No video file uploaded');
    }

    // Upload the video file
    const videoUrl = await uploadImage(req.file);
    console.log('Video URL:', videoUrl);
    
    // Generate a screenshot from the video
    const screenshotUrl = await getVideoScreenshot(videoUrl);
    
    res.json({ 
      videoUrl,
      screenshotUrl
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new ApiError(500, `Failed to upload video: ${error.message}`);
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
