import axios from 'axios';
import FormData from 'form-data';
import { ApiError } from '../utils/ApiError.js';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

class TwitterService {
  constructor(apiKey, apiSecret, accessToken, accessTokenSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.accessToken = accessToken;
    this.accessTokenSecret = accessTokenSecret;
    
    // OAuth 1.0a for Twitter API calls
    this.oauth = new OAuth({
      consumer: {
        key: apiKey,
        secret: apiSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      }
    });

    // Initialize upload client
    this.uploadClient = axios.create({
      baseURL: 'https://upload.twitter.com/1.1'
    });
  }

  getAuthHeaderForRequest(method, url, params = {}) {
    const requestData = {
      url,
      method: method.toUpperCase(),
      data: params,
      parameters: params
    };

    // Generate OAuth 1.0a signature
    const oauth = this.oauth.authorize(requestData, {
      key: this.accessToken,
      secret: this.accessTokenSecret
    });

    // Get authorization header
    const authHeader = this.oauth.toHeader(oauth);

    console.log('OAuth request:', {
      url,
      method: method.toUpperCase(),
      params,
      oauth
    });
    
    return authHeader;
  }

  /**
   * Convert image URL to buffer
   * @param {string} imageUrl - The URL of the image
   * @returns {Promise<{buffer: Buffer, contentType: string}>} Image buffer and content type
   */
  async getImageBufferFromUrl(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'image/*'
        }
      });

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        throw new ApiError(400, 'Invalid image URL: URL does not point to an image');
      }

      return {
        buffer: Buffer.from(response.data),
        contentType
      };
    } catch (error) {
      console.error('Error fetching image:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch image from URL');
    }
  }

  /**
   * Upload media to Twitter
   * @param {Buffer} mediaBuffer - The media file buffer
   * @param {string} mediaType - The MIME type of the media (e.g., 'image/jpeg', 'video/mp4')
   * @returns {Promise<Object>} Media upload response containing media_id and other details
   */
  async uploadMedia(mediaBuffer, mediaType) {
    try {
      // For images, use the simple upload endpoint
      if (mediaType.startsWith('image/')) {
        const form = new FormData();
        form.append('media', mediaBuffer);
        form.append('media_category', 'tweet_image');

        const url = 'https://upload.twitter.com/1.1/media/upload.json';
        const authHeader = this.getAuthHeaderForRequest('POST', url);

        const response = await this.uploadClient.post('/media/upload.json', form, {
          headers: {
            ...form.getHeaders(),
            ...authHeader
          }
        });

        if (!response.data.media_id_string) {
          throw new Error('Failed to upload media: No media_id_string in response');
        }

        console.log('Media upload successful:', response.data);
        return response.data;
      }

      // For videos and other media types, use the chunked upload
      // Step 1: INIT
      const initResponse = await this.uploadClient.post('/media/upload.json', 
        new URLSearchParams({
          command: 'INIT',
          total_bytes: mediaBuffer.length.toString(),
          media_type: mediaType,
          media_category: mediaType.startsWith('video/') ? 'tweet_video' : 'tweet_gif'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (!initResponse.data.media_id_string) {
        throw new Error('Failed to initialize media upload');
      }

      const mediaId = initResponse.data.media_id_string;
      console.log('Media upload initialized:', mediaId);

      // Step 2: APPEND
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      let segmentIndex = 0;

      for (let offset = 0; offset < mediaBuffer.length; offset += chunkSize) {
        const chunk = mediaBuffer.slice(offset, offset + chunkSize);
        const form = new FormData();
        form.append('command', 'APPEND');
        form.append('media_id', mediaId);
        form.append('segment_index', segmentIndex);
        form.append('media', chunk);

        await this.uploadClient.post('/media/upload.json', form, {
          headers: {
            ...form.getHeaders()
          }
        });

        segmentIndex++;
      }

      // Step 3: FINALIZE
      const finalizeResponse = await this.uploadClient.post('/media/upload.json',
        new URLSearchParams({
          command: 'FINALIZE',
          media_id: mediaId
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // If it's a video, we need to wait for processing
      if (mediaType.startsWith('video/')) {
        await this.waitForVideoProcessing(mediaId);
      }

      console.log('Media upload completed:', finalizeResponse.data);
      return finalizeResponse.data;
    } catch (error) {
      console.error('Error uploading media to Twitter:', error.response?.data || error);
      throw new ApiError(500, `Failed to upload media to Twitter: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Wait for video processing to complete
   * @param {string} mediaId - The media ID to check
   */
  async waitForVideoProcessing(mediaId) {
    const maxAttempts = 60; // 5 minutes maximum (with 5-second intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await this.uploadClient.get('/media/upload.json', {
        params: {
          command: 'STATUS',
          media_id: mediaId
        }
      });

      const processingInfo = response.data.processing_info;
      
      if (!processingInfo) {
        return; // Processing complete
      }

      switch (processingInfo.state) {
        case 'succeeded':
          return;
        case 'failed':
          throw new ApiError(400, `Video processing failed: ${processingInfo.error.message}`);
        case 'in_progress':
          // Wait for 5 seconds before checking again
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;
          break;
      }
    }

    throw new ApiError(408, 'Video processing timeout');
  }

  /**
   * Upload media from URL
   * @param {string} imageUrl - The URL of the image to upload
   * @returns {Promise<Object>} Media upload response
   */
  async uploadMediaFromUrl(imageUrl) {
    try {
      // Get image buffer from URL
      const { buffer, contentType } = await this.getImageBufferFromUrl(imageUrl);

      // Upload media
      return await this.uploadMedia(buffer, contentType);
    } catch (error) {
      console.error('Error in uploadMediaFromUrl:', error);
      throw error;
    }
  }
}

// Test function
export async function testTwitterService(apiKey, apiSecret, accessToken, accessTokenSecret) {
  try {
    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      throw new Error('Missing required Twitter API credentials');
    }

    const twitter = new TwitterService(apiKey, apiSecret, accessToken, accessTokenSecret);
    console.log('Service initialized with OAuth 1.0a');

    // Upload an image and get the media ID
    const result = await twitter.uploadMediaFromUrl(
      'https://fal.media/files/lion/Q7VtU0t8PW-p_5HL5jZ_Z_1476fade40c844d7a798f355fd09c26f.jpg'
    );

    console.log('Media uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

export default TwitterService; 