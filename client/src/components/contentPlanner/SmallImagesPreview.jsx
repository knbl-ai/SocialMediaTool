import React, { useMemo } from 'react';

export default function SmallImagesPreview({ images = [] }) {
  // Ensure images is always an array
  const safeImages = Array.isArray(images) ? images : [];
  
  const randomImages = useMemo(() => {
    if (safeImages.length <= 4) return safeImages;
    const shuffled = [...safeImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [safeImages]);

  if (safeImages.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-1 mt-2 ps-2 pe-2">
      {randomImages.map((image, index) => (
        <div 
          key={index} 
          className="aspect-square rounded-sm overflow-hidden bg-gray-100"
        >
          <img
            src={image.imageUrl}
            alt={image.imageDescription || 'Preview'}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
} 