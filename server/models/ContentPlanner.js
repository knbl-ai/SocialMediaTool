import mongoose from 'mongoose';

const contentPlannerSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  voice: {
    type: String,
    default: ''
  },
  template: {
    type: String,
    default: ''
  },
  audience: {
    type: String,
    default: ''
  },
  creativity: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1
  },
  textGuidelines: {
    type: String,
    default: ''
  },
  llm: {
    type: String,
    default: ''
  },
  imageGuidelines: {
    type: String,
    default: ''
  },
  imageModel: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: String,
    default: ''
  },
  frequency: {
    type: Number,
    default: 1
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const ContentPlanner = mongoose.model('ContentPlanner', contentPlannerSchema);

export default ContentPlanner; 