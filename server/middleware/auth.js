import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    // Get token from header or cookies
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'No token provided',
          code: 'AUTH_NO_TOKEN'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          code: 'AUTH_USER_NOT_FOUND'
        }
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        message: 'Invalid token',
        code: 'AUTH_INVALID_TOKEN'
      }
    });
  }
};
