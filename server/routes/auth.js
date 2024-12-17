import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      email,
      password: hashedPassword,
      name
    });

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    setCookie(res, token);
    
    res.status(201).json({
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    setCookie(res, token);

    res.json({
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify token and get user data
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Google Login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const decoded = jwt.decode(credential);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid Google credential' });
    }

    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      // Create new user from Google data
      user = new User({
        email: decoded.email,
        name: decoded.name,
        password: await bcrypt.hash(Math.random().toString(36), 10)
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    setCookie(res, token);

    res.json({
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
