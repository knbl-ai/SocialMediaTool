import { createContext, useContext, useState, useCallback } from 'react';

const PlatformContext = createContext(null);

export const SUPPORTED_PLATFORMS = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn'];

export const PlatformProvider = ({ children }) => {
  // State to store selected platform for each account
  const [platformsByAccount, setPlatformsByAccount] = useState({});

  // Get platform for specific account
  const getAccountPlatform = useCallback((accountId) => {
    return platformsByAccount[accountId] || SUPPORTED_PLATFORMS[0];
  }, [platformsByAccount]);

  // Set platform for specific account
  const setAccountPlatform = useCallback((accountId, platform) => {
    setPlatformsByAccount(prev => ({
      ...prev,
      [accountId]: platform
    }));
  }, []);

  // Clear platform selection for an account
  const clearAccountPlatform = useCallback((accountId) => {
    setPlatformsByAccount(prev => {
      const newState = { ...prev };
      delete newState[accountId];
      return newState;
    });
  }, []);

  // Clear all platform selections
  const clearAllPlatforms = useCallback(() => {
    setPlatformsByAccount({});
  }, []);

  const value = {
    platformsByAccount,
    getAccountPlatform,
    setAccountPlatform,
    clearAccountPlatform,
    clearAllPlatforms,
    SUPPORTED_PLATFORMS
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
