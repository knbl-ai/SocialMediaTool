import { Video } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const VideoUploader = ({ videoUrl, onVideoUpload, postId }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    // This is just a placeholder for now - we'll implement the actual upload functionality later
    toast.info("Video upload functionality will be implemented soon");
    
    // Clear the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        ) : videoUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full h-full">
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
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Video className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload video</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader; 