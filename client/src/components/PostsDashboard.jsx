import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DayCell from './DayCell';
import PlatformSelector from './PlatformSelector';
import { searchPosts } from '@/services/posts';

const PostsDashboard = ({ accountId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthPosts, setMonthPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const storageKey = `selectedPlatform_${accountId}`;
  
  const [currentPlatform, setCurrentPlatform] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved || 'Instagram';
  });

  // Effect to update localStorage when platform changes
  useEffect(() => {
    localStorage.setItem(storageKey, currentPlatform);
  }, [currentPlatform, accountId, storageKey]);

  // Effect to load platform when account changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    console.log('Account changed to', accountId, 'loading platform:', saved);
    if (saved && saved !== currentPlatform) {
      setCurrentPlatform(saved);
    }
  }, [accountId, storageKey]);

  // Effect to fetch posts for the current month
  useEffect(() => {
    if (!accountId) return;

    const fetchMonthPosts = async () => {
      setIsLoading(true);
      try {
        // Get first and last day of current month
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Format dates for API
        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];
        
        console.log('Fetching posts:', { accountId, startDate, endDate, currentPlatform });
        
        // Fetch posts for the month
        const posts = await searchPosts({
          accountId,
          startDate,
          endDate,
          platform: currentPlatform
        });
        
        console.log('Fetched posts:', posts);
        setMonthPosts(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthPosts();
  }, [accountId, currentDate, currentPlatform]);

  const handlePlatformSelect = (platformName) => {
    console.log('Clicking platform for account', accountId, 'new platform:', platformName);
    setCurrentPlatform(platformName);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

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

  // Helper to get posts for a specific day
  const getPostsForDay = (day) => {
    if (!day) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return monthPosts.filter(post => {
      const postDate = new Date(post.datePost);
      return postDate.toISOString().split('T')[0] === dateStr;
    });
  };

  return (
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

      {/* Loading State */}
      {isLoading && (
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
            />
          );
        })}
      </div>
    </div>
  );
};

export default PostsDashboard;
