import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.status
      }
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation Error',
        code: 'VALIDATION_ERROR',
        status: 400,
        details: Object.values(err.errors).map(e => e.message)
      }
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: {
        message: 'Duplicate Entry',
        code: 'DUPLICATE_ERROR',
        status: 409,
        field: Object.keys(err.keyPattern)[0]
      }
    });
  }

  // Default error
  return res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      status: 500
    }
  });
};
