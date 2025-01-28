import React, { useState, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import ConnectionModal from './ConnectionModal';
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme/theme-provider";

const ConnectedPlatforms = ({ accountId }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connections, setConnections] = useState({});
  const { toast } = useToast();
  const { theme } = useTheme();

  const platforms = [
    { icon: FaInstagram, color: '#E4405F', name: 'Instagram' },
    { icon: FaFacebook, color: '#1877F2', name: 'Facebook' },
    { icon: FaLinkedin, color: '#0A66C2', name: 'LinkedIn' },
    { 
      icon: FaTiktok, 
      color: theme === 'dark' ? '#FFFFFF' : '#000000', 
      name: 'TikTok'
    },
    { 
      icon: FaXTwitter, 
      color: theme === 'dark' ? '#FFFFFF' : '#000000', 
      name: 'X'
    }
  ];

  useEffect(() => {
    if (accountId) {
      fetchConnections();
    } else {
      console.warn('ConnectedPlatforms: accountId is required');
    }
  }, [accountId]);

  const fetchConnections = async () => {
    if (!accountId) {
      console.error('Cannot fetch connections: accountId is required');
      return;
    }

    try {
      const response = await api.getConnection(accountId);
      setConnections(response || {});
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch platform connections",
        variant: "destructive",
      });
    }
  };

  const handlePlatformClick = (platform) => {
    if (!accountId) {
      toast({
        title: "Error",
        description: "Account ID is required to manage connections",
        variant: "destructive",
      });
      return;
    }
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchConnections(); // Refresh connections after modal closes
  };

  if (!accountId) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-red-500">Account ID is required to manage platform connections</div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center'>
      <style>
        {`
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
          .connection-indicator {
            animation: blink 2s infinite;
            box-shadow: 0 0 8px var(--indicator-color);
          }
        `}
      </style>
      <div className="flex items-center gap-3">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isConnected = connections[platform.name];
          return (
            <div
              key={platform.name}
              className="group relative cursor-pointer"
              onClick={() => handlePlatformClick(platform)}
            >
              <Icon
                size={48}
                color={platform.color}
                className={`transition-transform hover:scale-110 ${isConnected ? 'opacity-100' : 'opacity-50'}`}
              />
              <div 
                className={`
                  absolute -top-1 -right-2 w-3 h-3 rounded-full 
                  ${isConnected ? 'connection-indicator bg-green-500' : 'bg-gray-300'}
                `}
                style={isConnected ? { '--indicator-color': '#22c55e' } : {}}
              />
            </div>
          );
        })}
      </div>
      <b><h2 className='mt-4 text-m text-lime-400'>Connect Platform</h2></b>
      <ConnectionModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        platform={selectedPlatform}
        accountId={accountId}
      />
    </div>
  );
};

export default ConnectedPlatforms;
