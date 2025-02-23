import React, { useState } from 'react';
import { Shirt, Images, Loader2, Mars, Venus, Wand2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const UploadedImageMenu = ({ contentPlanner, imageUrl, index, imageDescription, onUpdate }) => {
  const [activeTextarea, setActiveTextarea] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState('female');

  const handleIconClick = (type) => {
    if (isLoading) return;
    setActiveTextarea(activeTextarea === type ? null : type);
    setPrompt('');
  };

  const handleSend = async () => {
    if (!prompt.trim()) {
      toast.error('Please add a description');
      return;
    }

    // Close textarea immediately
    setActiveTextarea(null);
    
    try {
      setIsLoading(true);
      const response = await api.post(`/content-planner/${contentPlanner.accountId}/generate-background`, {
        imageUrl,
        prompt,
        index,
        imageDescription
      });

      if (response?.uploadedImages) {
        onUpdate({
          ...contentPlanner,
          uploadedImages: response.uploadedImages
        });
        toast.success('Background generated successfully');
      } else {
        console.error('Invalid server response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating background:', error);
      toast.error(error.message || 'Failed to generate background');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClothingGen = async () => {
    // Close textarea immediately
    setActiveTextarea(null);

    try {
      setIsLoading(true);
      const response = await api.post(`/content-planner/${contentPlanner.accountId}/generate-fashion`, {
        modelPrompt: prompt.trim() || '',  // Send empty string if no prompt
        gender: selectedGender,
        garmentImage: imageUrl,
        imageIndex: index,
        imageDescription
      });

      if (response?.success) {
        // Update the parent component with the new image data
        onUpdate({
          ...contentPlanner,
          uploadedImages: response.uploadedImages
        });
        toast.success('Fashion look generated successfully');
      } else {
        console.error('Invalid server response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating fashion look:', error);
      toast.error(error.message || 'Failed to generate fashion look');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Loading overlay - positioned relative to the parent image */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
      )}
      
      {/* Menu buttons - always at the bottom */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center items-center pb-4">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full py-1.5 px-3 shadow-sm">
          <button
            onClick={() => handleIconClick('clothing')}
            className="text-orange-500 hover:text-orange-600 transition-colors p-1 rounded-full hover:bg-white/50 disabled:opacity-50"
            disabled={isLoading}
          >
            <Shirt className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleIconClick('background')}
            className="text-blue-500 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-white/50 disabled:opacity-50"
            disabled={isLoading}
          >
            <Images className="w-3.5 h-3.5" />
          </button>

          {activeTextarea && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 min-w-[220px] bg-white rounded-lg shadow-lg border border-gray-100">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTextarea === 'clothing' ? "Human model description (optional)..." : "Describe background..."}
                className="w-full h-20 py-2 px-3 resize-none rounded-t-lg text-sm text-gray-900 bg-white border-none focus:outline-none placeholder:text-gray-400"
                disabled={isLoading}
              />
              <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-end gap-1">
                {activeTextarea === 'clothing' && (
                  <>
                    <button
                      onClick={() => setSelectedGender('female')}
                      className={`p-1.5 rounded-full transition-colors ${
                        selectedGender === 'female' 
                          ? 'bg-pink-100 text-pink-600' 
                          : 'text-gray-400 hover:text-pink-600'
                      }`}
                    >
                      <Venus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedGender('male')}
                      className={`p-1.5 rounded-full transition-colors ${
                        selectedGender === 'male' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                    >
                      <Mars className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={activeTextarea === 'clothing' ? handleClothingGen : handleSend}
                  className="ml-2 p-1.5 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                  disabled={isLoading || (activeTextarea === 'background' && !prompt.trim())}
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadedImageMenu; 