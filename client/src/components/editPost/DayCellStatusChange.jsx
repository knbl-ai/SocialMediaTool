import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import PostStatus from './PostStatus';

const DayCellStatusChange = ({ currentStatus = 'pending', className, onStatusChange, disabled, postId }) => {
  return (
    <div className={`absolute top-2 left-2 z-20 ${className || ''}`}>
      <PostStatus 
        currentStatus={currentStatus}
        onStatusChange={onStatusChange}
        disabled={disabled}
        postId={postId}
      />
    </div>
  );
};

export default DayCellStatusChange; 