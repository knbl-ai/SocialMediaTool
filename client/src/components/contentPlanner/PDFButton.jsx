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

export default function PDFButton({ accountId, onSuccess, isContentPlanner = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const validatePDFFile = (file) => {
    // Check file type
    if (file.type !== 'application/pdf') {
      throw new Error('Please upload a PDF file');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('PDF file size must be less than 5MB');
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new Error('PDF file is empty');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validatePDFFile(file);
      setSelectedFile(file);
    } catch (error) {
      toast.error(error.message);
      e.target.value = ''; // Reset input
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file first');
      return;
    }

    try {
      setIsUploading(true);
      setIsAnalyzing(true);
      
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('accountId', accountId);
      formData.append('isContentPlanner', isContentPlanner);

      const response = await api.post('/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (isContentPlanner && response?.textGuidelines) {
        onSuccess(response.textGuidelines);
        toast.success('PDF content extracted successfully');
      } else if (!isContentPlanner && response?.accountReview) {
        onSuccess(response.accountReview);
        toast.success('PDF content added to account overview');
      } else {
        throw new Error('Invalid response from server');
      }

      setIsOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload PDF';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!isUploading && !isAnalyzing) {
      if (!open) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      setIsOpen(open);
    }
  };

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
          <DialogTitle>
            {isContentPlanner ? 'Add PDF Content' : 'Upload PDF Overview'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              id="pdf-file"
              type="file"
              accept=".pdf,application/pdf"
              className="cursor-pointer"
              onChange={handleFileSelect}
              disabled={isUploading || isAnalyzing}
            />
            <p className="text-sm text-muted-foreground">
              Maximum file size: 5MB. Only PDF files are supported.
            </p>
          </div>
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
  );
} 