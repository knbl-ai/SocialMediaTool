import React from 'react';
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function AutoRenewal() {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="autoRenewal">Auto Renewal</Label>
      <Switch id="autoRenewal" />
    </div>
  );
} 