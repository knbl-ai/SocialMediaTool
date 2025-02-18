import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload, X, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import UploadedImageMenu from './UploadedImageMenu'

export default function ImagePromptModal({ isOpen, onClose, contentPlanner, onUpdate }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadingImageIndex, setLoadingImageIndex] = useState(null)
  const [state, setState] = useState({
    images: contentPlanner?.uploadedImages || [],
    descriptions: {}
  })
  
  const fileInputRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const { toast } = useToast()

  // Initialize descriptions when contentPlanner changes
  useEffect(() => {
    if (contentPlanner?.uploadedImages) {
      setState(prev => ({
        ...prev,
        images: contentPlanner.uploadedImages,
        descriptions: contentPlanner.uploadedImages.reduce((acc, img, idx) => {
          acc[idx] = img.imageDescription || '';
          return acc;
        }, {})
      }));
    }
  }, [contentPlanner?.uploadedImages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveChanges = useCallback(async (newState) => {
    if (!contentPlanner?._id) return;
    
    try {
      const response = await api.post(
        `/content-planner/${contentPlanner.accountId}/update-image-description`,
        { 
          index: newState.currentIndex,
          description: newState.images[newState.currentIndex].imageDescription
        }
      );

      if (response?.uploadedImages) {
        onUpdate(response.uploadedImages);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  }, [contentPlanner?._id, contentPlanner?.accountId, onUpdate, toast]);

  const handleDescriptionChange = useCallback((index, newDescription) => {
    // Update local state immediately
    setState(prev => {
      const newImages = prev.images.map((img, i) => 
        i === index ? { ...img, imageDescription: newDescription } : img
      );

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for API call
      saveTimeoutRef.current = setTimeout(() => {
        saveChanges({ ...prev, images: newImages, currentIndex: index });
      }, 1000);

      return {
        images: newImages,
        descriptions: { ...prev.descriptions, [index]: newDescription }
      };
    });
  }, [saveChanges]);

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

      setState(prev => ({
        ...prev,
        images: response.uploadedImages
      }));
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
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async (imageUrl, index) => {
    try {
      setIsDeleting(true)
      
      await api.post(`/content-planner/${contentPlanner.accountId}/delete-image`, {
        imageUrl,
        index
      })

      setState(prev => {
        const newImages = prev.images.filter((_, i) => i !== index);
        return {
          ...prev,
          images: newImages
        };
      });
      
      onUpdate?.(state.images.filter((_, i) => i !== index))

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

  const handleBackgroundUpdate = useCallback((responseData) => {
    const { uploadedImages, index, prompt, imageUrl } = responseData;
    
    setLoadingImageIndex(index);
    
    setState(prev => {
      const newImages = [...uploadedImages];
      if (imageUrl && typeof index === 'number') {
        newImages[index] = {
          ...newImages[index],
          imageUrl,
          imageDescription: prompt
        };
      }
      
      return {
        ...prev,
        images: newImages,
        descriptions: prompt && typeof index === 'number' 
          ? { ...prev.descriptions, [index]: prompt }
          : prev.descriptions
      };
    });
    
    onUpdate?.(uploadedImages);
    setLoadingImageIndex(null);
  }, [onUpdate]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="relative"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span className="ml-2">Upload Images</span>
              </>
            )}
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

        <ScrollArea className="flex-1 w-full">
          <div className="grid grid-cols-2 gap-6 p-4">
            {state.images.map((image, index) => (
              <div 
                key={index} 
                className="flex flex-col gap-3"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden border bg-background flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={image.imageUrl}
                      alt={image.imageDescription || 'Uploaded image'}
                      className="max-w-full max-h-full object-contain"
                    />
                    {loadingImageIndex === index && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    <UploadedImageMenu
                      contentPlanner={contentPlanner}
                      imageUrl={image.imageUrl}
                      index={index}
                      imageDescription={image.imageDescription}
                      onUpdate={handleBackgroundUpdate}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                    onClick={() => handleDeleteImage(image.imageUrl, index)}
                    disabled={isDeleting || loadingImageIndex === index}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Textarea
                  value={state.descriptions[index] || state.images[index].imageDescription || ''}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  placeholder="Image description..."
                  className="text-sm min-h-[100px] max-h-[150px] resize-none bg-muted"
                  disabled={loadingImageIndex === index}
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        {state.images.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2" />
            <p>No images uploaded yet</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 