import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TooltipLabel from '@/components/ui/tooltip-label';

const SelectField = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder, 
  labelClass,
  tooltip 
}) => {
  return (
    <div className="w-full">
      <TooltipLabel className={labelClass} tooltip={tooltip}>
        {label}
      </TooltipLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-2">
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