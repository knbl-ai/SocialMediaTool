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
import { GlobeIcon } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'

export default function WebButton({ accountId, onSuccess, isContentPlanner = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [url, setUrl] = useState('')

  const handleSubmit = async () => {
    if (!url) {
      toast.error('Please enter a website URL')
      return
    }

    try {
      setIsProcessing(true)
      let response;

      if (isContentPlanner) {
        // Content planner flow - use web/analyze endpoint
        response = await api.post('/web/analyze', {
          url,
          accountId
        })
        
        if (response?.textGuidelines) {
          onSuccess(response.textGuidelines)
          toast.success('Website content extracted successfully')
        }
      } else {
        // Account overview flow - use accounts/:id/analyze endpoint
        response = await api.post(`/accounts/${accountId}/analyze`, {
          url
        })
        
        if (response?.accountReview) {
          onSuccess(response.accountReview)
          toast.success('Website analyzed and overview updated')
        }
      }

      setIsOpen(false)
      setUrl('')
    } catch (error) {
      console.error('Error analyzing website:', error)
      toast.error(error.message || 'Failed to analyze website')
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
          <GlobeIcon className="h-4 w-4 text-purple-500" />
          Web
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isContentPlanner ? 'Add Website Content' : 'Analyze Website'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Paste website URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!url || isProcessing}
          >
            {isProcessing ? 'Processing...' : isContentPlanner ? 'Add Content' : 'Analyze Website'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 