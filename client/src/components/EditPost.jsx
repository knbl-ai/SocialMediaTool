import React from 'react';
import { 
  ImagePlus, 
  Wand2, 
  Upload, 
  PlayCircle, 
  MessageSquarePlus,
  X 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";

const EditPost = ({ show, onClose, date }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Edit Post for {date?.toLocaleDateString()}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100">
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>

      <div className="space-y-8">
        {/* Top Section: Image Preview and Generation Controls */}
        <div className="flex gap-6">
          {/* Left - Image Preview */}
          <div className="w-[450px] h-[450px] bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ImagePlus className="h-12 w-12 text-gray-400" />
          </div>

          {/* Right - Image and Video Controls */}
          <div className="flex-1 space-y-6">
            {/* Image Generation Section */}
            <div className="space-y-4 w-[350px]">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Image Prompt
                </label>
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  className="resize-none h-20"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" title="Generate Image">
                  <Wand2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" title="Upload Image">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Video Generation Section */}
            <div className="space-y-4 w-[350px]">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Video Prompt
                </label>
                <Textarea
                  placeholder="Describe the video you want to generate..."
                  className="resize-none h-20"
                />
              </div>
              <Button variant="outline" size="icon" title="Generate Video">
                <PlayCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Text Controls */}
        <div className="flex gap-6">
          {/* Left - Post Text */}
          <div className="w-[450px] space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Post Text
              </label>
              <Textarea
                placeholder="Enter your post text..."
                className="resize-none h-20"
              />
            </div>
          </div>

          {/* Right - Text Generation */}
          <div className="w-[350px] space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Text Generation Prompt
              </label>
              <Textarea
                placeholder="Prompt for generating post text..."
                className="resize-none h-20"
              />
            </div>
            <Button variant="outline" size="icon" title="Generate Text">
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditPost;
