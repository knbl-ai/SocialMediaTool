import mongoose from 'mongoose';

const platformConnectionSchema = {
  webhookUrl: String,
  pageId: String
};

const connectionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    unique: true
  },
  Instagram: platformConnectionSchema,
  Facebook: platformConnectionSchema,
  LinkedIn: platformConnectionSchema,
  TikTok: platformConnectionSchema,
  X: platformConnectionSchema
}, { timestamps: true });

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection; 