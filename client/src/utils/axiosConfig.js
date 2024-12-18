// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// // Create axios instance with base URL
// const instance = axios.create({
//   baseURL: `${API_URL}/api`,
//   withCredentials: true // Enable sending cookies
// });

// // Add request interceptor to add auth token
// instance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       // Ensure token is properly formatted
//       config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor to handle auth errors
// instance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // Clear token and redirect to login
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default instance;
