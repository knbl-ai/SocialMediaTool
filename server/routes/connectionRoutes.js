import express from 'express';
import { auth } from '../middleware/auth.js';
import * as connectionController from '../controllers/connectionController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get connection details for an account
router.get('/:accountId', connectionController.getConnection);

// Update or create connection for a platform
router.put('/:accountId', connectionController.updateConnection);

// Disconnect a platform
router.delete('/:accountId/:platform', connectionController.disconnectPlatform);

export default router; 