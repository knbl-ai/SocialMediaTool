import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DayCell from './DayCell';
import PlatformSelector from './PlatformSelector';
import ClearMonthPosts from './ClearMonthPosts';
import { usePlatform } from '../context/PlatformContext';
import { usePosts as usePostsHook } from '../hooks/usePosts';
import { usePosts as usePostsContext } from '../context/PostsContext';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Calendar } from '../components/ui/calendar';
import api from '@/lib/api';

const PLATFORM_STORAGE_KEY = 'selectedPlatform';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PostsDashboard = ({ accountId, onMonthChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  const [utcOffset, setUtcOffset] = useState(0);

  // All context hooks
  const { refreshTrigger } = usePostsContext();
  const { getAccountPlatform, setAccountPlatform } = usePlatform();
  const currentPlatform = getAccountPlatform(accountId);

  // Fetch UTC offset when component mounts
  useEffect(() => {
    const fetchUtcOffset = async () => {
      try {
        if (accountId) {
          const contentPlanner = await api.get(`/content-planner/${accountId}`);
          setUtcOffset(contentPlanner.utcOffset || 0);
        }
      } catch (error) {
        console.error("Error fetching UTC offset:", error);
      }
    };
    fetchUtcOffset();
  }, [accountId]);
  
  // Posts hook
  const { 
    loading, 
    error, 
    fetchPosts, 
    getPostsByDate,
    updatePost,
    clearError 
  } = usePostsHook(accountId);

  const handlePlatformSelect = useCallback((platformName) => {
    localStorage.setItem(PLATFORM_STORAGE_KEY, platformName);
    setAccountPlatform(accountId, platformName);
  }, [accountId, setAccountPlatform]);

  const fetchMonthPosts = useCallback(async () => {
    if (!currentPlatform || !isInitialized) return;
    
    // Create dates at the start of the first day and end of the last day
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    
    await fetchPosts({
      startDate: firstDay.toISOString(),
      endDate: lastDay.toISOString(),
      platform: currentPlatform,
      forceRefresh: true
    });
  }, [currentDate, currentPlatform, fetchPosts, isInitialized]);

  const handlePostDrop = useCallback(async (postId, targetDate) => {
    try {
      // Create a Date object at the start of the target day
      const newDate = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        0, 0, 0, 0
      );

      // Get the existing posts for this date to find the post we're updating
      const existingPosts = getPostsByDate(targetDate);
      const postToUpdate = existingPosts.find(post => post._id === postId);
      
      // If we can't find the post in our local state, fetch it from the API
      let postData;
      if (postToUpdate) {
        postData = { ...postToUpdate };
      } else {
        const response = await api.getPost(postId);
        if (!response) {
          throw new Error('Post not found');
        }
        postData = response;
      }

      // Update only the date while preserving all other properties
      await updatePost(postId, {
        ...postData,
        datePost: newDate.toISOString()
      });
      
      await fetchMonthPosts();
    } catch (error) {
      console.error('Error updating post date:', error);
    }
  }, [updatePost, fetchMonthPosts, getPostsByDate]);

  const getPostsForDay = useCallback((day) => {
    if (!day) return [];
    
    // Create a date object for the current day at local midnight
    const localDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Get posts for this date
    const posts = getPostsByDate(localDate);

    // Filter posts to only include those that match the day
    return posts.filter(post => {
      if (!post.datePost) return false;
      const postDate = new Date(post.datePost);
      return (
        postDate.getFullYear() === localDate.getFullYear() &&
        postDate.getMonth() === localDate.getMonth() &&
        postDate.getDate() === localDate.getDate()
      );
    });
  }, [currentDate, getPostsByDate]);

  // All useEffect hooks
  useEffect(() => {
    const initializePlatform = async () => {
      if (!accountId) return;

      const savedPlatform = localStorage.getItem(PLATFORM_STORAGE_KEY);
    

      if (savedPlatform) {
        // Always set the platform from localStorage on initial load
        await setAccountPlatform(accountId, savedPlatform);
      } else if (!currentPlatform) {
        // If no saved platform and no current platform, set default to Instagram
        const defaultPlatform = 'Instagram';
        localStorage.setItem(PLATFORM_STORAGE_KEY, defaultPlatform);
        await setAccountPlatform(accountId, defaultPlatform);
      }
      
      setIsInitialized(true);
    };

    initializePlatform();
  }, [accountId, setAccountPlatform]);

  useEffect(() => {
    if (accountId && currentPlatform && isInitialized) {
      fetchMonthPosts();
    }
  }, [accountId, currentPlatform, fetchMonthPosts, refreshTrigger, isInitialized]);

  // Regular functions (not hooks)
  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const handleMonthChange = (date) => {
    setCurrentDate(date);
    onMonthChange?.(date);
  };

  // Don't render anything until initialization is complete
  if (!isInitialized) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Calendar calculations
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: firstDayWeekday }, (_, i) => null);
  const allCells = [...emptyCells, ...days];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handlePreviousMonth}
            className="p-2 text-gray-300 hover:text-gray-400 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className='flex items-center flex-col gap-2'>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <PlatformSelector 
              currentPlatform={currentPlatform}
              onPlatformSelect={handlePlatformSelect}
            />
          </div>
          
          <button 
            onClick={handleNextMonth}
            className="p-2 text-gray-300 hover:text-gray-400 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4" onClose={clearError}>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div 
              key={day} 
              className="text-center text-sm font-medium text-gray-400 mb-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar cells */}
          {allCells.map((day, index) => {
            const today = new Date();
            const isToday = day && 
              today.getDate() === day && 
              today.getMonth() === currentDate.getMonth() && 
              today.getFullYear() === currentDate.getFullYear();

            return (
              <DayCell
                key={index}
                day={day}
                month={currentDate.getMonth()}
                year={currentDate.getFullYear()}
                isToday={isToday}
                posts={getPostsForDay(day)}
                accountId={accountId}
                currentPlatform={currentPlatform}
                onUpdate={fetchMonthPosts}
                onPostDrop={handlePostDrop}
              />
            );
          })}
        </div>

        {/* Clear Month Posts Button */}
        <ClearMonthPosts 
          accountId={accountId}
          currentDate={currentDate}
          onClear={fetchMonthPosts}
        />
      </div>
    </DndProvider>
  );
};

export default PostsDashboard;
