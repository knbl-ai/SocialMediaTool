import React, { useState, useRef } from 'react'
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
import { FileIcon } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'

export default function PDFButton({ accountId, onSuccess }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file first')
      return
    }

    try {
      setIsUploading(true)
      setIsAnalyzing(true)
      const formData = new FormData()
      formData.append('pdf', selectedFile)
      formData.append('accountId', accountId)

      const response = await api.post('/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response?.textGuidelines) {
        onSuccess(response.textGuidelines)
        toast.success('PDF content extracted successfully')
        setIsOpen(false)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Error uploading PDF:', error)
      toast.error(error.response?.data?.message || 'Failed to upload PDF')
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const handleOpenChange = (open) => {
    if (!isUploading && !isAnalyzing) {
      if (!open) {
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
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
          disabled={isUploading || isAnalyzing}
          onClick={() => setIsOpen(true)}
        >
          <FileIcon className="h-4 w-4 text-red-500" />
          {isAnalyzing ? 'Analyzing...' : 'PDF'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload PDF</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            ref={fileInputRef}
            id="pdf-file"
            type="file"
            accept=".pdf"
            className="cursor-pointer"
            onChange={handleFileSelect}
            disabled={isUploading || isAnalyzing}
          />
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || isAnalyzing}
          >
            {isUploading ? 'Uploading...' : isAnalyzing ? 'Analyzing...' : 'Upload PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 