import { ImagePlus, Video, Image as ImageIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import api from "../../lib/api";
import { resizeImage } from "../../lib/imageUtils";
import { toast } from "sonner";

const DisplayImage = ({ imageUrl, templateUrl, videoUrl, templatesUrls = [], onTemplateSelect, onImageUpload, postId, showVideo: initialShowVideo = false }) => {
  const displayUrl = templateUrl || imageUrl;
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideo, setShowVideo] = useState(initialShowVideo);

  useEffect(() => {
    console.log("DisplayImage: initialShowVideo prop changed to:", initialShowVideo);
    setShowVideo(initialShowVideo);
  }, [initialShowVideo]);

  const handleToggleVideo = async () => {
    try {
      if (!postId) {
        console.error('Post ID is required to toggle video state');
        return;
      }

      const newShowVideo = !showVideo;
      console.log("DisplayImage: Toggling showVideo to:", newShowVideo);
      setShowVideo(newShowVideo);
      
      // Update showVideo in the database
      console.log("DisplayImage: Updating showVideo in database for postId:", postId);
      await api.request('patch', `/posts/${postId}`, {
        image: { showVideo: newShowVideo }
      });
      console.log("DisplayImage: Database update successful");
    } catch (error) {
      console.error('Error updating video state:', error);
      // Revert state on error
      setShowVideo(!showVideo);
    }
  };

  const handleImageClick = () => {
    if (!showVideo) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event) => {

    const file = event.target.files?.[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setIsUploading(true);

      // Resize image if needed (5MB limit)
      const processedFile = await resizeImage(file, 5);
      
      // Create FormData with processed file
      const formData = new FormData();
      formData.append('image', processedFile);

      // Upload image
      const response = await api.uploadImage(formData);
      
      // Call the callback with the new image URL
      if (onImageUpload && response.url) {
        await onImageUpload(response.url, response.url);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('No URL received from server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Determine if we should show content (either image or video)
  const hasContent = displayUrl || videoUrl;
  
  // Determine if we should show video player
  const shouldShowVideo = showVideo && videoUrl;

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <div 
        className="flex-1 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity bg-gray-50 dark:bg-gray-800 relative"
        onClick={handleImageClick}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : hasContent ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full h-full">
              {shouldShowVideo ? (
                <video 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain"
                  controls
                  autoPlay
                  loop
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : displayUrl ? (
                <img
                  src={displayUrl}
                  alt="Post preview"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                // Show upload image placeholder when in image mode but no image is available
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-2">
                  <ImagePlus className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <ImagePlus className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
          </div>
        )}

        {/* Toggle button - only show if video is available */}
        {videoUrl && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering file upload
                handleToggleVideo();
              }}
              className="p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-md transition-colors"
              title={showVideo ? "Show Image" : "Show Video"}
            >
              {showVideo ? (
                <ImageIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Video className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayImage;
