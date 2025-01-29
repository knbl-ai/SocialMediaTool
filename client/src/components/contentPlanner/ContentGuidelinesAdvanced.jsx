import React from 'react'
import { Textarea } from '../ui/textarea'
import TooltipLabel from '../ui/tooltip-label'
import PDFButton from './PDFButton'
import GoogleDocButton from './GoogleDocButton'
import WebButton from './WebButton'
import OptimizeGuidelines from './OptimizeGuidelines'

export default function ContentGuidelinesAdvanced({ contentPlanner, contentPlannerTooltips, handleFieldChange }) {
  const handleDocSuccess = (textGuidelines) => {
    if (textGuidelines) {
      handleFieldChange('textGuidelines', textGuidelines)
    }
  }

  const handleOptimize = (optimizedGuidelines) => {
    handleFieldChange('textGuidelines', optimizedGuidelines);
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="relative">
        <TooltipLabel 
          className="text-lime-500" 
          tooltip={contentPlannerTooltips.contentGuidelines}
        >
          Guidelines
        </TooltipLabel>
        <div className="absolute left-[92px] -top-[9px]">
          <OptimizeGuidelines 
            accountId={contentPlanner.accountId}
            onOptimize={handleOptimize}
          />
        </div>
        <div className="absolute right-0 -top-3 flex gap-2">
          <WebButton 
            accountId={contentPlanner.accountId}
            onSuccess={handleDocSuccess}
          />
          <PDFButton 
            accountId={contentPlanner.accountId}
            onSuccess={handleDocSuccess}
          />
          <GoogleDocButton 
            accountId={contentPlanner.accountId}
            onSuccess={handleDocSuccess}
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
