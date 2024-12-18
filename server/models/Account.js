import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  logoUrl: {
    type: String,
    default: ''
  },
  brandVoice: {
    type: String,
    default: ''
  },
  position: {
    type: Number,
    required: true
  },
  accountReview: {
    type: String,
    default: ''
  },
  websiteUrl: {
    type: String,
    default: ''
  },
  colors: {
    type: {
      main: { type: String, default: '#4F46E5' },     // Indigo-600
      secondary: { type: String, default: '#6366F1' }, // Indigo-500
      title: { type: String, default: '#1F2937' },     // Gray-800
      text: { type: String, default: '#4B5563' }       // Gray-600
    },
    default: {
      main: '#4F46E5',
      secondary: '#6366F1',
      title: '#1F2937',
      text: '#4B5563'
    }
  }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

export default Account;
