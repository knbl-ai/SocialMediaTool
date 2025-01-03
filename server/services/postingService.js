import axios from 'axios';
import Connection from '../models/Connection.js';

class PostingService {
  async publishPost(accountId, platform, postData) {
    try {
      // Get connection data for the account and platform
      const connection = await Connection.findOne({ accountId });
      if (!connection) {
        throw new Error(`No connections found for account ${accountId}`);
      }

      const platformConnection = connection[platform];
      if (!platformConnection) {
        throw new Error(`No connection found for platform ${platform}`);
      }

      const { webhookUrl, pageId } = platformConnection;

      // Prepare the request data
      const requestData = {
        id: pageId,
        imageUrl: postData.imageUrl,
        platform: platform.toLowerCase(),
        content: postData.content
      };

      // Make the post request to the platform's webhook
      const response = await axios.post(webhookUrl, requestData);
      
      return {
        success: true,
        platform,
        response: response.data
      };
    } catch (error) {
      console.error(`Error publishing to ${platform}:`, error);
      throw new Error(`Failed to publish to ${platform}: ${error.message}`);
    }
  }

  async publishToAllPlatforms(accountId, post) {
    const results = [];
    const errors = [];

    // Validate required post data
    if (!post.image?.template) {
      throw new Error('Post image template is required');
    }
    if (!post.text?.post) {
      throw new Error('Post content is required');
    }
    if (!post.platforms || post.platforms.length === 0) {
      throw new Error('No platforms selected for posting');
    }

    // Prepare post data
    const postData = {
      imageUrl: post.image.template,
      content: post.text.post
    };

    // Publish to each platform
    for (const platform of post.platforms) {
      try {
        const result = await this.publishPost(accountId, platform, postData);
        results.push(result);
      } catch (error) {
        errors.push({
          platform,
          error: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }
}

export default new PostingService(); 