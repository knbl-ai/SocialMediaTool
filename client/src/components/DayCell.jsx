import React, { useState, useCallback, useEffect } from 'react';
import EditPostResponsive from './EditPostResponsive';
import PlatformSelector from './PlatformSelector';
import { findOrCreatePost } from '@/services/posts';

const DayCell = ({ day, month, year, isToday, posts = [], accountId, currentPlatform }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    platform: currentPlatform,
    postId: null
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update modalState when currentPlatform prop changes
  useEffect(() => {
    setModalState(prev => ({
      ...prev,
      platform: currentPlatform
    }));
  }, [currentPlatform]);

  const handleCellClick = useCallback(async (e) => {
    if (!day || e.target.closest('.platform-selector')) return;
    
    setIsLoading(true);
    try {
      // Find existing post for this platform or create new one
      const date = new Date(year, month, day);
      const post = await findOrCreatePost({
        accountId,
        date,
        platform: currentPlatform
      });

      setModalState(prev => ({
        isOpen: true,
        platform: currentPlatform,
        postId: post._id
      }));
    } catch (error) {
      console.error('Error finding/creating post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [day, month, year, accountId, currentPlatform]);

  const handlePlatformSelect = useCallback(async (platform) => {
    setIsLoading(true);
    try {
      // Find or create post for the selected platform
      const date = new Date(year, month, day);
      const post = await findOrCreatePost({
        accountId,
        date,
        platform
      });

      setModalState({
        isOpen: true,
        platform,
        postId: post._id
      });
    } catch (error) {
      console.error('Error finding/creating post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [day, month, year, accountId]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      isOpen: false,
      platform: prev.platform,
      postId: null
    }));
  }, []);

  if (!day) return <div className="aspect-square" />;

  const cellDate = new Date(year, month, day);
  const hasPosts = posts.length > 0;
  const hasScheduledPosts = posts.some(post => post.scheduled);
  const hasPublishedPosts = posts.some(post => post.published);

  // Determine cell background color based on post status
  const getCellBackground = () => {
    if (isToday) {
      return 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500';
    }
    if (hasPublishedPosts) {
      return 'bg-green-100 hover:bg-green-200';
    }
    if (hasScheduledPosts) {
      return 'bg-yellow-100 hover:bg-yellow-200';
    }
    if (hasPosts) {
      return 'bg-blue-50 hover:bg-blue-100';
    }
    return 'bg-gray-50 hover:bg-gray-100';
  };

  return (
    <>
      <div
        className={`
          aspect-square rounded-xl relative
          ${isToday ? 'p-[2px]' : ''}
          ${isToday ? getCellBackground() : ''}
        `}
      >
        <div 
          onClick={handleCellClick}
          className={`
            w-full h-full rounded-xl cursor-pointer
            ${!isToday ? getCellBackground() : 'bg-white'}
            transition-colors duration-200
            ${isLoading ? 'opacity-50' : ''}
            relative
          `}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          <span className={`
            absolute top-2 right-2 text-sm font-medium
            ${isToday ? 'text-blue-600' : 'text-gray-600'}
          `}>
            {day}
          </span>

          <div className="p-2 pt-8 h-full overflow-y-auto">
            {posts.map((post, index) => (
              <div
                key={post._id || index}
                className="mb-2 p-2 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalState({
                    isOpen: true,
                    platform: post.platforms[0] || currentPlatform,
                    postId: post._id
                  });
                }}
              >
                <div className="flex items-center space-x-2">
                  {post.image?.url && (
                    <img
                      src={post.image.url}
                      alt="Post preview"
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.text?.title || 'Untitled'}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {post.text?.subtitle || 'No subtitle'}
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
          postId={modalState.postId}
        />
      )}
    </>
  );
};

export default DayCell;
