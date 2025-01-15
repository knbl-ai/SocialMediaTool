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

export default function GoogleDocButton({ accountId, onSuccess }) {
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
        accountId
      })

      if (response?.textGuidelines) {
        onSuccess(response.textGuidelines)
        toast.success('Google Doc content extracted successfully')
        setIsOpen(false)
        setUrl('')
      }
    } catch (error) {
      console.error('Error processing Google Doc:', error)
      toast.error(error.response?.data?.message || 'Failed to process Google Doc')
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
          <DialogTitle>Add Google Doc</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Paste Google Doc URL here"
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
            {isProcessing ? 'Processing...' : 'Add Content'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 