import React from 'react';
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import SelectField from './SelectField';
import MODELS from '../../config/models';

// Add "no images" option to image models
const imageModelOptions = [
  { value: 'no_images', label: 'No Images' },
  ...(MODELS.image || [])
];
const labelClass = "text-lime-500";
export default function Guidelines() {
  return (
    <div className="grid grid-cols-4 gap-4 items-top">
      <div className="space-y-1">
        <Label htmlFor="textGuidelines" className={labelClass}>Text Guidelines</Label>
        <Textarea
          id="textGuidelines"
          placeholder="Enter text generation guidelines"
          className="min-h-[60px]"
        />
      </div>

      <div>
        <SelectField 
          label={<span className={labelClass}>LLM Model</span>} 
          options={MODELS.llm} 
          placeholder="Select LLM model" 
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="imageGuidelines" className={labelClass}>Image Guidelines</Label>
        <Textarea
          id="imageGuidelines"
          placeholder="Enter image generation guidelines"
          className="min-h-[60px]"
        />
      </div>

      <div>
        <SelectField 
          label={<span className={labelClass}>Image Model</span>} 
          options={imageModelOptions} 
          placeholder="Select image model" 
        />
      </div>
    </div>
  );
} 