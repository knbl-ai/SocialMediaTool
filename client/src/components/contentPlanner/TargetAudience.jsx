import React, { memo, useCallback } from 'react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const TargetAudience = memo(({ value, onChange }) => {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label className="text-lime-500">Target Audience</Label>
      <Textarea
        placeholder="Describe your target audience..."
        className=""
        value={value}
        onChange={handleChange}
      />
    </div>
  );
});

TargetAudience.displayName = 'TargetAudience';

export default TargetAudience; 