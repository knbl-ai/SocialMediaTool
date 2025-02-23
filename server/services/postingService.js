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
      let publishResult;

      // Handle X platform differently
      if (platform === 'X') {
        const { apiKey, apiSecret, accessToken, accessTokenSecret, webhookUrl } = platformConnection;
        
        // Initialize Twitter service with credentials
        const twitterService = new TwitterService(apiKey, apiSecret, accessToken, accessTokenSecret);
        
        let mediaId;
        
        if (postData.showVideo) {
          // Upload video to Twitter and get media ID
          const videoUploadResponse = await twitterService.uploadVideoFromUrl(postData.videoUrl);
          mediaId = videoUploadResponse.media_id_string;
        } else {
          // Upload image to Twitter and get media ID
          const mediaUploadResponse = await twitterService.uploadMediaFromUrl(postData.imageUrl);
          mediaId = mediaUploadResponse.media_id_string;
        }

        // Prepare request data for X platform
        requestData = {
          id: "no_id", // Special case for X platform
          imageUrl: mediaId, // Use media ID instead of URL
          platform: platform.toLowerCase(),
          content: postData.content,
          showVideo: postData.showVideo
        };

        if (!webhookUrl) {
          publishResult = {
            success: false,
            platform,
            response: 'No webhook URL found'
          };
        } else {
          const response = await axios.post(webhookUrl, requestData);
          publishResult = {
            success: true,
            platform,
            response: response.data
          };
        }
      } else {
        const { webhookUrl, pageId } = platformConnection;
        
        requestData = {
          id: pageId,
          imageUrl: postData.imageUrl,
          platform: platform.toLowerCase(),
          content: postData.content,
          videoUrl: postData.videoUrl,
          showVideo: postData.showVideo
        };

        if (!webhookUrl) {
          publishResult = {
            success: false,
            platform,
            response: 'No webhook URL found'
          };
        } else {
          const response = await axios.post(webhookUrl, requestData);
          publishResult = {
            success: true,
            platform,
            response: response.data
          };
        }
      }

      // Update post status in database if publication was successful
      if (publishResult.success && postData._id) {
        await Post.findByIdAndUpdate(postData._id, {
          $set: { status: 'published' }
        });
      }

      return publishResult;
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
      _id: post._id, // Include the post ID
      imageUrl: post.image.template,
      content: post.text.post,
      videoUrl: post.image.video,
      showVideo: post.image.showVideo
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

    // Update post status if all platforms were successful
    if (errors.length === 0 && post._id) {
      await Post.findByIdAndUpdate(post._id, {
        status: 'published',
        publishedAt: new Date()
      });
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
      // Format time as two-digit string (e.g., "09" for 9, "15" for 15)
      const time = now.getHours().toString().padStart(2, '0');
      now.setHours(0, 0, 0, 0);

      console.log(`Running scheduled posts check for: ${now}, time: ${time}`);

      // Find all posts scheduled for current hour
      const scheduledPosts = await Post.find({
        datePost: { $eq: now },
        timePost: time, // timePost is stored as string "00"-"23"
        status: { $ne: 'published' } // Don't republish already published posts
      });

      console.log(`Found ${scheduledPosts.length} posts to publish`);
      console.log("scheduledPosts", scheduledPosts);

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
            _id: post._id, // Include the post ID
            imageUrl: post.image.template,
            content: post.text.post,
            videoUrl: post.image.video,
            showVideo: post.image.showVideo
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