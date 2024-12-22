import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const dimensions = [
  { name: 'Square', value: 'square', size: { width: 1280, height: 1280} },
  { name: 'Horizontal', value: 'horizontal', size: { width: 1280, height: 960} },
  { name: 'Horizontal Wide', value: 'horizontal_wide', size: { width: 1280, height: 720} },
  { name: 'Story', value: 'story', size: { width: 720, height: 1280} }
];

export const DimensionsSelector = ({ value, onChange }) => {
  const handleChange = (selectedValue) => {
    const selectedDimension = dimensions.find(d => d.value === selectedValue);
    if (selectedDimension) {
      onChange(selectedValue, selectedDimension.size);
    }
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px] bg-white">
        <SelectValue placeholder="Select format" />
      </SelectTrigger>
      <SelectContent>
        {dimensions.map((dimension) => (
          <SelectItem 
            key={dimension.value} 
            value={dimension.value}
          >
            {dimension.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DimensionsSelector;
