import express from 'express';
import { auth } from '../middleware/auth.js';
import multer from 'multer';
import * as contentPlannerService from '../services/contentPlannerService.js';
import { generateText, analyzeImage } from '../services/llmService.js';
import { optimizeGuidelinesPrompt } from '../services/promptsService.js';
import { uploadImage, deleteFile } from '../config/storage.js';
import { ApiError } from '../utils/ApiError.js';
import ContentPlanner from '../models/ContentPlanner.js';
import { generateBackground, generateFashionLook } from '../services/imageService.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only image files are allowed'));
    }
  },
});

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

// Upload images route
router.post('/:accountId/upload-images', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { accountId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, 'No files uploaded');
    }

    const contentPlanner = await contentPlannerService.getContentPlannerByAccountId(accountId);
    if (!contentPlanner) {
      throw new ApiError(404, 'Content planner not found');
    }

    // Upload each image and get URLs
    const uploadPromises = req.files.map(async (file) => {
      const imageUrl = await uploadImage(file);
      
      // Analyze the image using the content planner's guidelines
      const imageDescription = await analyzeImage({
        imageUrl
      });

      return {
        imageUrl,
        imageDescription
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Add new images to existing uploadedImages array
    contentPlanner.uploadedImages.push(...uploadedImages);
    await contentPlanner.save();

    res.json({
      message: 'Images uploaded and analyzed successfully',
      uploadedImages: contentPlanner.uploadedImages
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(error.status || 500).json({ 
      error: error.message || 'Failed to upload images' 
    });
  }
});

// Delete image route
router.post('/:accountId/delete-image', auth, async (req, res) => {
  try {
    const { accountId } = req.params;
    const { imageUrl, index } = req.body;

    if (!imageUrl || index === undefined) {
      throw new ApiError(400, 'Image URL and index are required');
    }

    const contentPlanner = await contentPlannerService.getContentPlannerByAccountId(accountId);
    if (!contentPlanner) {
      throw new ApiError(404, 'Content planner not found');
    }

    // Delete image from Google Cloud Storage
    // await deleteFile(imageUrl);

    // Remove image from uploadedImages array
    contentPlanner.uploadedImages.splice(index, 1);
    await contentPlanner.save();

    res.json({
      message: 'Image deleted successfully',
      uploadedImages: contentPlanner.uploadedImages
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(error.status || 500).json({ 
      error: error.message || 'Failed to delete image' 
    });
  }
});

// Update image description
router.post('/:accountId/update-image-description', auth, async (req, res) => {
  try {
    const { accountId } = req.params;
    const { index, description } = req.body;

    if (typeof index !== 'number' || !description) {
      throw new ApiError(400, 'Invalid request data');
    }

    const contentPlanner = await ContentPlanner.findOne({ accountId });
    if (!contentPlanner) {
      throw new ApiError(404, 'Content planner not found');
    }

    // Check if the index is valid
    if (index < 0 || index >= contentPlanner.uploadedImages.length) {
      throw new ApiError(400, 'Invalid image index');
    }

    // Update the description
    contentPlanner.uploadedImages[index].imageDescription = description;
    await contentPlanner.save();

    res.json({
      message: 'Image description updated successfully',
      uploadedImages: contentPlanner.uploadedImages
    });
  } catch (error) {
    console.error('Error updating image description:', error);
    res.status(error.status || 500).json({ 
      error: error.message || 'Failed to update image description'
    });
  }
});

// Generate content plan from uploaded images
router.post('/:accountId/generate-from-uploaded', auth, async (req, res) => {
  try {
    const result = await contentPlannerService.generateContentPlanFromUploadedImages(req.params.accountId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error generating content plan from uploaded images', error: error.message });
  }
});

// Generate background for an image
router.post('/:accountId/generate-background', auth, async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { imageUrl, prompt, index, imageDescription } = req.body;

    if (!imageUrl || !prompt || typeof index !== 'number') {
      throw new ApiError(400, 'Image URL, prompt, and index are required');
    }

    // Get the content planner
    const contentPlanner = await ContentPlanner.findOne({ accountId });
    if (!contentPlanner) {
      throw new ApiError(404, 'Content planner not found');
    }

    // Generate the new background
    const result = await generateBackground({
      prompt,
      imageUrl,
      imageDescription
    });

    // Update the image URL and description in the uploadedImages array
    contentPlanner.uploadedImages[index] = {
      imageUrl: result.url,
      imageDescription: result.prompt
    };
    

    // Save the updated content planner
    await contentPlanner.save();

    res.json({
      imageUrl: result.url,
      prompt: result.prompt,
      uploadedImages: contentPlanner.uploadedImages
    });
  } catch (error) {
    console.error('Background generation failed:', error);
    next(error instanceof ApiError ? error : new ApiError(500, error.message));
  }
});

// Generate fashion look
router.post('/:accountId/generate-fashion', async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { modelPrompt, gender, garmentImage, imageIndex, imageDescription } = req.body;

    if (!accountId || !gender || !garmentImage || imageIndex === undefined) {
      throw new Error('Missing required parameters');
    }

    // Generate fashion look
    const result = await generateFashionLook({
      modelPrompt: modelPrompt || '',  // Ensure empty string if modelPrompt is undefined
      gender,
      garmentImage,
      imageDescription
    });

    // Update the ContentPlanner with new image and description
    const contentPlanner = await ContentPlanner.findOne({ accountId });
    if (!contentPlanner) {
      throw new Error('Content planner not found');
    }

    // Update the specific image in the uploadedImages array
    contentPlanner.uploadedImages[imageIndex] = {
      ...contentPlanner.uploadedImages[imageIndex],
      imageUrl: result.url,
      imageDescription: result.description
    };

    await contentPlanner.save();

    res.json({
      success: true,
      imageUrl: result.url,
      description: result.description,
      modelImageUrl: result.modelImageUrl,
      uploadedImages: contentPlanner.uploadedImages
    });

  } catch (error) {
    console.error('Error in generate-fashion:', error);
    next(error);
  }
});

export default router; 