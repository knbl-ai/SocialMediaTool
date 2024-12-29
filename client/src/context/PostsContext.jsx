import React, { createContext, useContext, useCallback } from 'react';

const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <PostsContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
} 