import React, { createContext, useContext, useState, useCallback } from 'react';
import { containsHebrew } from '@/lib/utils';

// Create context
const TextDirectionContext = createContext({
  detectDirection: (text) => 'ltr',
  getDirectionClass: (text) => '',
  getDirectionStyle: (text) => ({}),
  defaultDirection: 'ltr',
});

/**
 * Provider component for text direction context
 */
export const TextDirectionProvider = ({ children, defaultDirection = 'ltr' }) => {
  // Memoized direction detection function
  const detectDirection = useCallback((text) => {
    if (!text || typeof text !== 'string') return defaultDirection;
    return containsHebrew(text) ? 'rtl' : 'ltr';
  }, [defaultDirection]);
  
  // Get direction class based on text content
  const getDirectionClass = useCallback((text) => {
    return detectDirection(text) === 'rtl' ? 'text-right' : '';
  }, [detectDirection]);
  
  // Get direction style object based on text content
  const getDirectionStyle = useCallback((text) => {
    return detectDirection(text) === 'rtl' 
      ? { textAlign: 'right', direction: 'rtl' } 
      : {};
  }, [detectDirection]);
  
  const value = {
    detectDirection,
    getDirectionClass,
    getDirectionStyle,
    defaultDirection,
  };
  
  return (
    <TextDirectionContext.Provider value={value}>
      {children}
    </TextDirectionContext.Provider>
  );
};

/**
 * Hook to use text direction context
 */
export const useTextDirectionContext = () => {
  const context = useContext(TextDirectionContext);
  if (!context) {
    throw new Error('useTextDirectionContext must be used within a TextDirectionProvider');
  }
  return context;
};

export default TextDirectionContext; 