import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import debounce from 'lodash/debounce'

export default function ImagePromptModal({ isOpen, onClose, contentPlanner, onUpdate }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState(contentPlanner?.uploadedImages || [])
  const [isDeleting, setIsDeleting] = useState(false)
  const [descriptions, setDescriptions] = useState({})
  const fileInputRef = useRef(null)
  const { toast } = useToast()
  const debouncedSaveRef = useRef({})

  // Initialize descriptions from uploadedImages
  useEffect(() => {
    const initialDescriptions = {}
    uploadedImages.forEach((image, index) => {
      initialDescriptions[index] = image.imageDescription || ''
    })
    setDescriptions(initialDescriptions)
  }, [uploadedImages])

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      Object.values(debouncedSaveRef.current).forEach(debouncedFn => {
        if (debouncedFn?.cancel) {
          debouncedFn.cancel()
        }
      })
    }
  }, [])

  // Create a debounced save function for each image
  const getDebouncedSave = useCallback((index) => {
    if (!debouncedSaveRef.current[index]) {
      debouncedSaveRef.current[index] = debounce(async (description) => {
        try {
          const response = await api.post(`/content-planner/${contentPlanner.accountId}/update-image-description`, {
            index,
            description
          })
          
          // Update local state with the response
          setUploadedImages(response.uploadedImages)
          onUpdate?.(response.uploadedImages)
        } catch (error) {
          console.error('Error updating description:', error)
          toast({
            title: "Error",
            description: "Failed to update image description",
            variant: "destructive",
          })
          // Revert to the last known good state
          setDescriptions(prev => ({
            ...prev,
            [index]: uploadedImages[index]?.imageDescription || ''
          }))
        }
      }, 1000)
    }
    return debouncedSaveRef.current[index]
  }, [contentPlanner?.accountId, onUpdate, toast, uploadedImages])

  const handleDescriptionChange = (index, newDescription) => {
    // Update local state immediately for responsive UI
    setDescriptions(prev => ({
      ...prev,
      [index]: newDescription
    }))
    
    // Trigger debounced save
    getDebouncedSave(index)(newDescription)
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })

    try {
      setIsUploading(true)
      const response = await api.post(
        `/content-planner/${contentPlanner.accountId}/upload-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setUploadedImages(response.uploadedImages)
      onUpdate?.(response.uploadedImages)
      toast({
        title: "Success",
        description: `${files.length} images uploaded and analyzed successfully`,
      })
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async (imageUrl, index) => {
    try {
      setIsDeleting(true)
      
      // Delete image from storage and update content planner
      await api.post(`/content-planner/${contentPlanner.accountId}/delete-image`, {
        imageUrl,
        index
      })

      // Update local state
      const newImages = uploadedImages.filter((_, i) => i !== index)
      setUploadedImages(newImages)
      onUpdate?.(newImages)

      toast({
        title: "Success",
        description: "Image deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
        </DialogHeader>
        
        {/* Upload button */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading & Analyzing...' : 'Upload Images'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1 w-full">
          <div className="grid grid-cols-2 gap-6 p-4">
            {uploadedImages.map((image, index) => (
              <div 
                key={index} 
                className="flex flex-col gap-3"
              >
                {/* Image container */}
                <div className="relative aspect-square rounded-lg overflow-hidden border bg-background">
                  <img
                    src={image.imageUrl}
                    alt={`Uploaded image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                  {/* Delete button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                    onClick={() => handleDeleteImage(image.imageUrl, index)}
                    disabled={isDeleting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* Description */}
                <Textarea
                  value={descriptions[index] || ''}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  placeholder="Image description..."
                  className="text-sm min-h-[100px] max-h-[150px] resize-none bg-muted"
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Empty state */}
        {uploadedImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2" />
            <p>No images uploaded yet</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 