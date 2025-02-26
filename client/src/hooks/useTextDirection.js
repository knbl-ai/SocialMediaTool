import { useState, useEffect, useCallback } from 'react';
import { containsHebrew } from '@/lib/utils';

/**
 * Custom hook to handle text direction based on content
 * @param {string} initialText - Initial text value
 * @param {number} debounceTime - Debounce time in milliseconds (default: 100ms)
 * @returns {Object} - Object containing direction state and handler function
 */
export function useTextDirection(initialText = '', debounceTime = 100) {
  const [direction, setDirection] = useState(containsHebrew(initialText) ? 'rtl' : 'ltr');
  const [text, setText] = useState(initialText);
  
  // Debounced direction detection to prevent performance issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setDirection(containsHebrew(text) ? 'rtl' : 'ltr');
    }, debounceTime);
    
    return () => clearTimeout(timer);
  }, [text, debounceTime]);
  
  // Handler for text changes
  const handleTextChange = useCallback((newText) => {
    setText(typeof newText === 'string' ? newText : '');
  }, []);
  
  return {
    direction,
    isRTL: direction === 'rtl',
    handleTextChange,
    directionClass: direction === 'rtl' ? 'text-right' : '',
    directionStyle: direction === 'rtl' ? { textAlign: 'right', direction: 'rtl' } : {}
  };
}

export default useTextDirection; 