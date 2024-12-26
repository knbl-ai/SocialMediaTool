import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';
import Account from '../models/Account.js';

const TEMPLATES_IMAGES_API = process.env.TEMPLATES_IMAGES_API;

export const generateTemplates = async ({ post, accountId }) => {
  try {
    if (!TEMPLATES_IMAGES_API) {
      throw new ApiError(500, 'TEMPLATES_IMAGES_API is not configured');
    }

    // Get account data
    const account = await Account.findById(accountId);
    if (!account) {
      throw new ApiError(404, 'Account not found');
    }

    // Validate required fields
    if (!post.image?.url) {
      throw new ApiError(400, 'Post must have an image URL');
    }
    if (!post.text?.title || !post.text?.subtitle) {
      throw new ApiError(400, 'Post must have title and subtitle');
    }

    // Prepare request data with all required fields
    const requestData = {
      fields: {
        title: post.text.title,
        subtitle: post.text.subtitle,
        imageURL: post.image.url,
        logoURL: account.logoUrl,
        fontFamily: 'Arial, sans-serif',
        backgroundColor1: account.colors.main,
        backgroundColor2: account.colors.secondary,
        titleColor: account.colors.title,
        subtitleColor: account.colors.text
      },
      dimensions: {
        width: post.image.size.width,
        height: post.image.size.height
      },
      outputFormat: 'png'
    };

    // Make request to templates API
    const response = await axios.post(
      `${TEMPLATES_IMAGES_API}/api/template/generate-all`,
      requestData
    );

    if (!response.data.success) {
      throw new Error('Template generation failed');
    }

    return response.data;
  } catch (error) {
    console.error('Error generating templates:', error);
    throw new ApiError(
      error.response?.status || 500,
      error.message || 'Failed to generate templates'
    );
  }
};
