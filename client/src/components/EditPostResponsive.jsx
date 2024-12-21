import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, X } from "lucide-react"
import { SelectTemplate } from "./EditPost/SelectTemplate"
import { PostDateSelector } from "./EditPost/PostDateSelector"
import { PostTimeSelector } from "./EditPost/PostTimeSelector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import PlatformSelector from "./PlatformSelector"

const EditPostResponsive = ({ show, onClose, date, accountId }) => {
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedDate, setSelectedDate] = useState(date)

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex flex-col h-[90vh] w-full">
        {/* Main Content */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
          {/* Left Column - Templates */}
          <div className="col-span-2 h-full">
            {/* Templates section taking full height */}
            <div className=" rounded-lg overflow-hidden h-full">
              <SelectTemplate accountId={accountId} />
            </div>
          </div>

          {/* Middle Column */}
          <div className="col-span-7 flex flex-col gap-4">
            {/* Top Section - Date, Platform, Time in equal blocks */}
            <div className="h-16  rounded-lg">
              <div className="grid grid-cols-3 h-full">
                <div className="flex items-center justify-center ps-2 pe-2">
                  <PostDateSelector date={selectedDate} onChange={setSelectedDate} />
                </div>
                <div className="flex items-center justify-center">
                  <PlatformSelector/>
                </div>
                <div className="flex items-center justify-center ps-2 pe-2">
                  <PostTimeSelector time={selectedTime} onChange={setSelectedTime} />
                </div>
              </div>
            </div>

            {/* Middle Section - Image Preview */}
            <div className="flex-[4] bg-gray-100  rounded-lg min-h-0 flex items-center justify-center">
              <ImagePlus className="h-12 w-12 text-gray-400" />
            </div>

            {/* Bottom Section - Post Text */}
            <div className="h-32 w-full">
              <Textarea 
                placeholder="Write your post..."
                className="h-full resize-none"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* Top Box - Close Button */}
            <div className="h-16  rounded-lg flex justify-end items-center pr-2">
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Bottom Box - Generation Controls */}
            <div className="flex-1  rounded-lg p-4">
              <div className="h-full flex flex-col justify-between">
                {/* Image Generation */}
                <div>
                  <div className="flex items-center justify-between">
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
                    className="min-h-[80px] mt-2 resize-none"
                  />
                  <Button className="w-full mt-2">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Generate Image
                  </Button>
                </div>

                {/* Video Generation */}
                <div>
                  <div className="flex items-center justify-between">
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
                    className="min-h-[80px] mt-2 resize-none"
                  />
                  <Button className="w-full mt-2">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Generate Video
                  </Button>
                </div>

                {/* Text Generation */}
                <div>
                  <div className="flex items-center justify-between">
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
                    className="min-h-[80px] mt-2 resize-none"
                  />
                  <Button className="w-full mt-2">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Generate Text
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default EditPostResponsive
