import * as React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { containsHebrew } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, value, defaultValue, onChange, ...props }, ref) => {
  const [direction, setDirection] = useState('ltr');
  const [currentText, setCurrentText] = useState(value || defaultValue || '');
  
  // Detect text direction on initial render and when value changes
  useEffect(() => {
    // Skip direction detection for non-text inputs
    if (type === 'number' || type === 'date' || type === 'time' || type === 'file') {
      return;
    }
    
    const textToCheck = value !== undefined ? value : currentText;
    const newDirection = containsHebrew(textToCheck) ? 'rtl' : 'ltr';
    if (newDirection !== direction) {
      setDirection(newDirection);
    }
  }, [value, currentText, direction, type]);
  
  // Handle text changes
  const handleChange = (e) => {
    const newValue = e.target.value;
    setCurrentText(newValue);
    
    if (onChange) {
      onChange(e);
    }
  };
  
  // Apply direction styles only for text-based inputs
  const shouldApplyDirection = !['number', 'date', 'time', 'file'].includes(type);
  const directionStyle = shouldApplyDirection && direction === 'rtl' 
    ? { textAlign: 'right', direction: 'rtl' } 
    : {};
  
  // Determine if we should add the data-auto-dir attribute
  const autoDirectProps = shouldApplyDirection ? { 'data-auto-dir': 'true' } : {};
  
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-gray-50 dark:bg-gray-800 px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        shouldApplyDirection && direction === 'rtl' ? 'text-right' : '',
        className
      )}
      style={directionStyle}
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      {...autoDirectProps}
      {...props} 
    />
  );
})
Input.displayName = "Input"

export { Input }
