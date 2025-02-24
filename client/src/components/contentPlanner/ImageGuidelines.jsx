import React, { useState, useEffect } from 'react'
import { Textarea } from '../ui/textarea'
import TooltipLabel from '../ui/tooltip-label'
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"
import ImagePromptModal from './ImagePromptModal'
import SmallImagesPreview from './SmallImagesPreview'

export default function ImageGuidelines({ contentPlanner, contentPlannerTooltips, handleFieldChange }) {
  const [isUploadMode, setIsUploadMode] = useState(contentPlanner?.generateUploaded || false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadedImages, setUploadedImages] = useState(contentPlanner?.uploadedImages || [])

  useEffect(() => {
    if (contentPlanner?.generateUploaded !== undefined) {
      setIsUploadMode(contentPlanner.generateUploaded)
    }
    if (contentPlanner?.uploadedImages) {
      setUploadedImages(contentPlanner.uploadedImages)
    }
  }, [contentPlanner?.generateUploaded, contentPlanner?.uploadedImages])

  const handleModeChange = (checked) => {
    setIsUploadMode(checked)
    handleFieldChange('generateUploaded', checked)
  }

  const handleImagesUpdate = (newImages) => {
    setUploadedImages(newImages)
    handleFieldChange('uploadedImages', newImages)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col h-full relative">
        <div className="flex items-center">
          <TooltipLabel 
            className={isUploadMode ? "text-gray-400" : "text-lime-500"}
            tooltip={contentPlannerTooltips.imageGuidelines}
          >
            Image Guidelines
          </TooltipLabel>
          <div className="flex-1 flex items-center justify-center">
            <Switch
              checked={isUploadMode}
              onCheckedChange={handleModeChange}
              className="data-[checked=true]:bg-lime-500"
            />
          </div>
          <TooltipLabel 
            className={isUploadMode ? "text-lime-500" : "text-gray-400"}
            tooltip={contentPlannerTooltips.uploadImages}
          >
            Uploaded Images
          </TooltipLabel>
        </div>
        {isUploadMode ? (
          <div 
            onClick={() => setIsModalOpen(true)}
            className="min-h-[20vh] mt-2 border rounded-md bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-accent hover:cursor-pointer transition-colors"
          >
              <SmallImagesPreview images={uploadedImages} />
            <div className="flex items-center gap-2 mt-2">
              <ImageIcon className="h-5 w-5" />
              <span>{uploadedImages.length} {uploadedImages.length === 1 ? 'image' : 'images'} uploaded</span>
            </div>
          
          </div>
        ) : (
          <Textarea
            placeholder="Enter image generation guidelines..."
            className="min-h-[20vh] mt-2"
            value={contentPlanner.imageGuidelines}
            onChange={(e) => handleFieldChange('imageGuidelines', e.target.value)}
          />
        )}
      </div>
      <ImagePromptModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentPlanner={contentPlanner}
        onUpdate={handleImagesUpdate}
      />
    </div>
  )
} 