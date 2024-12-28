import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import SelectField from './accountSettings/SelectField';
import CreativitySlider from './accountSettings/CreativitySlider';
import Guidelines from './accountSettings/Guidelines';
import Duration from './accountSettings/Duration';
import TargetAudience from './accountSettings/TargetAudience';
import { toneOptions, frequencyOptions, templateOptions } from './accountSettings/options';
import MODELS from '../config/models';
import HyperText from './ui/hyper-text';
import PulsatingButton from "./ui/pulsating-button";

export default function AccountSettings() {
  return (
    <Card className="w-full mt-10">
      <CardHeader className="flex justify-center items-center">
        <HyperText className="text-2xl font-bold" startOnView={true}>Content Planner</HyperText>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grid layout for selects and inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SelectField label="Brand Voice" options={toneOptions} placeholder="Select tone" labelClass="text-yellow-500" />
          <SelectField label="Template" options={templateOptions} placeholder="Select template option" labelClass="text-yellow-500" />
          <TargetAudience />
          <CreativitySlider />
        </div>

        <Guidelines />

        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-6">
            <Duration />
          </div>
          <div className="col-span-3">
            <SelectField label="Post Frequency" options={frequencyOptions} placeholder="Select frequency" labelClass="text-green-500"/>
          </div>
          <div className="col-span-3">
            <PulsatingButton 
              className="bg-[#5CB338] hover:bg-[#4a9c2d] text-white w-[22vw] mt-7" 
              pulseColor="92 179 56"
              duration="2s"
            >
              Generate Content
            </PulsatingButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
