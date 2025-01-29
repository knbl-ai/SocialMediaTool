import React, { useCallback } from 'react';

const PostDateSelector = ({ onChange }) => {
  const handleSelect = useCallback((selectedDate) => {
    if (!selectedDate) return;
    
    // Create a new UTC date at midnight
    const utcDate = new Date(Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0, 0, 0, 0
    ));
    
    onChange(utcDate.toISOString());
  }, [onChange]);

  return (
    // Rest of the component code
  );
};

export default PostDateSelector; 