import React, { useState } from 'react'
import { Textarea } from '../ui/textarea'
import TooltipLabel from '../ui/tooltip-label'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { FileIcon, FileTextIcon } from 'lucide-react'

export default function ContentGuidelinesAdvanced({ contentPlanner, contentPlannerTooltips, handleFieldChange }) {
  const [isPdfOpen, setIsPdfOpen] = useState(false)
  const [isDocOpen, setIsDocOpen] = useState(false)

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
          <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 flex gap-1">
                <FileIcon className="h-4 w-4 text-red-500" />
                PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload PDF</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  id="pdf-file"
                  type="file"
                  accept=".pdf"
                  className="cursor-pointer"
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDocOpen} onOpenChange={setIsDocOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 flex gap-1">
                <FileTextIcon className="h-4 w-4 text-blue-500" />
                Doc
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Google Doc Link</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  id="doc-link"
                  type="url"
                  placeholder="Paste Google Doc link here..."
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Textarea
        placeholder="Describe the content you want to generate"
        className="min-h-[38px] mt-2"
        value={contentPlanner.textGuidelines}
        onChange={(e) => handleFieldChange('textGuidelines', e.target.value)}
      />
    </div>
  )
}
