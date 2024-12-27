import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import api from "../../lib/api";

const DisplayImage = ({ imageUrl, templateUrl, templatesUrls = [], onTemplateSelect, onImageUpload }) => {
  const displayUrl = templateUrl || imageUrl;
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload image
      const response = await api.uploadImage(formData);
      
      // Call the callback with the new image URL
      if (onImageUpload && response.url) {
        // Pass both URL and template URL (same as image URL initially)
        await onImageUpload(response.url, response.url);
      } else {
        throw new Error('No URL received from server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
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
        accept="image/*"
        onChange={handleFileChange}
      />
      <div 
        className="flex-1 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity bg-gray-50 relative"
        onClick={handleImageClick}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : displayUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full h-full">
              <img
                src={displayUrl}
                alt="Post preview"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <ImagePlus className="h-12 w-12 text-gray-400" />
            <span className="text-sm text-gray-500">Click to upload image</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayImage;
