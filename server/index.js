import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import postsRoutes from './routes/posts.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/posts', postsRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all routes
app.use(limiter);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', {
    mongoUri: process.env.MONGODB_URI ? '✓' : '✗',
    jwtSecret: process.env.JWT_SECRET ? '✓' : '✗',
    googleProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID ? '✓' : '✗',
    googleBucket: process.env.GOOGLE_CLOUD_BUCKET_NAME ? '✓' : '✗'
  });
});
