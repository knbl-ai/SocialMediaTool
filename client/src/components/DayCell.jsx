import React, { useState, useCallback, useEffect } from 'react';
import EditPostResponsive from './EditPostResponsive';
import { usePosts } from '../hooks/usePosts';

const DayCell = ({ day, month, year, isToday, posts = [], accountId, currentPlatform, onUpdate }) => {
  // Get current post before hooks
  const currentPost = Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
  const hasPost = Boolean(currentPost);

  const [modalState, setModalState] = useState({
    isOpen: false,
    platform: currentPlatform,
    postId: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { createPost } = usePosts(accountId);

  // Update modalState when currentPlatform prop changes
  useEffect(() => {
    setModalState(prev => ({
      ...prev,
      platform: currentPlatform
    }));
  }, [currentPlatform]);

  const handleEmptyCellClick = useCallback(async () => {
    if (!day || !accountId) return;
    
    setIsLoading(true);
    try {
      const date = new Date(year, month, day);
      const post = await createPost({
        platforms: [currentPlatform],
        datePost: date.toISOString().split('T')[0],
        timePost: "10:00"
      });

      if (post) {
        setModalState({
          isOpen: true,
          platform: currentPlatform,
          postId: post._id
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [day, month, year, accountId, currentPlatform, createPost]);

  const handleExistingPostClick = useCallback(() => {
    if (!currentPost?._id) return;

    setModalState({
      isOpen: true,
      platform: currentPost.platforms[0] || currentPlatform,
      postId: currentPost._id
    });
  }, [currentPost, currentPlatform]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      isOpen: false,
      platform: prev.platform,
      postId: null
    }));
  }, []);

  if (!day) return <div className="aspect-square" />;

  const cellDate = new Date(year, month, day);

  // Determine cell background color
  const getCellBackground = () => {
    if (isToday) {
      return 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500';
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
          onClick={hasPost ? handleExistingPostClick : handleEmptyCellClick}
          className={`
            w-full h-full rounded-xl cursor-pointer
            ${!isToday ? getCellBackground() : 'bg-white'}
            transition-all duration-200
            ${isLoading ? 'opacity-50' : ''}
            relative overflow-hidden
            hover:shadow-lg
            group
          `}
        >
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          {/* Date Badge */}
          <div className="absolute top-2 right-2 z-20">
            <span className={`
              inline-block px-2.5 py-1 rounded-lg text-sm font-bold shadow-sm
              ${hasPost 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : isToday 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600'
              }
            `}>
              {day}
            </span>
          </div>

          {/* Post Content */}
          {hasPost ? (
            <div className="absolute inset-0 flex flex-col">
              {/* Image Container */}
              <div className="flex-1 p-2 pt-10 relative">
                <div className="absolute inset-0 m-2 mt-10">
                  {currentPost.image?.url ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={currentPost.image.url}
                        alt="Post preview"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Text Overlay */}
              {currentPost.text?.post && (
                <div className="p-2 bg-gradient-to-t from-white via-white/95 to-white/80 transform transition-transform duration-200 group-hover:translate-y-0 translate-y-1">
                  <p className="text-xs text-gray-800 line-clamp-2 font-medium">
                    {currentPost.text.post}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Edit Modal */}
      {modalState.isOpen && (
          <EditPostResponsive
            show={modalState.isOpen}
            onClose={handleModalClose}
            date={cellDate}
            accountId={accountId}
            initialPlatform={modalState.platform}
            postId={modalState.postId}
            initialPost={hasPost ? currentPost : null}
            onUpdate={onUpdate}
          />
      )}
    </>
  );
};

export default DayCell;
