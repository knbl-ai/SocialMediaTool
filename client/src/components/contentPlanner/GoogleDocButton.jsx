import React, { useState } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { FileTextIcon } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'

export default function GoogleDocButton({ accountId, onSuccess, isContentPlanner = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [url, setUrl] = useState('')

  const handleSubmit = async () => {
    if (!url) {
      toast.error('Please enter a Google Doc URL')
      return
    }

    try {
      setIsProcessing(true)
      const response = await api.post('/google-docs/parse', {
        url,
        accountId,
        isContentPlanner
      })

      if (isContentPlanner && response?.textGuidelines) {
        onSuccess(response.textGuidelines)
        toast.success('Google Doc content extracted successfully')
      } else if (!isContentPlanner && response?.accountReview) {
        onSuccess(response.accountReview)
        toast.success('Google Doc content added to account overview')
      } else {
        throw new Error('Invalid response from server')
      }

      setIsOpen(false)
      setUrl('')
    } catch (error) {
      console.error('Error processing Google Doc:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to process Google Doc'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenChange = (open) => {
    if (!isProcessing) {
      if (!open) {
        setUrl('')
      }
      setIsOpen(open)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 flex gap-1"
          disabled={isProcessing}
          onClick={() => setIsOpen(true)}
        >
          <FileTextIcon className="h-4 w-4 text-blue-500" />
          Doc
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isContentPlanner ? 'Add Google Doc Content' : 'Add Google Doc Overview'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Paste Google Doc URL here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              Make sure the Google Doc is publicly accessible or shared with view access.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!url || isProcessing}
          >
            {isProcessing ? 'Processing...' : isContentPlanner ? 'Add Content' : 'Add Overview'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 