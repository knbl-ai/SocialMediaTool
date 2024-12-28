import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useDebounce } from './useDebounce';

export const useContentPlanner = (accountId) => {
  const [contentPlanner, setContentPlanner] = useState({
    voice: '',
    template: '',
    audience: '',
    creativity: 0.7,
    textGuidelines: '',
    llm: '',
    imageGuidelines: '',
    imageModel: '',
    date: new Date(),
    duration: '',
    frequency: 1,
    autoRenew: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (accountId) {
      fetchContentPlanner();
    }
  }, [accountId]);

  const fetchContentPlanner = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/content-planner/${accountId}`);
      const data = {
        ...response,
        date: response.date ? new Date(response.date) : new Date()
      };
      setContentPlanner(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching content planner:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateContentPlannerApi = async (updates) => {
    try {
      const response = await api.put(`/content-planner/${accountId}`, updates);
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error updating content planner:', err);
      throw err;
    }
  };

  // Debounced API update
  const debouncedUpdateApi = useDebounce(updateContentPlannerApi, 500);

  const updateField = useCallback(async (field, value) => {
    try {
      // Update local state immediately
      setContentPlanner(prev => ({
        ...prev,
        [field]: value
      }));

      // Debounced API call
      await debouncedUpdateApi({ [field]: value });
    } catch (err) {
      // Revert local state on error
      setContentPlanner(prev => ({
        ...prev,
        [field]: prev[field]
      }));
      console.error(`Error updating ${field}:`, err);
      throw err;
    }
  }, [debouncedUpdateApi]);

  return {
    contentPlanner,
    loading,
    error,
    updateField
  };
}; 