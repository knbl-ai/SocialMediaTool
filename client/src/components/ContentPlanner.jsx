import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import SelectField from './contentPlanner/SelectField';
import CreativitySlider from './contentPlanner/CreativitySlider';
import Duration from './contentPlanner/Duration';
import TargetAudience from './contentPlanner/TargetAudience';
import PlatformSelector from './contentPlanner/PlatformSelector';
import { toneOptions, frequencyOptions, templateOptions, postingTimeOptions } from './contentPlanner/options';
import MODELS from '../config/models';
import { contentPlannerTooltips } from '../config/tooltips';
import HyperText from './ui/hyper-text';
import PulsatingButton from "./ui/pulsating-button";
import { useContentPlanner } from '../hooks/useContentPlanner';
import { useParams } from 'react-router-dom';
import { Skeleton } from './ui/skeleton';
import { Textarea } from './ui/textarea';
import TooltipLabel from './ui/tooltip-label';
import api from '../lib/api';
import { toast } from 'sonner';
import { usePosts as usePostsHook } from '../hooks/usePosts';
import { usePosts as usePostsContext } from '../context/PostsContext';
import { cn } from "@/lib/utils";


export default function ContentPlanner() {
  const { accountId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const {
    contentPlanner,
    loading,
    error,
    updateField
  } = useContentPlanner(accountId);

  const { fetchPosts } = usePostsHook(accountId);
  const { triggerRefresh } = usePostsContext();

  const handleGenerateContent = async () => {
    try {
      setIsLoading(true);
      const response = await api.post(`/content-planner/${accountId}/generate`);
      toast.success('Content plan generated successfully');
      
      // Fetch updated posts after generation
      const firstDay = new Date(contentPlanner.date);
      const lastDay = new Date(firstDay);
      lastDay.setMonth(lastDay.getMonth() + (contentPlanner.duration === 'month' ? 1 : 0));
      lastDay.setDate(lastDay.getDate() + (contentPlanner.duration === 'week' ? 7 : 0));
      
      // Force a complete refresh of posts
      await fetchPosts({
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
        platform: contentPlanner.platforms[0],
        forceRefresh: true
      });

      // Trigger refresh in PostsDashboard
      triggerRefresh();
    } catch (err) {
      toast.error('Failed to generate content plan');
      console.error('Error generating content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-500">Error loading content planner: {error}</div>;
  }

  const handleFieldChange = async (field, value) => {
    console.log(field, value);
    try {
      await updateField(field, value);
    } catch (err) {
      // Error is already logged in the hook
    }
  };

  // Add no_images option to image model options
  const imageModelOptions = [
    { value: 'no_images', label: 'No Images' },
    ...(MODELS.image || [])
  ];

  return (
    <>
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
              <div className="w-full">
                <TargetAudience
                  value={contentPlanner.audience}
                  onChange={(value) => handleFieldChange('audience', value)}
                  tooltip={contentPlannerTooltips.audience}
                />
              </div>
              <div className="w-full">
                <TooltipLabel 
                  className="text-lime-500" 
                  tooltip={contentPlannerTooltips.contentGuidelines}
                >
                  Content Guidelines
                </TooltipLabel>
                <Textarea
                  placeholder="Enter posts generation guidelines..."
                  className="min-h-[38px] mt-2"
                  value={contentPlanner.textGuidelines}
                  onChange={(e) => handleFieldChange('textGuidelines', e.target.value)}
                />
              </div>
              <div className="w-full">
                <TooltipLabel 
                  className="text-lime-500" 
                  tooltip={contentPlannerTooltips.imageGuidelines}
                >
                  Image Guidelines
                </TooltipLabel>
                <Textarea
                  placeholder="Enter image generation guidelines..."
                  className="min-h-[38px] mt-2"
                  value={contentPlanner.imageGuidelines}
                  onChange={(e) => handleFieldChange('imageGuidelines', e.target.value)}
                />
              </div>
              <div className="w-full">
                <CreativitySlider
                  value={contentPlanner.creativity}
                  onChange={(value) => handleFieldChange('creativity', value)}
                  tooltip={contentPlannerTooltips.creativity}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SelectField
                label="Voice"
                options={toneOptions}
                placeholder="Select tone"
                labelClass="text-lime-500"
                value={contentPlanner.voice}
                onChange={(value) => handleFieldChange('voice', value)}
                tooltip={contentPlannerTooltips.voice}
              />
              <SelectField
                label="LLM"
                options={MODELS.llm}
                placeholder="Select LLM model"
                labelClass="text-lime-500"
                value={contentPlanner.llm}
                onChange={(value) => handleFieldChange('llm', value)}
                tooltip={contentPlannerTooltips.llm}
              />
              <SelectField
                label="Image Model"
                options={imageModelOptions}
                placeholder="Select image model"
                labelClass="text-lime-500"
                value={contentPlanner.imageModel}
                onChange={(value) => handleFieldChange('imageModel', value)}
                tooltip={contentPlannerTooltips.imageModel}
              />
              <SelectField
                label="Template"
                options={templateOptions}
                placeholder="Select template option"
                labelClass="text-lime-500"
                value={contentPlanner.template}
                onChange={(value) => handleFieldChange('template', value)}
                tooltip={contentPlannerTooltips.template}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="w-full col-span-2">
                <Duration
                  date={contentPlanner.date}
                  duration={contentPlanner.duration}
                  onDateChange={(value) => handleFieldChange('date', value)}
                  onDurationChange={(value) => handleFieldChange('duration', value)}
                  tooltip={contentPlannerTooltips}
                />
              </div>
              <div className="w-full">
                <SelectField
                  label="Post Frequency"
                  options={frequencyOptions}
                  placeholder="Select frequency"
                  labelClass="text-lime-500"
                  value={contentPlanner.frequency.toString()}
                  onChange={(value) => handleFieldChange('frequency', parseInt(value, 10))}
                  tooltip={contentPlannerTooltips.frequency}
                />
              </div>
              <div className="w-full">
                <SelectField
                  label="Posting Time"
                  options={postingTimeOptions}
                  placeholder="Select time"
                  labelClass="text-lime-500"
                  value={contentPlanner.postingTime.toString()}
                  onChange={(value) => handleFieldChange('postingTime', parseInt(value, 10))}
                  tooltip={contentPlannerTooltips.postingTime}
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-4 justify-center">
                <div>
                  <PlatformSelector
                    value={contentPlanner.platforms}
                    onChange={(value) => handleFieldChange('platforms', value)}
                    tooltip={contentPlannerTooltips.platforms}
                  />
                </div>
                <div className="pt-8">
                  <PulsatingButton 
                    className="bg-[#5CB338] hover:bg-[#4a9c2d] text-white w-[200px]" 
                    pulseColor="92 179 56"
                    duration="2s"
                    onClick={handleGenerateContent}
                    disabled={isLoading}
                  >
                    Generate Content
                  </PulsatingButton>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 flex items-center gap-2 ">
             
                <div
                    onClick={() => handleFieldChange('autoRenew', !contentPlanner.autoRenew)}
                    className={cn(
                      "px-3 py-1 rounded-full cursor-pointer transition-all duration-500 select-none w-4 h-6",
                      contentPlanner.autoRenew 
                        ? "bg-green-500 animate-pulse-subtle text-white" 
                        : "bg-gray-200 text-gray-600"
                    )}
                  >

                  </div>
                     
                  <TooltipLabel 
                  tooltip="Enable automatic content plan renewal"
                  className="text-sm text-lime-500"
                >
                Auto-renew
                </TooltipLabel>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    {isLoading && (
      <div className="w-full mt-10">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-full animate-progress" />
        </div>
      </div>
    )}
    </>
  );
}
