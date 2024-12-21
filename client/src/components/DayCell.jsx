import React, { useState, useCallback, useEffect } from 'react';
import EditPostResponsive from './EditPostResponsive';
import PlatformSelector from './PlatformSelector';

const DayCell = ({ day, month, year, isToday, posts = [], accountId, currentPlatform }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    platform: currentPlatform
  });

  // Update modalState when currentPlatform prop changes
  useEffect(() => {
    setModalState(prev => ({
      ...prev,
      platform: currentPlatform
    }));
  }, [currentPlatform]);

  const handleCellClick = useCallback((e) => {
    if (!day || e.target.closest('.platform-selector')) return;
    setModalState(prev => ({
      isOpen: true,
      platform: prev.platform
    }));
  }, [day]);

  const handlePlatformSelect = useCallback((platform) => {
    setModalState({
      isOpen: true,
      platform
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      isOpen: false,
      platform: prev.platform // Preserve the platform when closing
    }));
  }, []);

  if (!day) return <div className="aspect-square" />;

  const cellDate = new Date(year, month, day);

  return (
    <>
      <div
        className={`
          aspect-square rounded-xl relative
          ${isToday ? `
            p-[2px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500
          ` : ''}
        `}
      >
        <div 
          onClick={handleCellClick}
          className={`
            w-full h-full rounded-xl bg-gray-50
            hover:bg-gray-100 cursor-pointer
            ${isToday ? 'bg-blue-50 hover:bg-blue-100' : ''}
          `}
        >
          <span className={`
            absolute top-2 right-2 text-sm font-medium
            ${isToday ? 'text-blue-600' : 'text-gray-600'}
          `}>
            {day}
          </span>

          <div className="p-2 pt-8 h-full overflow-y-auto">
            {posts.map((post, index) => (
              <div
                key={index}
                className="mb-2 p-2 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-2">
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post preview"
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      {post.content || 'No content'}
                    </p>
                  </div>
                  <div 
                    className="platform-selector" 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <PlatformSelector
                      currentPlatform={modalState.platform}
                      onPlatformSelect={handlePlatformSelect}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalState.isOpen && (
        <EditPostResponsive
          show={modalState.isOpen}
          onClose={handleModalClose}
          date={cellDate}
          accountId={accountId}
          initialPlatform={modalState.platform}
        />
      )}
    </>
  );
};

export default DayCell;
