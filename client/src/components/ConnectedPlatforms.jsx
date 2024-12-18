import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

const ConnectedPlatforms = () => {
  const platforms = [
    { icon: FaInstagram, color: '#E4405F', name: 'Instagram' },
    { icon: FaFacebook, color: '#1877F2', name: 'Facebook' },
    { icon: FaLinkedin, color: '#0A66C2', name: 'LinkedIn' },
    { icon: FaXTwitter, color: '#000000', name: 'X' }
  ];

  return (
    <div className="flex items-center gap-3">
      {platforms.map((platform, index) => {
        const Icon = platform.icon;
        return (
          <div
            key={platform.name}
            className="group relative cursor-pointer"
          >
            <Icon
              size={48}
              color={platform.color}
              className="transition-transform hover:scale-110"
            />
          </div>
        );
      })}
    </div>
  );
};

export default ConnectedPlatforms;
