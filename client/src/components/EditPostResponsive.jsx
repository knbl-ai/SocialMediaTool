import { useState, useEffect, useRef, useCallback } from "react";
import { ImagePlus, X } from "lucide-react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { SelectTemplate } from "./editPost/SelectTemplate";
import { PostDateSelector } from "./editPost/PostDateSelector";
import { PostTimeSelector } from "./editPost/PostTimeSelector";
import PostPlatformSelector from "./editPost/PostPlatformSelector";
import PostSelectItems from "./editPost/PostSelectItems";
import DimensionsSelector from "./editPost/DimensionsSelector";
import { usePosts } from '../hooks/usePosts';
import MODELS from '../config/models';
import PulsatingButton from "@/components/ui/pulsating-button";

const DEFAULT_STATE = {
  postId: null,
  postText: '',
  postTitle: '',
  postSubtitle: '',
  selectedTime: "10:00",
  imagePrompt: '',
  videoPrompt: '',
  textPrompt: '',
  imageSize: { width: 0, height: 0 },
  imageTemplate: '',
  selectedImageModel: MODELS.image[0]?.value,
  selectedVideoModel: MODELS.video[0]?.value,
  selectedLLMModel: MODELS.llm[0]?.value
};

const EditPostResponsive = ({ show, onClose, date, accountId, initialPlatform, postId: initialPostId, initialPost, onUpdate }) => {
  // Basic post states
  const [selectedTime, setSelectedTime] = useState(DEFAULT_STATE.selectedTime)
  const [selectedDate, setSelectedDate] = useState(date)
  const [currentPost, setCurrentPost] = useState(initialPost || null);
  const [postId, setPostId] = useState(initialPost?._id || initialPostId);
  const { updatePost, deletePost, error: postsError, clearError } = usePosts(accountId);
  const [localError, setLocalError] = useState(null);
  const error = localError || postsError;
  const initializationRef = useRef(false);
  const isDeletingRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Content states
  const [postText, setPostText] = useState(DEFAULT_STATE.postText);
  const [postTitle, setPostTitle] = useState(DEFAULT_STATE.postTitle);
  const [postSubtitle, setPostSubtitle] = useState(DEFAULT_STATE.postSubtitle);
  const [imageSize, setImageSize] = useState(DEFAULT_STATE.imageSize);
  const [imageTemplate, setImageTemplate] = useState(DEFAULT_STATE.imageTemplate);
  const [dimensions, setDimensions] = useState(initialPost?.image?.dimensions || 'square');

  // Platform and model states
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    return initialPlatform ? [initialPlatform] : [];
  });

  const [selectedImageModel, setSelectedImageModel] = useState(DEFAULT_STATE.selectedImageModel)
  const [selectedVideoModel, setSelectedVideoModel] = useState(DEFAULT_STATE.selectedVideoModel)
  const [selectedLLMModel, setSelectedLLMModel] = useState(DEFAULT_STATE.selectedLLMModel)

  // Prompt states
  const [imagePrompt, setImagePrompt] = useState(DEFAULT_STATE.imagePrompt);
  const [videoPrompt, setVideoPrompt] = useState(DEFAULT_STATE.videoPrompt);
  const [textPrompt, setTextPrompt] = useState(DEFAULT_STATE.textPrompt);

  const handleDimensionsChange = (dimensionValue, dimensionSize) => {
    setDimensions(dimensionValue);
    setImageSize(dimensionSize);
  };

  const handleClose = useCallback(async () => {
    if (onUpdate) {
      await onUpdate();
    }
    clearError();
    onClose();
  }, [onClose, onUpdate, clearError]);

  // Reset states when modal closes
  useEffect(() => {
    if (!show) {
      Object.entries(DEFAULT_STATE).forEach(([key, value]) => {
        const setter = eval(`set${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (setter) setter(value);
      });
      initializationRef.current = false;
      isDeletingRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setLocalError(null);
      clearError();
    }
  }, [show, clearError]);

  // Initialize state from initialPost if available
  useEffect(() => {
    if (initialPost) {
      setSelectedPlatforms(initialPost.platforms || []);
      setSelectedTime(initialPost.timePost || DEFAULT_STATE.selectedTime);
      setPostText(initialPost.text?.post || '');
      setPostTitle(initialPost.text?.title || '');
      setPostSubtitle(initialPost.text?.subtitle || '');
      setImagePrompt(initialPost.prompts?.image || '');
      setVideoPrompt(initialPost.prompts?.video || '');
      setTextPrompt(initialPost.prompts?.text || '');
      setSelectedImageModel(initialPost.models?.image || DEFAULT_STATE.selectedImageModel);
      setSelectedVideoModel(initialPost.models?.video || DEFAULT_STATE.selectedVideoModel);
      setSelectedLLMModel(initialPost.models?.text || DEFAULT_STATE.selectedLLMModel);
      setImageSize(initialPost.image?.size || DEFAULT_STATE.imageSize);
      setImageTemplate(initialPost.image?.template || '');
      setDimensions(initialPost.image?.dimensions || 'square');
      setCurrentPost(initialPost);
      initializationRef.current = true;
    }
  }, [initialPost]);

  // Save changes when form values change
  useEffect(() => {
    if (!postId || !show || isDeletingRef.current) return; // Don't run if modal is closed, post is deleted, or deletion is in progress

    const saveChanges = async () => {
      try {
        const postData = {
          platforms: selectedPlatforms,
          datePost: selectedDate,
          timePost: selectedTime,
          image: {
            ...(currentPost?.image || {}),
            size: imageSize,
            template: imageTemplate,
            dimensions: dimensions
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
        };

        const updatedPost = await updatePost(postId, postData);
        setCurrentPost(updatedPost);
        setLocalError(null);
      } catch (error) {
        console.error('Error saving changes:', error);
        setLocalError(error.message || 'Failed to save changes');
      }
    };

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(saveChanges, 1000);
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    postId, selectedPlatforms, selectedDate, selectedTime,
    imageSize, imageTemplate, dimensions, postText, postTitle, postSubtitle,
    imagePrompt, videoPrompt, textPrompt,
    selectedImageModel, selectedVideoModel, selectedLLMModel,
    currentPost, updatePost, show
  ]);

  return (
    <Modal show={show} onClose={handleClose}>
      <div className="flex flex-col h-[90vh] w-full">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 mb-4 rounded-md">
            {error}
          </div>
        )}
        
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
            <div className="flex-[4] bg-gray-100 rounded-lg min-h-0 flex items-center justify-center overflow-hidden">
              {currentPost?.image?.url ? (
                <img
                  src={currentPost.image.url}
                  alt="Post preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <ImagePlus className="h-12 w-12 text-gray-400" />
              )}
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
          <div className="col-span-3 flex flex-col ">
            {/* Top Box - Close Button */}
            <div className="h-16 rounded-lg flex justify-end items-center pr-2">
              <DimensionsSelector value={dimensions} onChange={handleDimensionsChange}/>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={async () => {
                  if (postId) {
                    try {
                      isDeletingRef.current = true;
                      if (saveTimeoutRef.current) {
                        clearTimeout(saveTimeoutRef.current);
                      }
                      await deletePost(postId);
                      setPostId(null);
                      setCurrentPost(null);
                      if (onUpdate) await onUpdate();
                      handleClose();
                    } catch (error) {
                      setLocalError(error.message || 'Failed to delete post');
                      isDeletingRef.current = false;
                    }
                  }
                }} 
                className="text-red-400 hover:text-red-500 ml-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Bottom Box - Generation Controls */}
            <div className="flex-1 rounded-lg">
              <div className="h-full flex flex-col justify-between">
                {/* Image Generation */}
                <PostSelectItems 
                  type="image"
                  selectedModel={selectedImageModel}
                  onModelChange={setSelectedImageModel}
                  models={MODELS.image}
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
                  models={MODELS.video}
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
                  models={MODELS.llm}
                  placeholder="Write your prompt for AI text generation..."
                  buttonText="Generate Text"
                  value={textPrompt}
                  onChange={setTextPrompt}
                />
                 <PulsatingButton 
                   onClick={handleClose}
                   className="w-full mt-5 text-white bg-[#5CB338]" 
                   pulseColor="#ECE852"
                 >
                   Save Changes
                 </PulsatingButton>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditPostResponsive;
