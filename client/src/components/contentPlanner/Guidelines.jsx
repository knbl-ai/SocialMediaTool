import React, { memo, useCallback } from 'react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import SelectField from './SelectField';
import MODELS from '../../config/models';

const Guidelines = memo(({
  textGuidelines,
  imageGuidelines,
  onTextGuidelinesChange,
  onImageGuidelinesChange
}) => {
  const handleTextChange = useCallback((e) => {
    onTextGuidelinesChange(e.target.value);
  }, [onTextGuidelinesChange]);

  const handleImageChange = useCallback((e) => {
    onImageGuidelinesChange(e.target.value);
  }, [onImageGuidelinesChange]);
  const labelClass = "text-lime-500";
  const imageModelOptions = [
    { value: 'no_images', label: 'No Images' },
    ...(MODELS.image || [])
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="w-full">
          <Label className="text-lime-500">Text Guidelines</Label>
          <Textarea
            placeholder="Enter text generation guidelines..."
            className="min-h-[38px] mt-2"
            value={textGuidelines}
            onChange={handleTextChange}
          />
        </div>
        <div className="w-full">
          <SelectField 
            label={<span className={labelClass}>LLM Model</span>} 
            options={MODELS.llm} 
            placeholder="Select LLM model" 
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="w-full">
          <Label className="text-lime-500">Image Guidelines</Label>
          <Textarea
            placeholder="Enter image generation guidelines..."
            className="min-h-[38px] mt-2"
            value={imageGuidelines}
            onChange={handleImageChange}
          />
        </div>
        <div className="w-full">
          <SelectField 
            label={<span className={labelClass}>Image Model</span>} 
            options={imageModelOptions} 
            placeholder="Select image model" 
          />
        </div>
      </div>
    </div>
  );
});

Guidelines.displayName = 'Guidelines';

export default Guidelines; 