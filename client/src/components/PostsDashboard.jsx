import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DayCell from './DayCell';
import PlatformSelector from './PlatformSelector';

const PostsDashboard = ({ accountId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const storageKey = `selectedPlatform_${accountId}`;
  
  const [currentPlatform, setCurrentPlatform] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    console.log('Initial load for account', accountId, 'platform:', saved);
    return saved || 'Instagram';
  });

  // Effect to update localStorage when platform changes
  useEffect(() => {
    console.log('Saving platform for account', accountId, 'platform:', currentPlatform);
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
          const isToday = day === today.getDate() && 
                         currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

          return (
            <DayCell
              key={index}
              day={day}
              isToday={isToday}
              posts={[]}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PostsDashboard;
