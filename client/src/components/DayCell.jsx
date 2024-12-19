import React, { useState } from 'react';
import EditPost from './EditPost';

const DayCell = ({ day, isToday, posts = [] }) => {
  const [showEditPost, setShowEditPost] = useState(false);

  if (!day) return <div className="aspect-square" />;

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
          onClick={() => setShowEditPost(true)}
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

          {/* Posts container */}
          <div className="p-2 pt-8 h-full overflow-y-auto">
            {posts.map((post, index) => (
              <div
                key={index}
                className="mb-2 p-2 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
              >
                {/* Post preview content */}
                <div className="flex items-center space-x-2">
                  {post.image && (
                    <img 
                      src={post.image} 
                      alt="Post preview" 
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 truncate">
                      {post.text || 'No caption'}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {post.platforms?.map((platform, i) => (
                        <span 
                          key={i}
                          className="w-4 h-4 text-gray-400"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditPost
        show={showEditPost}
        onClose={() => setShowEditPost(false)}
        date={day ? new Date(new Date().getFullYear(), new Date().getMonth(), day) : null}
      />
    </>
  );
};

export default DayCell;
