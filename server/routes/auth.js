import express from 'express';
import { auth } from '../middleware/auth.js';
import { login, register, logout, googleLogin, checkAuth } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.get('/check', auth, checkAuth);

export default router;
