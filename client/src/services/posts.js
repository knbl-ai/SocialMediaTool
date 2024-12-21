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

// Find or create a post for a specific date
export const findOrCreatePost = async (params) => {
  const { accountId, date, platform } = params;
  
  if (!accountId) {
    throw new Error('accountId is required');
  }
  
  if (!date) {
    throw new Error('date is required');
  }
  
  // First try to find existing post
  const searchDate = new Date(date);
  searchDate.setHours(0, 0, 0, 0);
  
  const queryParams = new URLSearchParams({
    accountId,
    date: formatDate(searchDate)
  });
  
  if (platform) {
    queryParams.set('platform', platform);
  }
  
  const posts = await apiCall(`/search?${queryParams}`);
  
  if (posts && posts.length > 0) {
    console.log('Found existing post:', posts[0]);
    return posts[0];
  }
  
  // If no post exists, create one
  console.log('Creating new post:', params);
  return apiCall('/', {
    method: 'POST',
    body: JSON.stringify({
      ...DEFAULT_POST,
      accountId,
      platforms: platform ? [platform] : [],
      datePost: date
    })
  });
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
  const { accountId, date, platform } = params;
  
  if (!accountId) {
    throw new Error('accountId is required');
  }
  
  const queryParams = new URLSearchParams({ accountId });
  
  if (date) {
    queryParams.set('date', formatDate(date));
  }
  
  if (platform) {
    queryParams.set('platform', platform);
  }
  
  const response = await apiCall(`/search?${queryParams}`);
  return Array.isArray(response) ? response : [response];
};
