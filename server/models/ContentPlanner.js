import mongoose from 'mongoose';

const contentPlannerSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  voice: {
    type: String,
    default: 'professional'
  },
  template: {
    type: String,
    default: 'no'
  },
  audience: {
    type: String,
    default: ''
  },
  creativity: {
    type: Number,
    default: 0.3,
    min: 0,
    max: 1
  },
  textGuidelines: {
    type: String,
    default: ''
  },
  llm: {
    type: String,
    default: 'claude-3-5-haiku-20241022'
  },
  imageGuidelines: {
    type: String,
    default: ''
  },
  imageModel: {
    type: String,
    default: 'fal-ai/flux/schnell'
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: String,
    default: 'month'
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