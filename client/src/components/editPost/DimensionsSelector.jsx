import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const dimensions = [
  { name: 'Square', value: 'square_hd' },
  { name: 'Horizontal', value: 'landscape_4_3' },
  { name: 'Horizontal Wide', value: 'landscape_16_9' },
  { name: 'Story', value: 'portrait_16_9' }
];

export const DimensionsSelector = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
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
  )
}

export default DimensionsSelector
