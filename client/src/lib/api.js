import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const errorResponse = {
          message: 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR',
          status: 500
        };

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorResponse.message = error.response.data.error?.message || error.response.data.message;
          errorResponse.code = error.response.data.error?.code;
          errorResponse.status = error.response.status;

          // Handle authentication errors
          if (error.response.status === 401) {
            // Redirect to login page
            window.location.href = '/auth';
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorResponse.message = 'No response from server';
          errorResponse.code = 'NETWORK_ERROR';
        }

        return Promise.reject(errorResponse);
      }
    );
  }

  // Auth endpoints
  async login(credentials) {
    return this.client.post('/auth/login', credentials);
  }

  async register(userData) {
    return this.client.post('/auth/register', userData);
  }

  async logout() {
    return this.client.post('/auth/logout');
  }

  // Account endpoints
  async getAccounts() {
    return this.client.get('/accounts');
  }

  async createAccount(accountData) {
    return this.client.post('/accounts', accountData);
  }

  async updateAccount(accountId, accountData) {
    return this.client.put(`/accounts/${accountId}`, accountData);
  }

  async deleteAccount(accountId) {
    return this.client.delete(`/accounts/${accountId}`);
  }

  // Posts endpoints
  async getPosts(params) {
    return this.client.get('/posts/search', { params });
  }

  async getPost(postId) {
    return this.client.get(`/posts/${postId}`);
  }

  async createPost(postData) {
    return this.client.post('/posts', postData);
  }

  async updatePost(postId, postData) {
    return this.client.put(`/posts/${postId}`, postData);
  }

  async deletePost(postId) {
    return this.client.delete(`/posts/${postId}`);
  }

  // Image generation endpoint
  async generateImage(data) {
    return this.client.post('/posts/generate-image', data);
  }

  // Text generation endpoint
  async generateText(data) {
    return this.client.post('/posts/generate-text', data);
  }

  // Template generation endpoint
  async generateTemplates(postId) {
    return this.client.post(`/posts/${postId}/generate-templates`);
  }

  // Generic request method for custom endpoints
  async request(method, endpoint, data = null, config = {}) {
    const options = {
      method,
      url: endpoint,
      ...config
    };

    if (data) {
      if (method.toLowerCase() === 'get') {
        options.params = data;
      } else {
        options.data = data;
      }
    }

    return this.client.request(options);
  }
}

// Create a singleton instance
const api = new ApiClient();

export default api;
