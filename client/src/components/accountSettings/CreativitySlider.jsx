import React from 'react';
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

export default function CreativitySlider() {
  return (
    <div className="space-y-1">
      <Label htmlFor="creativitySlider" className="text-yellow-500">Creativity Level</Label>
      <div>
        <Slider
          defaultValue={[50]}
          max={100}
          step={1}
          className="
    [&_[role=slider]]:bg-orange-500 
    [&_[role=slider]]:border-orange-500 
    [&_[role=slider]]:hover:bg-orange-600
    [&>span]:bg-blue-500
    [&>span>span]:bg-orange-500
    [&_[role=slider]]:shadow-none
    [&_[role=slider]]:ring-0
    [&_[role=slider]]:ring-offset-0
  "
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span className="text-blue-500">Stick to Guidelines</span>
          <span className="text-orange-500">Creative</span>
        </div>
      </div>
    </div>
  );
} 