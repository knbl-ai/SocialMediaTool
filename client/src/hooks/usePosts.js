import { useState, useCallback } from 'react';
import api from '../lib/api';

export const usePosts = (accountId) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async ({ startDate, endDate, platform }) => {
    if (!accountId) return;

    setLoading(true);
    try {
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
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter(post => {
      const postDate = new Date(post.datePost);
      return postDate.toISOString().split('T')[0] === dateStr;
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
