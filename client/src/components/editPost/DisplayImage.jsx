import { Video, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "../../lib/api";
import VideoUploader from "./VideoUploader";
import ImageUploader from "./ImageUploader";

const DisplayImage = ({ imageUrl, templateUrl, videoUrl, templatesUrls = [], onTemplateSelect, onImageUpload, postId, showVideo: initialShowVideo = false }) => {
  const [showVideo, setShowVideo] = useState(initialShowVideo);
  const videoUrlRef = useRef(videoUrl);

  useEffect(() => {
    console.log("DisplayImage: initialShowVideo prop changed to:", initialShowVideo);
    setShowVideo(initialShowVideo);
  }, [initialShowVideo]);

  useEffect(() => {
    console.log("DisplayImage: videoUrl prop changed to:", videoUrl);
    videoUrlRef.current = videoUrl;
  }, [videoUrl]);

  return (
    <div className="absolute inset-0 flex flex-col">
      {showVideo ? (
        <VideoUploader 
          videoUrl={videoUrl} 
          onVideoUpload={(videoUrl, screenshotUrl) => {
            console.log("DisplayImage: VideoUploader callback called with:", { videoUrl, screenshotUrl });
            if (onImageUpload) {
              console.log("DisplayImage: Calling parent onImageUpload with video data");
              // Call the parent's onImageUpload with the screenshot URL
              // This ensures the image.url remains unchanged while updating
              // the video and screenshot URLs
              onImageUpload(null, { video: videoUrl, videoscreenshot: screenshotUrl });
            } else {
              console.warn("DisplayImage: Parent onImageUpload callback is not defined");
            }
          }}
          postId={postId}
          key={`video-uploader-${videoUrl}`} // Add key to force re-render when URL changes
        />
      ) : (
        <ImageUploader
          imageUrl={imageUrl}
          templateUrl={templateUrl}
          onImageUpload={onImageUpload}
        />
      )}
    </div>
  );
};

export default DisplayImage;
