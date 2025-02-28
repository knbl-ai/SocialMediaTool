import { Video, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import VideoUploader from "./VideoUploader";
import ImageUploader from "./ImageUploader";

const DisplayImage = ({ imageUrl, templateUrl, videoUrl, templatesUrls = [], onTemplateSelect, onImageUpload, postId, showVideo: initialShowVideo = false }) => {
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

  return (
    <div className="absolute inset-0 flex flex-col">
      {showVideo ? (
        <VideoUploader 
          videoUrl={videoUrl} 
          onVideoUpload={(url) => {
            // This will be implemented later
            console.log("Video upload not implemented yet");
          }}
          postId={postId}
        />
      ) : (
        <ImageUploader
          imageUrl={imageUrl}
          templateUrl={templateUrl}
          onImageUpload={onImageUpload}
        />
      )}

      {/* Toggle button - always show regardless of video availability */}
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
    </div>
  );
};

export default DisplayImage;
