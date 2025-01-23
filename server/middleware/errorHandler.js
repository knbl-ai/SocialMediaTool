import { ApiError } from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  // Handle ApiError instances
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Handle other errors
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

export default errorHandler;
