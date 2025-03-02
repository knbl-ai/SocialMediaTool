import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImagePlus, Video, MessageSquare, Image } from "lucide-react"

const PostSelectItems = ({ 
  type, 
  selectedModel, 
  onModelChange, 
  models, 
  placeholder, 
  buttonText,
  value,
  onChange,
  onGenerate,
  isLoading,
  currentPost,
  useImageToVideo,
  onToggleImageToVideo
}) => {
  // Define type-specific properties
  const getTypeProperties = () => {
    switch(type) {
      case 'video':
        return {
          icon: <Video className="w-4 h-4 mr-2" />,
          headerText: 'Video Generation',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'text':
        return {
          icon: <MessageSquare className="w-4 h-4 mr-2" />,
          headerText: 'Text Generation',
          buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white'
        };
      case 'image':
      default:
        return {
          icon: <ImagePlus className="w-4 h-4 mr-2" />,
          headerText: 'Image Generation',
          buttonClass: 'bg-green-600 hover:bg-green-700 text-white'
        };
    }
  };

  const { icon, headerText, buttonClass } = getTypeProperties();
  
  // Check if image is available for video generation
  const hasImage = type === 'video' && currentPost?.image?.url;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{headerText}</h3>
        {type === 'video' && (
          <div 
            className={`flex items-center ${hasImage ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => hasImage && onToggleImageToVideo && onToggleImageToVideo()}
            title={hasImage ? 'Toggle image-to-video mode' : 'No image available for image-to-video'}
          >
            <Image 
              className={`w-4 h-4 ml-2 ${useImageToVideo ? 'text-blue-500' : 'text-gray-400'}`} 
            />
          </div>
        )}
      </div>
      <Textarea 
        placeholder={placeholder}
        className="min-h-[17vh] resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
       <Select 
        value={selectedModel}
        onValueChange={onModelChange}
      >
        <SelectTrigger className="w-full mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map(model => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        className={`w-full mt-2 ${buttonClass}`}
        onClick={onGenerate}
        disabled={!value || isLoading}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating...
          </div>
        ) : (
          <>
            {icon}
            {buttonText}
          </>
        )}
      </Button>
     
    </div>
  )
}

export default PostSelectItems
