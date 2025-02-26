import * as React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { containsHebrew } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, value, defaultValue, onChange, ...props }, ref) => {
  const [direction, setDirection] = useState('ltr');
  const [currentText, setCurrentText] = useState(value || defaultValue || '');
  
  // Detect text direction on initial render and when value changes
  useEffect(() => {
    const textToCheck = value !== undefined ? value : currentText;
    const newDirection = containsHebrew(textToCheck) ? 'rtl' : 'ltr';
    if (newDirection !== direction) {
      setDirection(newDirection);
    }
  }, [value, currentText, direction]);
  
  // Handle text changes
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
  
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-gray-50 dark:bg-gray-800 px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        direction === 'rtl' ? 'text-right' : '',
        className
      )}
      style={directionStyle}
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      data-auto-dir="true"
      {...props} 
    />
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
