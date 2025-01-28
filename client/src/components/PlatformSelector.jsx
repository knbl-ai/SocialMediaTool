import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { useTheme } from "@/components/theme/theme-provider";

const PlatformSelector = ({ currentPlatform, onPlatformSelect }) => {
  const { theme } = useTheme();

  const platforms = [
    { icon: FaInstagram, color: '#E4405F', name: 'Instagram' },
    { icon: FaFacebook, color: '#1877F2', name: 'Facebook' },
    { icon: FaLinkedin, color: '#0A66C2', name: 'LinkedIn' },
    { 
      icon: FaTiktok, 
      name: 'TikTok',
      getColor: (isSelected) => {
        if (isSelected) return '#000000';
        return theme === 'dark' ? '#FFFFFF' : '#000000';
      }
    },
    { 
      icon: FaXTwitter, 
      name: 'X',
      getColor: (isSelected) => {
        if (isSelected) return '#000000';
        return theme === 'dark' ? '#FFFFFF' : '#000000';
      }
    }
  ];

  const handleClick = (e, platformName) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Platform clicked:', platformName);
    onPlatformSelect(platformName);
  };

  return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isSelected = currentPlatform === platform.name;
        const iconColor = platform.getColor ? platform.getColor(isSelected) : platform.color;
        
        return (
          <div
            key={platform.name}
            className={`
              group relative cursor-pointer p-2 rounded-full
              transition-all duration-200 ease-in-out
              hover:bg-gray-50 dark:hover:bg-gray-800
              ${isSelected ? 'bg-gray-100 dark:bg-gray-700 scale-110 shadow-lg ring-2 ring-offset-2 dark:ring-offset-gray-900' : ''}
            `}
            onClick={(e) => handleClick(e, platform.name)}
            style={{
              '--ring-color': iconColor,
              '--shadow-color': `${iconColor}40`
            }}
          >
            <Icon
              size={25}
              color={iconColor}
              className={`
                transition-all duration-200
                ${isSelected ? 'filter drop-shadow-lg' : 'hover:scale-110'}
              `}
              style={{
                filter: isSelected ? `drop-shadow(0 0 4px ${iconColor})` : 'none'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PlatformSelector;
