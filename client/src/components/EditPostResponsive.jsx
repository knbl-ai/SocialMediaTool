import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, X } from "lucide-react"
import { SelectTemplate } from "./EditPost/SelectTemplate"
import { PostDateSelector } from "./EditPost/PostDateSelector"
import { PostTimeSelector } from "./EditPost/PostTimeSelector"
import { useState, useEffect } from "react"
import PostPlatformSelector from "./EditPost/PostPlatformSelector"
import PostSelectItems from "./EditPost/PostSelectItems"
import { models } from "@/config/models"

const EditPostResponsive = ({ show, onClose, date, accountId, initialPlatform }) => {
  const [selectedTime, setSelectedTime] = useState("10") // Default to 10:00
  const [selectedDate, setSelectedDate] = useState(() => {
    return date instanceof Date && !isNaN(date) ? date : new Date()
  })

  // Initialize platforms with initialPlatform if provided
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    return initialPlatform ? [initialPlatform] : [];
  });

  const [selectedImageModel, setSelectedImageModel] = useState(models.image[0]?.value)
  const [selectedVideoModel, setSelectedVideoModel] = useState(models.video[0]?.value)
  const [selectedLLMModel, setSelectedLLMModel] = useState(models.llm[0]?.value)

  // Update platforms when initialPlatform changes
  useEffect(() => {
    if (initialPlatform && !selectedPlatforms.includes(initialPlatform)) {
      setSelectedPlatforms([initialPlatform]);
    }
  }, [initialPlatform]);

  // Update date when prop changes
  useEffect(() => {
    if (date instanceof Date && !isNaN(date)) {
      setSelectedDate(date)
    }
  }, [date])

  const handlePlatformsChange = (platforms) => {
    setSelectedPlatforms(platforms);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex flex-col h-[90vh] w-full">
        {/* Main Content */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
          {/* Left Column - Templates */}
          <div className="col-span-2 h-full">
            <div className="rounded-lg overflow-hidden h-full">
              <SelectTemplate accountId={accountId} />
            </div>
          </div>

          {/* Middle Column */}
          <div className="col-span-7 flex flex-col gap-4">
            {/* Top Section - Date, Platform, Time in equal blocks */}
            <div className="h-16 rounded-lg">
              <div className="grid grid-cols-3 h-full">
                <div className="flex items-center justify-center ps-2 pe-2 me-7">
                  <PostDateSelector date={selectedDate} onChange={setSelectedDate} />
                </div>
                <div className="flex items-center justify-center">
                  <PostPlatformSelector
                    selectedPlatforms={selectedPlatforms}
                    onPlatformsChange={handlePlatformsChange}
                  />
                </div>
                <div className="flex items-center justify-center ps-2 pe-2 ms-3">
                  <PostTimeSelector time={selectedTime} onChange={setSelectedTime} />
                </div>
              </div>
            </div>

            {/* Middle Section - Image Preview */}
            <div className="flex-[4] bg-gray-100 rounded-lg min-h-0 flex items-center justify-center">
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
            <div className="h-16 rounded-lg flex justify-end items-center pr-2">
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Bottom Box - Generation Controls */}
            <div className="flex-1 rounded-lg p-4">
              <div className="h-full flex flex-col justify-between">
                {/* Image Generation */}
                <PostSelectItems 
                  type="image"
                  selectedModel={selectedImageModel}
                  onModelChange={setSelectedImageModel}
                  models={models.image}
                  placeholder="Describe the image you want to generate..."
                  buttonText="Generate Image"
                />

                {/* Video Generation */}
                <PostSelectItems 
                  type="video"
                  selectedModel={selectedVideoModel}
                  onModelChange={setSelectedVideoModel}
                  models={models.video}
                  placeholder="Describe the video you want to generate..."
                  buttonText="Generate Video"
                />

                {/* Text Generation */}
                <PostSelectItems 
                  type="text"
                  selectedModel={selectedLLMModel}
                  onModelChange={setSelectedLLMModel}
                  models={models.llm}
                  placeholder="Write your prompt for AI text generation..."
                  buttonText="Generate Text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default EditPostResponsive
