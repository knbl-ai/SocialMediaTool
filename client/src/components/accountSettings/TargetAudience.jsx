import React from 'react';
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function TargetAudience() {
  return (
    <div className="space-y-1">
      <Label htmlFor="targetAudience" className="text-yellow-500">Target Audience</Label>
      <Input
        id="targetAudience"
        placeholder="Describe your target audience"
      />
    </div>
  );
} 