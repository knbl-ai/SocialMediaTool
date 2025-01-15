import React, { useState } from 'react'
import { Textarea } from '../ui/textarea'
import TooltipLabel from '../ui/tooltip-label'
import PDFButton from './PDFButton'
import GoogleDocButton from './GoogleDocButton'

export default function ContentGuidelinesAdvanced({ contentPlanner, contentPlannerTooltips, handleFieldChange }) {
  const [isDocOpen, setIsDocOpen] = useState(false)

  const handlePDFSuccess = (textGuidelines) => {
    if (textGuidelines) {
      handleFieldChange('textGuidelines', textGuidelines)
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      <div>
        <TooltipLabel 
          className="text-lime-500" 
          tooltip={contentPlannerTooltips.contentGuidelines}
        >
          Content Guidelines
        </TooltipLabel>
        <div className="absolute right-0 bottom-16 flex gap-2">
          <PDFButton 
            accountId={contentPlanner.accountId}
            onSuccess={handlePDFSuccess}
          />
          <GoogleDocButton 
            isOpen={isDocOpen}
            onOpenChange={setIsDocOpen}
          />
        </div>
      </div>
      <Textarea
        placeholder="Describe the content you want to generate"
        className="min-h-[38px] mt-2"
        value={contentPlanner.textGuidelines || ''}
        onChange={(e) => handleFieldChange('textGuidelines', e.target.value)}
      />
    </div>
  )
}
