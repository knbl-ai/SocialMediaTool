import React, { useState, useCallback, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import EditPostResponsive from './EditPostResponsive';
import { usePosts } from '../hooks/usePosts';

const DraggablePost = ({ post, index, onDragStart, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'POST',
    item: () => {
      onDragStart(index);
      return { id: post._id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [post._id, index, onDragStart]);

  return (
    <div 
      ref={drag} 
      className={`${isDragging ? 'opacity-50' : ''} cursor-move`}
    >
      {children}
    </div>
  );
};

const DayCell = ({ day, month, year, isToday, posts = [], accountId, currentPlatform, onUpdate, onPostDrop }) => {
  const hasPosts = posts.length > 0;
  const [activePostIndex, setActivePostIndex] = useState(0);
  
  // Ensure activePostIndex is valid
  useEffect(() => {
    if (activePostIndex >= posts.length) {
      setActivePostIndex(Math.max(0, posts.length - 1));
    }
  }, [posts.length, activePostIndex]);

  const currentPost = posts[Math.min(activePostIndex, posts.length - 1)];
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    platform: currentPlatform,
    postId: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { createPost } = usePosts(accountId);

  // Reset active post index when posts change
  useEffect(() => {
    setActivePostIndex(0);
  }, [posts]);

  // Cycle through posts on click if there are multiple
  const cyclePost = useCallback((e) => {
    if (posts.length > 1) {
      e.stopPropagation();
      setActivePostIndex((prev) => (prev + 1) % posts.length);
    }
  }, [posts.length]);

  // Drop target setup
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'POST',
    drop: (item) => {
      if (day) {
        const targetDate = new Date(year, month, day);
        onPostDrop(item.id, targetDate);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    }),
    canDrop: () => !!day // Only allow drops on valid days
  }), [day, month, year, onPostDrop]);

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
      <div ref={drop} className="relative group">
        <div
          className={`
            aspect-square rounded-xl relative
            ${isToday ? 'p-[2px]' : ''}
            ${isToday ? getCellBackground() : ''}
            ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          `}
        >
          <div 
            onClick={hasPosts ? handleExistingPostClick : handleEmptyCellClick}
            className={`
              w-full h-full rounded-xl cursor-pointer
              ${!isToday ? getCellBackground() : 'bg-white'}
              transition-all duration-200
              ${isLoading ? 'opacity-50' : ''}
              relative
              hover:shadow-lg
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
                ${hasPosts 
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
            {hasPosts ? (
              <>
                <DraggablePost 
                  post={currentPost}
                  index={activePostIndex}
                  onDragStart={setActivePostIndex}
                >
                  <>
                    {/* Image Container - Full size */}
                    <div className="absolute inset-0">
                      {currentPost.image?.url ? (
                        <img
                          src={currentPost.image.url}
                          alt="Post preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Text Content */}
                    {currentPost.text?.post && (
                      <div className="absolute inset-x-0 bottom-0 z-10">
                        {/* Preview text */}
                        <div className="p-2 bg-gradient-to-t from-white via-white/95 to-white/80 transition-opacity duration-300 group-hover:opacity-0 group-hover:invisible">
                          <p className="text-xs text-gray-800 line-clamp-2 font-medium">
                            {currentPost.text.post}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                </DraggablePost>

                {/* Multiple posts indicator */}
                {posts.length > 1 && (
                  <div 
                    onClick={cyclePost}
                    className="absolute bottom-2 right-2 z-30 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                  >
                    {posts.length}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
        
        {/* Expanded text - Outside of cell container */}
        {hasPosts && currentPost.text?.post && (
          <div 
            className="
              absolute left-0 right-0 top-[calc(100%-1px)]
              opacity-0 invisible 
              group-hover:opacity-100 group-hover:visible 
              transition-all duration-300 delay-75
              z-[100]
            "
          >
            <div className="bg-white shadow-xl p-3 rounded-b-xl border-t border-gray-100">
              <p className="text-xs text-gray-800 font-medium">
                {currentPost.text.post}
              </p>
            </div>
          </div>
        )}
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
            initialPost={hasPosts ? currentPost : null}
            onUpdate={onUpdate}
          />
      )}
    </>
  );
};

export default DayCell;
