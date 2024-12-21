const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to format date consistently
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Helper for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}/api/posts${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Default post structure
const DEFAULT_POST = {
  platforms: [],
  timePost: "10:00",
  image: {
    url: '',
    size: { width: 0, height: 0 },
    template: ''
  },
  text: {
    post: '',
    title: '',
    subtitle: ''
  },
  prompts: {
    image: '',
    video: '',
    text: ''
  },
  models: {
    image: '',
    video: '',
    text: ''
  }
};

// Find or create post
export const findOrCreatePost = async (params) => {
  const { accountId, date, platform } = params;
  
  if (!accountId) {
    throw new Error('accountId is required');
  }
  
  if (!date) {
    throw new Error('date is required');
  }
  
  const queryParams = new URLSearchParams({
    accountId,
    startDate: formatDate(date),
    endDate: formatDate(date),
    createIfNotFound: 'true'
  });
  
  if (platform) {
    queryParams.set('platform', platform);
  }
  
  const response = await apiCall(`/search?${queryParams}`);
  return Array.isArray(response) && response.length > 0 ? response[0] : null;
};

// Create new post
export const createPost = async (postData) => {
  return apiCall('/', {
    method: 'POST',
    body: JSON.stringify({
      ...DEFAULT_POST,
      ...postData
    })
  });
};

// Update existing post
export const updatePost = async (postId, postData) => {
  return apiCall(`/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData)
  });
};

// Get post by ID
export const getPost = async (postId) => {
  return apiCall(`/${postId}`);
};

// Search for posts
export const searchPosts = async (params) => {
  const { accountId, startDate, endDate, platform } = params;
  
  if (!accountId) {
    throw new Error('accountId is required');
  }
  
  const queryParams = new URLSearchParams({ accountId });
  
  if (startDate) {
    queryParams.set('startDate', startDate);
  }
  
  if (endDate) {
    queryParams.set('endDate', endDate);
  }
  
  if (platform) {
    queryParams.set('platform', platform);
  }
  
  const response = await apiCall(`/search?${queryParams}`);
  return Array.isArray(response) ? response : [response];
};
