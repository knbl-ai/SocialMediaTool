import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, X } from "lucide-react"
import { SelectTemplate } from "./EditPost/SelectTemplate"
import { PostDateSelector } from "./EditPost/PostDateSelector"
import { PostTimeSelector } from "./EditPost/PostTimeSelector"
import { useState, useEffect, useRef } from "react"
import PostPlatformSelector from "./editPost/PostPlatformSelector"
import PostSelectItems from "./editPost/PostSelectItems"
import { models } from "@/config/models"
import DimensionsSelector from "./editPost/DimensionsSelector"
import { createPost, updatePost, searchPosts, findOrCreatePost } from '@/services/posts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditPostResponsive = ({ show, onClose, date, accountId, initialPlatform }) => {
  console.log('EditPostResponsive render:', { show, date, accountId, initialPlatform });
  
  // Basic post states
  const [selectedTime, setSelectedTime] = useState("10") // Default to 10:00
  const [selectedDate, setSelectedDate] = useState(date)
  const [postId, setPostId] = useState(null);
  const initializationRef = useRef(false);

  // Content states
  const [postText, setPostText] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postSubtitle, setPostSubtitle] = useState('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageTemplate, setImageTemplate] = useState('');

  // Platform and model states
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    return initialPlatform ? [initialPlatform] : [];
  });

  const [selectedImageModel, setSelectedImageModel] = useState(models.image[0]?.value)
  const [selectedVideoModel, setSelectedVideoModel] = useState(models.video[0]?.value)
  const [selectedLLMModel, setSelectedLLMModel] = useState(models.llm[0]?.value)

  // Prompt states
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [textPrompt, setTextPrompt] = useState('');

  // Reset states when modal closes
  useEffect(() => {
    if (!show) {
      console.log('Resetting modal state');
      setPostId(null);
      setPostText('');
      setPostTitle('');
      setPostSubtitle('');
      setSelectedTime("10");
      setImagePrompt('');
      setVideoPrompt('');
      setTextPrompt('');
      setSelectedImageModel(models.image[0]?.value);
      setSelectedVideoModel(models.video[0]?.value);
      setSelectedLLMModel(models.llm[0]?.value);
      setImageSize({ width: 0, height: 0 });
      setImageTemplate('');
      initializationRef.current = false;
    }
  }, [show]);

  // Initialize or find existing post
  useEffect(() => {
    console.log('Initialization effect running:', { show, accountId, date, isInitialized: initializationRef.current });
    
    let isActive = true;

    const initializePost = async () => {
      if (!show || !accountId || !date || initializationRef.current) {
        console.log('Skipping initialization:', { show, accountId, date, isInitialized: initializationRef.current });
        return;
      }

      try {
        console.log('Finding or creating post:', { date, initialPlatform, accountId });
        
        const post = await findOrCreatePost({
          accountId,
          date,
          platform: initialPlatform
        });

        // If component is unmounted or modal closed, don't update state
        if (!isActive || !show) {
          console.log('Component no longer active or modal closed, skipping state updates');
          return;
        }

        console.log('Initializing with post:', post);
        setPostId(post._id);
        setSelectedPlatforms(post.platforms);
        setSelectedTime(post.timePost);
        setPostText(post.text?.post || '');
        setPostTitle(post.text?.title || '');
        setPostSubtitle(post.text?.subtitle || '');
        setImagePrompt(post.prompts?.image || '');
        setVideoPrompt(post.prompts?.video || '');
        setTextPrompt(post.prompts?.text || '');
        setSelectedImageModel(post.models?.image || models.image[0]?.value);
        setSelectedVideoModel(post.models?.video || models.video[0]?.value);
        setSelectedLLMModel(post.models?.text || models.llm[0]?.value);
        setImageSize(post.image?.size || { width: 0, height: 0 });
        setImageTemplate(post.image?.template || '');

        initializationRef.current = true;
      } catch (error) {
        console.error('Error during post initialization:', error);
      }
    };

    initializePost();
    return () => {
      isActive = false;
    };
  }, [show, accountId, date, initialPlatform]);

  // Save changes when form values change
  useEffect(() => {
    if (!postId) return;

    const saveChanges = async () => {
      try {
        console.log('Saving post changes:', {
          platforms: selectedPlatforms,
          datePost: selectedDate,
          timePost: selectedTime,
          text: {
            post: postText,
            title: postTitle,
            subtitle: postSubtitle
          },
          prompts: {
            image: imagePrompt,
            video: videoPrompt,
            text: textPrompt
          }
        });
        
        await updatePost(postId, {
          platforms: selectedPlatforms,
          datePost: selectedDate,
          timePost: selectedTime,
          image: {
            url: '',
            size: imageSize,
            template: imageTemplate
          },
          text: {
            post: postText,
            title: postTitle,
            subtitle: postSubtitle
          },
          prompts: {
            image: imagePrompt,
            video: videoPrompt,
            text: textPrompt
          },
          models: {
            image: selectedImageModel,
            video: selectedVideoModel,
            text: selectedLLMModel
          }
        });
      } catch (error) {
        console.error('Error saving changes:', error);
      }
    };

    const timeoutId = setTimeout(saveChanges, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    postId, selectedPlatforms, selectedDate, selectedTime,
    imageSize, imageTemplate, postText, postTitle, postSubtitle,
    imagePrompt, videoPrompt, textPrompt,
    selectedImageModel, selectedVideoModel, selectedLLMModel
  ]);

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex flex-col h-[90vh] w-full">
        {/* Main Content */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
          {/* Left Column - Templates */}
          <div className="col-span-2 h-full">
            <div className="rounded-lg overflow-hidden h-full">
              <SelectTemplate 
                accountId={accountId}
                title={postTitle}
                subtitle={postSubtitle}
                onTitleChange={setPostTitle}
                onSubtitleChange={setPostSubtitle}
              />
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
                    onPlatformsChange={setSelectedPlatforms}
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
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* Top Box - Close Button */}
            <div className="h-16 rounded-lg flex justify-end items-center pr-2">
              <DimensionsSelector value="square_hd" onChange={() => {}} />
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
                  value={imagePrompt}
                  onChange={setImagePrompt}
                />

                {/* Video Generation */}
                <PostSelectItems 
                  type="video"
                  selectedModel={selectedVideoModel}
                  onModelChange={setSelectedVideoModel}
                  models={models.video}
                  placeholder="Describe the video you want to generate..."
                  buttonText="Generate Video"
                  value={videoPrompt}
                  onChange={setVideoPrompt}
                />

                {/* Text Generation */}
                <PostSelectItems 
                  type="text"
                  selectedModel={selectedLLMModel}
                  onModelChange={setSelectedLLMModel}
                  models={models.llm}
                  placeholder="Write your prompt for AI text generation..."
                  buttonText="Generate Text"
                  value={textPrompt}
                  onChange={setTextPrompt}
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
