import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from 'react-icons/fa6';

const platforms = [
  { icon: FaInstagram, color: '#E4405F', name: 'Instagram' },
  { icon: FaFacebook, color: '#1877F2', name: 'Facebook' },
  { icon: FaLinkedin, color: '#0A66C2', name: 'LinkedIn' },
  { icon: FaTiktok, color: '#000000', name: 'TikTok'},
  { icon: FaXTwitter, color: '#000000', name: 'X' }
];

const PlatformSelector = ({ currentPlatform, onPlatformSelect }) => {
  return (
    <div className="flex items-center gap-3">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isSelected = currentPlatform === platform.name;
        return (
          <div
            key={platform.name}
            className={`
              group relative cursor-pointer p-2 rounded-full
              transition-all duration-200 ease-in-out
              ${isSelected ? 'bg-gray-100 scale-110 shadow-lg ring-2 ring-offset-2' : ''}
            `}
            onClick={() => onPlatformSelect(platform.name)}
            style={{
              '--ring-color': platform.color,
              '--shadow-color': `${platform.color}40`
            }}
          >
            <Icon
              size={25}
              color={platform.color}
              className={`
                transition-all duration-200
                ${isSelected ? 'filter drop-shadow-lg' : 'hover:scale-110'}
              `}
              style={{
                filter: isSelected ? `drop-shadow(0 0 4px ${platform.color})` : 'none'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PlatformSelector;
