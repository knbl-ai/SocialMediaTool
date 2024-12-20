import React, { useEffect } from 'react';
import { 
  ImagePlus, 
  Wand2,
  PlayCircle, 
  MessageSquarePlus,
  X 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectTemplate from './EditPost/SelectTemplate';

const EditPost = ({ show, onClose, date, accountId }) => {
  useEffect(() => {
    console.log('EditPost received accountId:', accountId);
  }, [accountId]);

  if (!accountId) {
    console.warn('EditPost: No accountId provided');
  }

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Date: {date?.toLocaleDateString()}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Content Section */}
        <div className="flex gap-6">
          {/* Left - Templates */}
          <div className="w-[25vw]">
            <SelectTemplate accountId={accountId} />
          </div>

          {/* Middle - Image and Post Text */}
          <div className="flex flex-col gap-4">
            <div className="w-[35vw] h-[35vw] bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ImagePlus className="h-12 w-12 text-gray-400" />
            </div>
            <Textarea 
              placeholder="Enter your post text..."
              className="min-h-[100px] w-full"
            />
          </div>

          {/* Right - Generation Controls */}
          <div className="flex-1">
            {/* Image Generation Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Image Generation</h3>
                <Select defaultValue="dall-e-3">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                    <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                    <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea 
                placeholder="Describe the image you want to generate..."
                className="min-h-[80px] mb-2"
              />
              <Button className="w-full">
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Image
              </Button>
            </div>

            {/* Video Generation Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Video Generation</h3>
                <Select defaultValue="runway">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="runway">Runway Gen-2</SelectItem>
                    <SelectItem value="pika">Pika Labs</SelectItem>
                    <SelectItem value="stable">Stable Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea 
                placeholder="Describe the video you want to generate..."
                className="min-h-[80px] mb-2"
              />
              <Button className="w-full">
                <PlayCircle className="w-4 h-4 mr-2" />
                Generate Video
              </Button>
            </div>

            {/* Text Generation Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Text Generation</h3>
                <Select defaultValue="gpt-4">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                    <SelectItem value="claude">Claude 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea 
                placeholder="Write your prompt for AI text generation..."
                className="min-h-[80px] mb-2"
              />
              <Button className="w-full">
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Generate Text
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditPost;
