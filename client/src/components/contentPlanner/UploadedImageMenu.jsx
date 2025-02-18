import React, { useState } from 'react';
import { Shirt, Images, Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

const UploadedImageMenu = ({ contentPlanner, imageUrl, index, imageDescription, onUpdate }) => {
  const [activeTextarea, setActiveTextarea] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleIconClick = (type) => {
    if (isLoading) return;
    
    if (activeTextarea === type) {
      setActiveTextarea(null);
      setPrompt('');
    } else {
      setActiveTextarea(type);
      setPrompt('');
    }
  };

  const handleSend = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Close textarea immediately
    setActiveTextarea(null);
    
    try {
      const response = await api.post(`/content-planner/${contentPlanner.accountId}/generate-background`, {
        imageUrl,
        prompt: prompt.trim(),
        index,
        imageDescription
      });

      console.log("Full response:", response);
      console.log("Server response data:", response?.data);
      
      if (response?.uploadedImages) {
        const updateData = {
          uploadedImages: response.uploadedImages,
          index,
          prompt: prompt.trim(),
          imageUrl: response.imageUrl
        };
        console.log("Sending update data to parent:", updateData);
        
        onUpdate(updateData);
        setPrompt('');
        toast({
          title: "Success",
          description: "Background generated successfully",
        });
      } else {
        console.error("Invalid response format:", response);
        toast({
          title: "Error",
          description: "Invalid response from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating background:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to generate background",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full py-1.5 px-3 shadow-sm">
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
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 min-w-[220px]">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTextarea === 'clothing' ? "Describe clothing..." : "Describe background..."}
                className="w-full h-20 py-2 px-3 pr-9 resize-none rounded-md text-sm bg-white text-gray-900 border border-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                className="absolute bottom-2 right-2 text-blue-500 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-gray-50 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UploadedImageMenu; 