import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

const auth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      throw ApiError.unauthorized('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

export default auth;
