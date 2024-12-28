import React from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import SelectField from './contentPlanner/SelectField';
import CreativitySlider from './contentPlanner/CreativitySlider';
import Guidelines from './contentPlanner/Guidelines';
import Duration from './contentPlanner/Duration';
import TargetAudience from './contentPlanner/TargetAudience';
import { toneOptions, frequencyOptions, templateOptions } from './contentPlanner/options';
import MODELS from '../config/models';
import HyperText from './ui/hyper-text';
import PulsatingButton from "./ui/pulsating-button";
import { useContentPlanner } from '../hooks/useContentPlanner';
import { useParams } from 'react-router-dom';
import { Skeleton } from './ui/skeleton';

export default function ContentPlanner() {
  const { accountId } = useParams();
  const {
    contentPlanner,
    loading,
    error,
    updateField
  } = useContentPlanner(accountId);

  if (error) {
    return <div className="text-red-500">Error loading content planner: {error}</div>;
  }

  const handleFieldChange = async (field, value) => {
    try {
      await updateField(field, value);
    } catch (err) {
      // Error is already logged in the hook
    }
  };

  return (
    <Card className="w-full mt-10">
      <CardHeader className="flex justify-center items-center">
        <HyperText className="text-2xl font-bold" startOnView={true}>Content Planner</HyperText>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SelectField
                label="Voice"
                options={toneOptions}
                placeholder="Select tone"
                labelClass="text-yellow-500"
                value={contentPlanner.voice}
                onChange={(value) => handleFieldChange('voice', value)}
              />
              <SelectField
                label="Template"
                options={templateOptions}
                placeholder="Select template option"
                labelClass="text-yellow-500"
                value={contentPlanner.template}
                onChange={(value) => handleFieldChange('template', value)}
              />
              <TargetAudience
                value={contentPlanner.audience}
                onChange={(value) => handleFieldChange('audience', value)}
              />
              <CreativitySlider
                value={contentPlanner.creativity}
                onChange={(value) => handleFieldChange('creativity', value)}
              />
            </div>

            <Guidelines
              textGuidelines={contentPlanner.textGuidelines}
              imageGuidelines={contentPlanner.imageGuidelines}
              onTextGuidelinesChange={(value) => handleFieldChange('textGuidelines', value)}
              onImageGuidelinesChange={(value) => handleFieldChange('imageGuidelines', value)}
            />

            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-6">
                <Duration
                  date={contentPlanner.date}
                  duration={contentPlanner.duration}
                  autoRenew={contentPlanner.autoRenew}
                  onDateChange={(value) => handleFieldChange('date', value)}
                  onDurationChange={(value) => handleFieldChange('duration', value)}
                  onAutoRenewChange={(value) => handleFieldChange('autoRenew', value)}
                />
              </div>
              <div className="col-span-3">
                <SelectField
                  label="Post Frequency"
                  options={frequencyOptions}
                  placeholder="Select frequency"
                  labelClass="text-green-500"
                  value={contentPlanner.frequency}
                  onChange={(value) => handleFieldChange('frequency', value)}
                />
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
