import React, { memo, useCallback } from 'react';
import { Textarea } from '../ui/textarea';
import TooltipLabel from '../ui/tooltip-label';

const TargetAudience = memo(({ value, onChange, tooltip }) => {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <TooltipLabel 
                  className="text-lime-500" 
                  tooltip={tooltip}
      >
        Target Audience
      </TooltipLabel>
      <Textarea
        placeholder="Describe your target audience..."
        className="h-[20vh]"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
});

TargetAudience.displayName = 'TargetAudience';

export default TargetAudience; 