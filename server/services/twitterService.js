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
    // Extract parameters from FormData if provided
    let finalParams = {};
    if (params instanceof FormData) {
      for (let [key, value] of params.entries()) {
        // Skip binary data (media content)
        if (!(value instanceof Buffer) && !(value instanceof Uint8Array)) {
          finalParams[key] = value;
        }
      }
    } else {
      finalParams = params;
    }

    const requestData = {
      url,
      method: method.toUpperCase(),
      data: finalParams,
      parameters: finalParams
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
      params: finalParams,
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
      const form = new FormData();
      form.append('command', 'INIT');
      form.append('total_bytes', mediaBuffer.length.toString());
      form.append('media_type', mediaType);
      form.append('media_category', mediaType.startsWith('video/') ? 'tweet_video' : 'tweet_gif');

      const url = 'https://upload.twitter.com/1.1/media/upload.json';
      const authHeader = this.getAuthHeaderForRequest('POST', url);
      const initResponse = await this.uploadClient.post('/media/upload.json', form, {
        headers: {
          ...form.getHeaders(),
          ...authHeader
        }
      });

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
        const appendForm = new FormData();
        appendForm.append('command', 'APPEND');
        appendForm.append('media_id', mediaId);
        appendForm.append('segment_index', segmentIndex);
        appendForm.append('media', chunk);

        const appendAuthHeader = this.getAuthHeaderForRequest('POST', url);
        await this.uploadClient.post('/media/upload.json', appendForm, {
          headers: {
            ...appendForm.getHeaders(),
            ...appendAuthHeader
          }
        });

        segmentIndex++;
      }

      // Step 3: FINALIZE
      const finalizeForm = new FormData();
      finalizeForm.append('command', 'FINALIZE');
      finalizeForm.append('media_id', mediaId);

      const finalizeAuthHeader = this.getAuthHeaderForRequest('POST', url);
      const finalizeResponse = await this.uploadClient.post('/media/upload.json', finalizeForm, {
        headers: {
          ...finalizeForm.getHeaders(),
          ...finalizeAuthHeader
        }
      });

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
      const statusUrl = 'https://upload.twitter.com/1.1/media/upload.json';
      const params = {
        command: 'STATUS',
        media_id: mediaId.toString()
      };

      const statusAuthHeader = this.getAuthHeaderForRequest('GET', statusUrl, params);
      const response = await this.uploadClient.get('/media/upload.json', {
        params,
        headers: {
          ...statusAuthHeader
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

  async getVideoBufferFromUrl(videoUrl) {
    try {
      console.log('Fetching video from URL:', videoUrl);
      const response = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds timeout for video downloads
        maxContentLength: 50 * 1024 * 1024, // 50MB max size
        headers: {
          'Accept': '*/*' // Accept any content type
        }
      });

      // Log response headers for debugging
      console.log('Response headers:', response.headers);
      
      const contentType = response.headers['content-type'];
      console.log('Content type received:', contentType);

      // Accept common video content types and application/octet-stream
      const validVideoTypes = [
        'video/',
        'application/mp4',
        'application/x-mpegURL',
        'application/octet-stream'  // Many CDNs serve videos as octet-stream
      ];

      const isValidContentType = validVideoTypes.some(type => 
        contentType?.toLowerCase().includes(type.toLowerCase())
      );

      if (!isValidContentType) {
        console.error('Invalid content type:', contentType);
        console.log('Response data length:', response.data.length);
        // If content type is missing but we have data, proceed anyway
        if (!contentType && response.data.length > 0) {
          console.log('No content type but received data, proceeding with video/mp4');
          return {
            buffer: Buffer.from(response.data),
            contentType: 'video/mp4'  // Default to mp4 if unknown
          };
        }
        throw new ApiError(400, `Invalid video content type: ${contentType}`);
      }

      // Use the actual content type if it's a video type, otherwise default to mp4
      const finalContentType = contentType?.toLowerCase().startsWith('video/') 
        ? contentType 
        : 'video/mp4';

      return {
        buffer: Buffer.from(response.data),
        contentType: finalContentType
      };
    } catch (error) {
      console.error('Error fetching video:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, `Error fetching video: ${error.message}`);
    }
  }

  async uploadVideoFromUrl(videoUrl) {
    console.log('Uploading video from URL:', videoUrl);
    try {
      // Download video buffer from URL
      const { buffer, contentType } = await this.getVideoBufferFromUrl(videoUrl);
      console.log('Video buffer downloaded, content type:', contentType);
      
      // Upload video to Twitter
      const mediaResponse = await this.uploadMedia(buffer, contentType);
      console.log('Video uploaded to Twitter, media ID:', mediaResponse.media_id_string);
      
      // Wait for video processing to complete
      await this.waitForVideoProcessing(mediaResponse.media_id_string);
      console.log('Video processing completed');
      
      return { media_id_string: mediaResponse.media_id_string };
    } catch (error) {
      console.error('Error uploading video to Twitter:', error);
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