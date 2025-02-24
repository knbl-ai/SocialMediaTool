import React, { memo, useCallback } from 'react';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import TooltipLabel from '../ui/tooltip-label';

const CreativitySlider = memo(({ value, onChange, tooltip }) => {
  const handleChange = useCallback(([newValue]) => {
    onChange(newValue);
  }, [onChange]);

  return (
    <div className="space-y-2">
        <TooltipLabel 
                  className="text-lime-500" 
                  tooltip={tooltip}
      >
        Creativity Level
      </TooltipLabel>
      <div className="pt-4">
        <Slider
          value={[value]}
          onValueChange={handleChange}
          min={0}
          max={1}
          step={0.1}
          className="
    [&_[role=slider]]:bg-orange-500 
    [&_[role=slider]]:border-orange-500 
    [&_[role=slider]]:hover:bg-orange-600
    [&>span>span]:bg-orange-500
    [&_[role=slider]]:shadow-none
    [&_[role=slider]]:ring-0
    [&_[role=slider]]:ring-offset-0
  "
        />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span className="text-gray-500">Stick to Guidelines</span>
          <span className="text-orange-500">Creative</span>
        </div>
      </div>
    </div>
  );
});

CreativitySlider.displayName = 'CreativitySlider';

export default CreativitySlider; 