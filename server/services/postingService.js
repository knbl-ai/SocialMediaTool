import axios from 'axios';
import Connection from '../models/Connection.js';
import Post from '../models/Post.js';
import TwitterService from './twitterService.js';

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

      let requestData;

      // Handle X platform differently
      if (platform === 'X') {
        const { apiKey, apiSecret, accessToken, accessTokenSecret, webhookUrl } = platformConnection;
        
        // Initialize Twitter service with credentials
        const twitterService = new TwitterService(apiKey, apiSecret, accessToken, accessTokenSecret);
        
        // Upload image to Twitter and get media ID
        const mediaUploadResponse = await twitterService.uploadMediaFromUrl(postData.imageUrl);
        const imageUploadId = mediaUploadResponse.media_id_string;

        // Prepare request data for X platform
        requestData = {
          id: "no_id", // Special case for X platform
          imageUploadId, // Use media ID instead of URL
          platform: platform.toLowerCase(),
          content: postData.content
        };

        if (!webhookUrl) return {
          success: false,
          platform,
          response: 'No webhook URL found'
        }

        const response = await axios.post(webhookUrl, requestData);
        return {
          success: true,
          platform,
          response: response.data
        };
      }

      else {
        const { webhookUrl, pageId } = platformConnection;
        
        requestData = {
          id: pageId,
          imageUrl: postData.imageUrl,
          platform: platform.toLowerCase(),
          content: postData.content
        };

        if (!webhookUrl) return {
          success: false,
          platform,
          response: 'No webhook URL found'
        }

        const response = await axios.post(webhookUrl, requestData);
        return {
          success: true,
          platform,
          response: response.data
        };
      }
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

  async postScheduled() {
    try {
      // Get current time rounded to hours
      const now = new Date();
      now.setMinutes(0, 0, 0);
      const time = now.getHours().toString();
      now.setHours(0, 0, 0, 0);

      console.log(`Running scheduled posts check for: ${now}, time: ${time}`);

      // Find all posts scheduled for current hour
      const scheduledPosts = await Post.find({
        datePost: { $eq: now },
        timePost: time, // timePost is stored as string "0"-"23"
        status: { $ne: 'published' } // Don't republish already published posts
      });

      console.log(`Found ${scheduledPosts.length} posts to publish`);

      const results = [];
      const errors = [];

      // Process each scheduled post
      for (const post of scheduledPosts) {
        try {
          // Get connection data for the account
          const connection = await Connection.findOne({ accountId: post.accountId });
          if (!connection) {
            throw new Error(`No connections found for account ${post.accountId}`);
          }

          // Prepare post data
          const postData = {
            imageUrl: post.image.template,
            content: post.text.post
          };

          // Try to publish to each platform
          for (const platform of post.platforms) {
            try {
              if (connection[platform]) {
                const result = await this.publishPost(post.accountId, platform, postData);
                results.push({
                  postId: post._id,
                  ...result
                });
              } else {
                errors.push({
                  postId: post._id,
                  platform,
                  error: 'No connection available for this platform'
                });
              }
            } catch (error) {
              errors.push({
                postId: post._id,
                platform,
                error: error.message
              });
            }
          }

          // Update post status to published
          await Post.findByIdAndUpdate(post._id, {
            status: 'published',
            publishedAt: new Date()
          });

        } catch (error) {
          errors.push({
            postId: post._id,
            error: error.message
          });
        }
      }

      return {
        success: errors.length === 0,
        processed: scheduledPosts.length,
        results,
        errors
      };
    } catch (error) {
      console.error('Error in postScheduled:', error);
      throw error;
    }
  }
}

export default new PostingService(); 