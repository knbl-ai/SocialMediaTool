import { useState, useCallback } from 'react';
import api from '../lib/api';

export const usePosts = (accountId) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async ({ startDate, endDate, platform, forceRefresh }) => {
    if (!accountId) return;

    setLoading(true);
    try {
      if (forceRefresh) {
        setPosts([]);
      }
      
      const fetchedPosts = await api.getPosts({
        accountId,
        startDate,
        endDate,
        platform
      });
      setPosts(fetchedPosts);
      setError(null);
      return fetchedPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  const createPost = useCallback(async (postData) => {
    try {
      const newPost = await api.createPost({
        ...postData,
        accountId
      });
      setPosts(prev => [...prev, newPost]);
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message);
      throw error;
    }
  }, [accountId]);

  const updatePost = useCallback(async (postId, postData) => {
    try {
      const updatedPost = await api.updatePost(postId, postData);
      setPosts(prev => 
        prev.map(post => 
          post._id === postId ? updatedPost : post
        )
      );
      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    try {
      await api.deletePost(postId);
      setPosts(prev => prev.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  const getPostsByDate = useCallback((date) => {
    if (!date) return [];
    
    // Create start and end of the day for comparison
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23, 59, 59, 999
    );

    return posts.filter(post => {
      if (!post.datePost) return false;
      const postDate = new Date(post.datePost);
      return postDate >= startOfDay && postDate <= endOfDay;
    });
  }, [posts]);

  const getPostsByDateRange = useCallback((startDate, endDate) => {
    return posts.filter(post => {
      const postDate = new Date(post.datePost);
      return postDate >= startDate && postDate <= endDate;
    });
  }, [posts]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    getPostsByDate,
    getPostsByDateRange,
    clearError
  };
};
