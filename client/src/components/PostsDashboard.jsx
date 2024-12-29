import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DayCell from './DayCell';
import PlatformSelector from './PlatformSelector';
import { usePlatform } from '../context/PlatformContext';
import { usePosts as usePostsHook } from '../hooks/usePosts';
import { usePosts as usePostsContext } from '../context/PostsContext';
import { Alert, AlertDescription } from '../components/ui/alert';

const PostsDashboard = ({ accountId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getAccountPlatform, setAccountPlatform } = usePlatform();
  const currentPlatform = getAccountPlatform(accountId);
  const { refreshTrigger } = usePostsContext();
  const { 
    loading, 
    error, 
    fetchPosts, 
    getPostsByDate,
    updatePost,
    clearError 
  } = usePostsHook(accountId);

  const fetchMonthPosts = useCallback(async () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    await fetchPosts({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
      platform: currentPlatform,
      forceRefresh: true
    });
  }, [currentDate, currentPlatform, fetchPosts]);

  useEffect(() => {
    if (accountId) {
      fetchMonthPosts();
    }
  }, [accountId, fetchMonthPosts, refreshTrigger]);

  const refreshPosts = useCallback(() => {
    setLastRefreshTime(Date.now());
  }, []);

  const handlePlatformSelect = (platformName) => {
    setAccountPlatform(accountId, platformName);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handlePostDrop = useCallback(async (postId, targetDate) => {
    try {
      await updatePost(postId, {
        datePost: targetDate.toISOString().split('T')[0]
      });
      await fetchMonthPosts();
    } catch (error) {
      console.error('Error updating post date:', error);
    }
  }, [updatePost, fetchMonthPosts]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: firstDayWeekday }, (_, i) => null);
  const allCells = [...emptyCells, ...days];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getPostsForDay = useCallback((day) => {
    if (!day) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getPostsByDate(date);
  }, [currentDate, getPostsByDate]);

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
            <h2 className="text-xl font-semibold text-gray-800">
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
      </div>
    </DndProvider>
  );
};

export default PostsDashboard;
