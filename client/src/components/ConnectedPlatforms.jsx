import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from 'react-icons/fa6';

const ConnectedPlatforms = () => {
  const platforms = [
    { icon: FaInstagram, color: '#E4405F', name: 'Instagram' },
    { icon: FaFacebook, color: '#1877F2', name: 'Facebook' },
    { icon: FaLinkedin, color: '#0A66C2', name: 'LinkedIn' },
    {icon: FaTiktok, color: '#000000', name: 'TikTok'},
    { icon: FaXTwitter, color: '#000000', name: 'X' }
  ];

  return (
    <div className='flex flex-col items-center'>
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
    <h2 className='mt-4 text-m'>Connect Platform</h2>
    </div>
  );
};

export default ConnectedPlatforms;
