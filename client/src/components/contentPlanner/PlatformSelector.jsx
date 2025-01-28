import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { Label } from '../ui/label';
import TooltipLabel from '@/components/ui/tooltip-label';
import { useTheme } from "@/components/theme/theme-provider";

const PlatformSelector = ({ value = [], onChange, tooltip }) => {
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

  const handlePlatformClick = (platformName) => {
    const newSelection = value.includes(platformName)
      ? value.filter(name => name !== platformName)
      : [...value, platformName];
    
    onChange(newSelection);
  };

  return (
    <div className="w-full">
      <TooltipLabel className="text-lime-500" tooltip={tooltip}>Platforms</TooltipLabel>
      <div className="flex items-center gap-2 p-2 mt-2">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = value.includes(platform.name);
          const iconColor = platform.getColor ? platform.getColor(isSelected) : platform.color;
          
          return (
            <div
              key={platform.name}
              className={`
                relative cursor-pointer p-2 rounded-full
                transition-all duration-200 ease-in-out
                hover:bg-gray-50 dark:hover:bg-gray-800
                ${isSelected ? 'bg-gray-100 dark:bg-gray-700 scale-110 shadow-md ring-2 ring-offset-2 dark:ring-offset-gray-900' : ''}
              `}
              onClick={() => handlePlatformClick(platform.name)}
              style={{
                '--ring-color': iconColor,
                '--shadow-color': `${iconColor}40`
              }}
            >
              <Icon
                size={25}
                color={iconColor}
                className={`
                  transition-transform duration-200
                  ${isSelected ? 'filter drop-shadow-lg scale-110' : 'hover:scale-105'}
                `}
                style={{
                  filter: isSelected ? `drop-shadow(0 0 4px ${iconColor})` : 'none'
                }}
              />
              
              {isSelected && (
                <div 
                  className="absolute inset-0 rounded-full ring-2"
                  style={{ borderColor: iconColor }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformSelector; 