import { Video } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../../lib/api";

const VideoUploader = ({ videoUrl, onVideoUpload, postId }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);

  // Update internal state when videoUrl prop changes
  useEffect(() => {
    setCurrentVideoUrl(videoUrl);
  }, [videoUrl]);

  const handleVideoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast.error('Video file is too large. Maximum size is 50MB');
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('video', file);
      
      if (postId) {
        formData.append('postId', postId);
      }
      
      const response = await api.uploadVideo(formData);
      
      if (response.videoUrl && response.screenshotUrl) {
        toast.success('Video uploaded successfully');
        
        // Update internal state immediately for a faster UI update
        setCurrentVideoUrl(response.videoUrl);
        
        // Call the callback with both URLs
        if (onVideoUpload) {
          onVideoUpload(response.videoUrl, response.screenshotUrl);
        } else {
          console.warn('onVideoUpload callback is not defined');
        }
      } else {
        console.error('Missing videoUrl or screenshotUrl in response:', response);
        toast.error('Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
      
      // Clear the input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="video/*"
        onChange={handleFileChange}
      />
      <div 
        className="flex-1 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity bg-gray-50 dark:bg-gray-800 relative"
        onClick={handleVideoClick}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : currentVideoUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full h-full">
              <video 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain"
                controls
                autoPlay
                loop
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                key={currentVideoUrl} // Add key to force re-render when URL changes
              >
                <source src={currentVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Video className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload video (any aspect ratio)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader; 