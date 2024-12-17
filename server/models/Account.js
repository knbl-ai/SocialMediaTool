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
  }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

export default Account;
