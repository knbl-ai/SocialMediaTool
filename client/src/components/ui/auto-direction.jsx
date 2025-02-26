import React, { useState, useEffect } from 'react';
import { containsHebrew, getTextDirectionStyle } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * A wrapper component that automatically detects and applies text direction
 * based on content (RTL for Hebrew, LTR for others)
 */
export const AutoDirection = ({ 
  as: Component = 'div',
  children, 
  content,
  value,
  defaultValue,
  className,
  style,
  onChange,
  debounceTime = 100,
  ...props 
}) => {
  // Determine initial text from props
  const initialText = content || value || defaultValue || '';
  const [direction, setDirection] = useState(containsHebrew(initialText) ? 'rtl' : 'ltr');
  const [currentText, setCurrentText] = useState(initialText);
  
  // Handle text changes with debouncing
  useEffect(() => {
    const textToCheck = content || value || currentText;
    
    const timer = setTimeout(() => {
      const newDirection = containsHebrew(textToCheck) ? 'rtl' : 'ltr';
      if (newDirection !== direction) {
        setDirection(newDirection);
      }
    }, debounceTime);
    
    return () => clearTimeout(timer);
  }, [content, value, currentText, direction, debounceTime]);
  
  // Handle input changes for controlled components
  const handleChange = (e) => {
    const newValue = e.target.value;
    setCurrentText(newValue);
    
    if (onChange) {
      onChange(e);
    }
  };
  
  // Apply direction styles
  const directionStyle = direction === 'rtl' 
    ? { textAlign: 'right', direction: 'rtl' } 
    : {};
    
  const directionClass = direction === 'rtl' ? 'text-right' : '';
  
  // For input-like elements
  if (['input', 'textarea', 'select'].includes(Component) || 
      (typeof Component === 'string' && ['input', 'textarea', 'select'].includes(Component.toLowerCase()))) {
    return (
      <Component
        className={cn(directionClass, className)}
        style={{ ...directionStyle, ...style }}
        onChange={handleChange}
        value={value}
        defaultValue={defaultValue}
        {...props}
      />
    );
  }
  
  // For container elements with children
  return (
    <Component
      className={cn(directionClass, className)}
      style={{ ...directionStyle, ...style }}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Input component with automatic text direction
 */
export const AutoDirectionInput = (props) => {
  return <AutoDirection as="input" {...props} />;
};

/**
 * Textarea component with automatic text direction
 */
export const AutoDirectionTextarea = (props) => {
  return <AutoDirection as="textarea" {...props} />;
};

/**
 * Paragraph component with automatic text direction
 */
export const AutoDirectionP = (props) => {
  return <AutoDirection as="p" {...props} />;
};

/**
 * Span component with automatic text direction
 */
export const AutoDirectionSpan = (props) => {
  return <AutoDirection as="span" {...props} />;
};

/**
 * Div component with automatic text direction
 */
export const AutoDirectionDiv = (props) => {
  return <AutoDirection as="div" {...props} />;
};

export default AutoDirection; 