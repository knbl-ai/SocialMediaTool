import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
          // The server responded with a status code outside the 2xx range
          errorResponse.message = error.response.data.error || error.response.data.message || 'Server error';
          errorResponse.code = error.response.data.code;
          errorResponse.status = error.response.status;

          // Handle authentication errors only if not already on auth page
          if (error.response.status === 401 && !window.location.pathname.includes('/auth')) {
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

  async checkAuth() {
    return this.client.get('/auth/check');
  }

  async googleLogin(token) {
    return this.client.post('/auth/google', { token });
  }

  // Image generation endpoints
  async generateImage(params) {
    const response = await this.client.post('/posts/generate-image', params);
    return response;
  }

  async generateText(params) {
    return this.client.post('/posts/generate-text', params);
  }

  async generateTemplates(postId) {
    return this.client.post(`/posts/${postId}/generate-templates`);
  }

  // File operations
  async deleteFiles(urls) {
    return this.client.post('/storage/delete', { urls });
  }

  async uploadImage(formData) {
    return this.client.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Account endpoints
  async getAccounts() {
    return this.client.get('/accounts');
  }

  async createAccount(accountData) {
    return this.client.post('/accounts', accountData);
  }

  async updateAccount(accountId, accountData) {
    return this.client.patch(`/accounts/${accountId}`, accountData);
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

  // Generic HTTP methods
  async get(endpoint, params = {}) {
    return this.client.get(endpoint, { params });
  }

  async post(endpoint, data = {}, config = {}) {
    return this.client.post(endpoint, data, config);
  }

  async put(endpoint, data = {}) {
    return this.client.put(endpoint, data);
  }

  async delete(endpoint) {
    return this.client.delete(endpoint);
  }

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

  // Connection endpoints
  async getConnection(accountId) {
    return this.client.get(`/connections/${accountId}`);
  }

  async updateConnection(accountId, data) {
    return this.client.put(`/connections/${accountId}`, data);
  }

  async disconnectPlatform(accountId, platform) {
    return this.client.delete(`/connections/${accountId}/${platform}`);
  }

  // Post publishing
  async publishPost(accountId, post) {
    return this.client.post(`/posting/${accountId}/publish`, { post });
  }
}

// Create a singleton instance
const api = new ApiClient();

export default api;
