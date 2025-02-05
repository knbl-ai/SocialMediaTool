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
      main: { type: String, default: '#ffffff' },     // Indigo-600
      secondary: { type: String, default: '#FFA500' }, // Indigo-500
      title: { type: String, default: '#333333' },     // Gray-800
      text: { type: String, default: '#666666' }       // Gray-600
    },
    default: {
      main: '#ffffff',
      secondary: '#FFA500',
      title: '#333333',
      text: '#666666'
    }
  },
  templatesURLs: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

export default Account;
