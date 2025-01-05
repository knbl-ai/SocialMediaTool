import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import postsRoutes from './routes/posts.js';
import storageRoutes from './routes/storage.js';
import contentPlannerRoutes from './routes/contentPlannerRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import postingRoutes from './routes/postingRoutes.js';
import initScheduler from './cron/scheduler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy - required for Cloud Run
app.set('trust proxy', true);

// Middleware
app.use(cookieParser());
app.use(express.json());

// In production, serve static files and handle CORS differently
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, 'public')));
  // Configure CORS for production
  app.use(cors({
    origin: process.env.CLIENT_URL || 'https://social-media-tool-wrmhrvgkjq-uc.a.run.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
} else {
  // In development, use CORS for separate frontend server
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/content-planner', contentPlannerRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/posting', postingRoutes);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300 // limit each IP to 300 requests per windowMs
});

// Apply rate limiting to all routes
app.use(limiter);

// Error handling middleware
app.use(errorHandler);

// Serve React's index.html for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize scheduler after DB connection
    initScheduler();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
    app.listen(PORT + 1);
  } else {
    console.error(err);
  }
});
