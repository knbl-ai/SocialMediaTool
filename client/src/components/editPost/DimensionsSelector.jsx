import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const dimensions = [
  { name: 'Square', size: { width: 1280, height: 1280} },
  { name: 'Horizontal', size: { width: 1280, height: 960} },
  { name: 'Horizontal Wide', size: { width: 1280, height: 720} },
  { name: 'Story', size: { width: 720, height: 1280} }
];

export const DimensionsSelector = ({ value, onChange }) => {
  const handleChange = (selectedName) => {
    const selectedDimension = dimensions.find(d => d.name === selectedName);
    if (selectedDimension) {
     
      onChange(selectedDimension.name, selectedDimension.size);
    }
  };

  // Log initial value
  React.useEffect(() => {
    const currentDimension = dimensions.find(d => d.name === value);
    console.log('DimensionsSelector - Current dimension:', value);
    console.log('DimensionsSelector - Current size:', currentDimension?.size);
  }, [value]);

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-[160px] bg-background">
        <SelectValue placeholder="Select format" />
      </SelectTrigger>
      <SelectContent>
        {dimensions.map((dimension) => (
          <SelectItem 
            key={dimension.name} 
            value={dimension.name}
          >
            {dimension.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DimensionsSelector;
