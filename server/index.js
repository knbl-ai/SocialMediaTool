import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

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
