import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true
  },
  platforms: [{
    type: String,
    enum: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X']
  }],
  templatesUrls: [{
    type: String
  }],
  datePost: {
    type: Date,
    required: true,
    default: Date.now
  },
  timePost: {
    type: String,
    default: "10"
  },
  image: {
    url: {
      type: String,
      default: ''
    },
    size: {
      width: {
        type: Number,
        default: 0
      },
      height: {
        type: Number,
        default: 0
      }
    },
    template: {
      type: String,
      default: ''
    },
    dimensions: {
      type: String,
      default: 'Square'
    },
    video: {
      type: String,
      default: ''
    },
    showVideo: {
      type: Boolean,
      default: false
    },
    videoscreenshot: {
      type: String,
      default: ''
    }
  },
  text: {
    post: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    }
  },
  prompts: {
    image: {
      type: String,
      default: ''
    },
    video: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    }
  },
  models: {
    image: {
      type: String,
      default: ''
    },
    video: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    }
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'published', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Post', PostSchema);
