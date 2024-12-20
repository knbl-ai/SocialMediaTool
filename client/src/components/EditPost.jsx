import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, X } from "lucide-react"
import { SelectTemplate } from "./EditPost/SelectTemplate"
import { PostDateSelector } from "./EditPost/PostDateSelector"
import { PostTimeSelector } from "./EditPost/PostTimeSelector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import PlatformSelector  from "./PlatformSelector"

export function EditPost({ show, onClose, date, accountId }) {
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedDate, setSelectedDate] = useState(date)

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex items-center justify-between mb-6 ">
        <div className="flex items-center gap-4 w-[45vw] ml-48">
          <PostDateSelector date={selectedDate} onChange={setSelectedDate} />
          <div className="flex-1">
            <PlatformSelector/>
          </div>
          <PostTimeSelector time={selectedTime} onChange={setSelectedTime} />
         
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Left - Templates */}
          <div className="w-[25vw] h-full">
            <SelectTemplate accountId={accountId} />
          </div>

          {/* Middle - Image and Post Text */}
          <div className="flex flex-col gap-4">
            <div className="w-[45vw] h-[35vw] bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ImagePlus className="h-12 w-12 text-gray-400" />
            </div>
            <Textarea 
              placeholder="Enter your post text..."
              className="min-h-[100px] w-full"
            />
          </div>

          {/* Right - Generation Controls */}
          <div className="w-[35vw] space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Image Model</span>
                <Select defaultValue="dalle3">
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dalle3">DALL-E 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea 
                placeholder="Describe the image you want to generate..."
                className="min-h-[100px]"
              />
              <Button className="w-full mt-2">
                <ImagePlus className="w-4 h-4 mr-2" />
                Generate Image
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Video Model</span>
                <Select defaultValue="runway">
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="runway">Runway Gen-2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea 
                placeholder="Describe the video you want to generate..."
                className="min-h-[100px]"
              />
              <Button className="w-full mt-2">
                <ImagePlus className="w-4 h-4 mr-2" />
                Generate Video
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">LLM</span>
                <Select defaultValue="gpt4">
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4">GPT-4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea 
                placeholder="Write your prompt for AI text generation..."
                className="min-h-[100px]"
              />
              <Button className="w-full mt-2">
                <ImagePlus className="w-4 h-4 mr-2" />
                Generate Text
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default EditPost;
