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
import api from '../lib/api';
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
  imageSize: { width: 1280, height: 1280 },
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
  const isSelectingTemplateRef = useRef(false);

  // Content states
  const [postText, setPostText] = useState(DEFAULT_STATE.postText);
  const [postTitle, setPostTitle] = useState(DEFAULT_STATE.postTitle);
  const [postSubtitle, setPostSubtitle] = useState(DEFAULT_STATE.postSubtitle);
  const [imageSize, setImageSize] = useState(DEFAULT_STATE.imageSize);
  const [imageTemplate, setImageTemplate] = useState(DEFAULT_STATE.imageTemplate);
  const [dimensions, setDimensions] = useState(initialPost?.image?.dimensions || 'Square');

  // Platform and model states
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    return initialPlatform ? [initialPlatform] : [];
  });

  const [selectedImageModel, setSelectedImageModel] = useState(DEFAULT_STATE.selectedImageModel)
  const [selectedVideoModel, setSelectedVideoModel] = useState(DEFAULT_STATE.selectedVideoModel)
  const [selectedLLMModel, setSelectedLLMModel] = useState(() => {
    console.log('Initial LLM Models:', MODELS.llm);
    console.log('Default LLM Model:', DEFAULT_STATE.selectedLLMModel);
    return DEFAULT_STATE.selectedLLMModel;
  })

  // Prompt states
  const [imagePrompt, setImagePrompt] = useState(DEFAULT_STATE.imagePrompt);
  const [videoPrompt, setVideoPrompt] = useState(DEFAULT_STATE.videoPrompt);
  const [textPrompt, setTextPrompt] = useState(DEFAULT_STATE.textPrompt);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);

  const handleDimensionsChange = (dimensionName, dimensionSize) => {
    setDimensions(dimensionName);
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
      const modelToSet = initialPost.models?.text || DEFAULT_STATE.selectedLLMModel;
      console.log('Setting LLM Model:', modelToSet);
      setSelectedLLMModel(modelToSet);
      setImageSize(initialPost.image?.size || DEFAULT_STATE.imageSize);
      setImageTemplate(initialPost.image?.template || '');
      setDimensions(initialPost.image?.dimensions || 'Square');
      setCurrentPost(initialPost);
      initializationRef.current = true;
    }
  }, [initialPost]);

  // Save changes when form values change
  useEffect(() => {
    if (!postId || !show || isDeletingRef.current || isSelectingTemplateRef.current) return; // Don't run if modal is closed, post is deleted, template selection in progress, or deletion is in progress

    const saveChanges = async () => {
      try {
        console.log('Auto-save running with:', {
          template: currentPost?.image?.template,
          url: currentPost?.image?.url
        });
        
        const postData = {
          platforms: selectedPlatforms,
          datePost: selectedDate,
          timePost: selectedTime,
          image: currentPost?.image || {}, // Keep image properties unchanged during auto-save
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

        console.log('Saving post data:', postData);
        const updatedPost = await updatePost(postId, postData);
        console.log('Post updated:', {
          template: updatedPost.image?.template,
          url: updatedPost.image?.url
        });
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
    imageSize, dimensions, postText, postTitle, postSubtitle, // Removed imageTemplate from dependencies
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
                templatesUrls={currentPost?.templatesUrls || []}
                title={postTitle}
                subtitle={postSubtitle}
                onTitleChange={setPostTitle}
                onSubtitleChange={setPostSubtitle}
                currentTemplate={currentPost?.image?.template}
                onTemplateSelect={async (templateUrl) => {
                  // Prevent auto-save during template selection
                  isSelectingTemplateRef.current = true;

                  console.log('Selecting template:', {
                    currentTemplate: currentPost?.image?.template,
                    newTemplate: templateUrl,
                    currentUrl: currentPost?.image?.url
                  });

                  // Prepare updated post data
                  const updatedPostData = {
                    ...currentPost,
                    platforms: selectedPlatforms,
                    datePost: selectedDate,
                    timePost: selectedTime,
                    image: {
                      ...(currentPost?.image || {}),
                      url: currentPost?.image?.url,
                      template: templateUrl === currentPost?.image?.url ? null : templateUrl,
                      size: imageSize,
                      dimensions: dimensions,
                      templatesUrls: currentPost?.templatesUrls || []
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
                  setCurrentPost(updatedPostData);

                  try {
                    // Save to server immediately
                    const savedPost = await updatePost(postId, updatedPostData);
                    console.log('Template updated:', {
                      template: savedPost.image?.template,
                      url: savedPost.image?.url,
                      templatesUrls: savedPost.templatesUrls
                    });

                    // Update local state with saved data
                    setCurrentPost(savedPost);

                    // Update imageTemplate state to match
                    setImageTemplate(savedPost.image?.template || '');
                  } catch (error) {
                    console.error('Error updating template:', error);
                    setLocalError('Failed to update template');
                    // Revert on error
                    setCurrentPost(currentPost);
                    setImageTemplate(currentPost?.image?.template || '');
                  } finally {
                    // Re-enable auto-save after template selection
                    isSelectingTemplateRef.current = false;
                  }
                }}
                originalImageUrl={currentPost?.image?.url}
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
            <div className="flex-[4] bg-gray-100 rounded-lg min-h-0 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                {currentPost?.image?.template || currentPost?.image?.url ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={currentPost.image.template || currentPost.image.url}
                      alt="Post preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <ImagePlus className="h-12 w-12 text-gray-400" />
                )}
              </div>
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
                  isLoading={isGeneratingImage}
                  onGenerate={async () => {
                    if (!imagePrompt || !selectedImageModel || !imageSize.width || !imageSize.height) {
                      setLocalError('Please provide all required fields for image generation');
                      return;
                    }
                    try {
                      setIsGeneratingImage(true);
                      const result = await api.generateImage({
                        prompt: imagePrompt,
                        model: selectedImageModel,
                        width: imageSize.width,
                        height: imageSize.height
                      });
                      
                      // Delete old templates if they exist
                      if (currentPost?.templatesUrls?.length > 0) {
                        await api.deleteFiles(currentPost.templatesUrls);
                      }

                      // Update post with new image URL
                      let updatedPost = await updatePost(postId, {
                        ...currentPost,
                        image: {
                          ...currentPost?.image,
                          url: result.url,
                          template: result.url,
                          size: imageSize,
                          dimensions: dimensions
                        },
                        templatesUrls: [] // Clear existing templates
                      });

                      // Set current post to show new image immediately
                      setCurrentPost(updatedPost);

                      // Only generate templates if we have all required fields
                      if (updatedPost.image?.url && updatedPost.text?.title && updatedPost.text?.subtitle) {
                        try {
                          const templatesResult = await api.generateTemplates(postId);
                          // Update UI with the post containing both new image and templates
                          setCurrentPost(templatesResult);
                        } catch (error) {
                          console.error('Error generating templates:', error);
                          setLocalError('Image saved but template generation failed');
                        }
                      } else {
                        console.log('Skipping template generation - missing required fields');
                      }
                      setLocalError(null);
                    } catch (error) {
                      console.error('Error generating image:', error);
                      setLocalError(error.message || 'Failed to generate image');
                    } finally {
                      setIsGeneratingImage(false);
                    }
                  }}
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
                  isLoading={isGeneratingText}
                  onGenerate={async () => {
                    if (!textPrompt || !selectedLLMModel) {
                      setLocalError('Please provide all required fields for text generation');
                      return;
                    }
                    try {
                      setIsGeneratingText(true);
                      // Generate text with the prompt
                      const result = await api.generateText({
                        prompt: textPrompt,
                        model: selectedLLMModel
                      });

                      // Ensure we have valid data
                      if (!result.post && !result.title && !result.subtitle) {
                        throw new Error('Invalid response from text generation service');
                      }
                      
                      // Update all text fields with the generated content
                      let updatedPost = await updatePost(postId, {
                        ...currentPost,
                        text: {
                          ...currentPost?.text,
                          post: result.post || '',
                          title: result.title || '',
                          subtitle: result.subtitle || ''
                        },
                        prompts: {
                          ...currentPost?.prompts,
                          text: textPrompt
                        }
                      });

                      // Only generate templates if we have all required fields
                      if (updatedPost.image?.url && updatedPost.text?.title && updatedPost.text?.subtitle) {
                        try {
                          const templatesResult = await api.generateTemplates(postId);
                          // Update UI with text content and templates
                          setCurrentPost(templatesResult);
                          setPostText(result.post);
                          setPostTitle(result.title);
                          setPostSubtitle(result.subtitle);
                        } catch (error) {
                          console.error('Error generating templates:', error);
                          setLocalError('Text saved but template generation failed');
                        }
                      } else {
                        console.log('Skipping template generation - missing required fields');
                        // Still update the UI with text content
                        setPostText(result.post);
                        setPostTitle(result.title);
                        setPostSubtitle(result.subtitle);
                      }
                      setLocalError(null);
                    } catch (error) {
                      console.error('Error generating text:', error);
                      setLocalError(error.message || 'Failed to generate text');
                    } finally {
                      setIsGeneratingText(false);
                    }
                  }}
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
