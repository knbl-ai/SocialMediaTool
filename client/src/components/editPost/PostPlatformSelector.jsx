import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from 'react-icons/fa6';

const platforms = [
  { icon: FaInstagram, color: '#E4405F', name: 'Instagram' },
  { icon: FaFacebook, color: '#1877F2', name: 'Facebook' },
  { icon: FaLinkedin, color: '#0A66C2', name: 'LinkedIn' },
  { icon: FaTiktok, color: '#000000', name: 'TikTok'},
  { icon: FaXTwitter, color: '#000000', name: 'X' }
];

const PostPlatformSelector = ({ selectedPlatforms = [], onPlatformsChange }) => {
  const handlePlatformClick = (e, platformName) => {
    e.stopPropagation();
    e.preventDefault();
    
    const newSelection = selectedPlatforms.includes(platformName)
      ? selectedPlatforms.filter(name => name !== platformName)
      : [...selectedPlatforms, platformName];
    
    onPlatformsChange(newSelection);
  };

  return (
    <div className="flex items-center gap-2 p-2" onClick={e => e.stopPropagation()}>
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isSelected = selectedPlatforms.includes(platform.name);
        
        return (
          <div
            key={platform.name}
            className={`
              relative cursor-pointer p-2 rounded-full
              transition-all duration-200 ease-in-out
              hover:bg-gray-50
              ${isSelected ? 'bg-gray-100 scale-110 shadow-md ring-2 ring-offset-2' : ''}
            `}
            onClick={(e) => handlePlatformClick(e, platform.name)}
            style={{
              '--ring-color': platform.color,
              '--shadow-color': `${platform.color}40`
            }}
          >
            <Icon
              size={25}
              color={platform.color}
              className={`
                transition-transform duration-200
                ${isSelected ? 'filter drop-shadow-lg scale-110' : 'hover:scale-105'}
              `}
              style={{
                filter: isSelected ? `drop-shadow(0 0 4px ${platform.color})` : 'none'
              }}
            />
            
            {/* Selection indicator */}
            {isSelected && (
              <div 
                className="absolute inset-0 rounded-full ring-2"
                style={{ borderColor: platform.color }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PostPlatformSelector;
