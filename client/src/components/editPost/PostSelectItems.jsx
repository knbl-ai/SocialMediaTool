import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImagePlus } from "lucide-react"

const PostSelectItems = ({ 
  type, 
  selectedModel, 
  onModelChange, 
  models, 
  placeholder, 
  buttonText 
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
      </div>
      <Textarea 
        placeholder={placeholder}
        className="min-h-[13vh] mt-2 resize-none"
      />
      <Button className="w-full mt-2">
        <ImagePlus className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
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
    </div>
  )
}

export default PostSelectItems
