import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TooltipLabel from '@/components/ui/tooltip-label';
import { cn } from "@/lib/utils";

const SelectField = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder, 
  labelClass,
  tooltip,
  disabled = false
}) => {
  return (
    <div className="w-full">
      <TooltipLabel className={labelClass} tooltip={tooltip}>
        {label}
      </TooltipLabel>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(
          "mt-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectField; 