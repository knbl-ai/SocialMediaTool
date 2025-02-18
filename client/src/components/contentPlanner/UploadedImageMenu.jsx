import React, { useState } from 'react';
import { Shirt, Images, Send } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

const UploadedImageMenu = ({ contentPlanner, imageUrl, index, onUpdate }) => {
  const [activeTextarea, setActiveTextarea] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleIconClick = (type) => {
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
    try {
      console.log("Sending request with:", { imageUrl, prompt: prompt.trim(), index });
      
      const response = await api.post(`/content-planner/${contentPlanner.accountId}/generate-background`, {
        imageUrl,
        prompt: prompt.trim(),
        index
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
        setActiveTextarea(null);
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
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-orange-500/95 backdrop-blur-sm rounded-full shadow-lg py-1 px-2 flex items-center gap-2">
      <button
        onClick={() => handleIconClick('clothing')}
        className="text-white hover:text-white/80 transition-colors"
        disabled={isLoading}
      >
        <Shirt className="w-2.5 h-2.5" />
      </button>
      <div className="w-px h-3 bg-white/20" />
      <button
        onClick={() => handleIconClick('background')}
        className="text-white hover:text-white/80 transition-colors"
        disabled={isLoading}
      >
        <Images className="w-2.5 h-2.5" />
      </button>

      {activeTextarea && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeTextarea === 'clothing' ? "Describe clothing..." : "Describe background..."}
              className="w-full h-20 py-1.5 pr-7 resize-none rounded-lg text-gray-900 text-sm bg-white/95"
            />
            <button
              onClick={handleSend}
              className="absolute bottom-1.5 right-1.5 text-gray-600 hover:text-gray-800 transition-colors p-0.5"
              disabled={isLoading}
            >
              <Send className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadedImageMenu; 