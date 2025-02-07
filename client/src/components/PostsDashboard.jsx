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
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    await fetchPosts({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
      platform: currentPlatform,
      forceRefresh: true
    });
  }, [currentDate, currentPlatform, fetchPosts, isInitialized]);

  const handlePostDrop = useCallback(async (postId, targetDate) => {
    try {
      // For positive UTC offset, we need to add a day to the UTC date
      // because when we want to display on the 20th local time,
      // we need to save it as the 20th in UTC
      const adjustedDate = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );

      // Create UTC date at midnight
      const utcDate = new Date(Date.UTC(
        adjustedDate.getFullYear(),
        adjustedDate.getMonth(),
        adjustedDate.getDate()
      ));

      await updatePost(postId, {
        datePost: utcDate.toISOString().split('T')[0]
      });
      await fetchMonthPosts();
    } catch (error) {
      console.error('Error updating post date:', error);
    }
  }, [updatePost, fetchMonthPosts, utcOffset]);

  const getPostsForDay = useCallback((day) => {
    if (!day) return [];
    
    // Create a date object for the current day at local midnight
    const localDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Convert local date to UTC for fetching posts
    const utcDate = new Date(Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate()
    ));

    // Get posts for the UTC date
    let allPosts = getPostsByDate(utcDate);

    // If we're near a day boundary, also check the adjacent day
    if (utcOffset !== 0) {
      const adjacentDate = new Date(utcDate);
      adjacentDate.setDate(adjacentDate.getDate() - 1);
      const adjacentPosts = getPostsByDate(adjacentDate);
      allPosts = [...allPosts, ...adjacentPosts];
    }

    // Filter posts to only include those that should appear on this local day
    return allPosts.filter(post => {
      if (!post.datePost) return false;
      const postDate = new Date(post.datePost);
      const localPostDate = new Date(postDate.getTime() + (utcOffset * 60 * 60 * 1000));
      return (
        localPostDate.getFullYear() === localDate.getFullYear() &&
        localPostDate.getMonth() === localDate.getMonth() &&
        localPostDate.getDate() === localDate.getDate()
      );
    });
  }, [currentDate, getPostsByDate, utcOffset]);

  // All useEffect hooks
  useEffect(() => {
    const initializePlatform = async () => {
      if (!accountId) return;

      const savedPlatform = localStorage.getItem(PLATFORM_STORAGE_KEY);
      console.log('Saved platform from localStorage:', savedPlatform);
      console.log('Current platform:', currentPlatform);

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
      console.log('Fetching posts after initialization. Platform:', currentPlatform);
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
