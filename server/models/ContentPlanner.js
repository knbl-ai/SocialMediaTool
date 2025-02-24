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
    default: 'claude-3-5-sonnet-20241022'
  },
  imageGuidelines: {
    type: String,
    default: ''
  },
  generateUploaded: {
    type: Boolean,
    default: false
  },
  uploadedImages: [{
    imageUrl: {
      type: String,
      required: true
    },
    imageDescription: {
      type: String,
      default: ''
    }
  }],
  imageModel: {
    type: String,
    default: 'fal-ai/flux/dev'
  },
  language: {
    type: String,
    default: 'English',
    enum: ['English', 'Hebrew']
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
    default: 2
  },
  platforms: {
    type: [String],
    default: ['Instagram', 'Facebook']
  },
  postingTime: {
    type: Number,
    default: 10,
    min: 0,
    max: 23
  },
  utcOffset: {
    type: Number,
    default: 2,
    min: -12,
    max: 12
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  contentPlanJSON: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const ContentPlanner = mongoose.model('ContentPlanner', contentPlannerSchema);

export default ContentPlanner; 