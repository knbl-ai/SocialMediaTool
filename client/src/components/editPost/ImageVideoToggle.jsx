import React from 'react';
import { Video, Image as ImageIcon } from "lucide-react";

const ImageVideoToggle = ({ showVideo, onToggle }) => {
  return (
    <div className="flex items-center gap-8">
      <button
        onClick={() => onToggle(false)}
        className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 ${
          !showVideo 
            ? 'bg-white dark:bg-gray-800 shadow-md scale-110 text-blue-600 dark:text-blue-400 font-medium' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
        title="Image Mode"
        aria-label="Switch to Image Mode"
      >
        <div className="flex flex-col items-center gap-1">
          <ImageIcon className={`${!showVideo ? 'h-6 w-6' : 'h-5 w-5'} transition-all duration-300`} />
        </div>
      </button>
      
      <button
        onClick={() => onToggle(true)}
        className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 ${
          showVideo 
            ? 'bg-white dark:bg-gray-800 shadow-md scale-110 text-blue-600 dark:text-blue-400 font-medium' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
        title="Video Mode"
        aria-label="Switch to Video Mode"
      >
        <div className="flex flex-col items-center gap-1">
          <Video className={`${showVideo ? 'h-6 w-6' : 'h-5 w-5'} transition-all duration-300`} />
        
        </div>
      </button>
    </div>
  );
};

export default ImageVideoToggle; 