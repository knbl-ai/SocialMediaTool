import mongoose from 'mongoose';

const authorizedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster email lookups
authorizedUserSchema.index({ email: 1 });

const AuthorizedUser = mongoose.model('AuthorizedUser', authorizedUserSchema);

export default AuthorizedUser; 