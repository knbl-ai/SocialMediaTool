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
import DisplayImage from "./editPost/DisplayImage";
import { usePosts } from '../hooks/usePosts';
import api from '../lib/api';
import MODELS from '../config/models';
import PulsatingButton from "@/components/ui/pulsating-button";
import PostNow from "./editPost/PostNow";
// import { toast } from "react-hot-toast";


const DEFAULT_STATE = {
  postId: null,
  postText: '',
  postTitle: '',
  postSubtitle: '',
  selectedTime: "10",
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
 
  const [selectedTime, setSelectedTime] = useState(DEFAULT_STATE.selectedTime);
  const [selectedDate, setSelectedDate] = useState(date);
  const [currentPost, setCurrentPost] = useState(initialPost || null);
  const [postId, setPostId] = useState(initialPost?._id || initialPostId);
  const { updatePost, deletePost, error: postsError, clearError } = usePosts(accountId);
  const [localError, setLocalError] = useState(null);
  const error = localError || postsError;
  const initializationRef = useRef(false);
  const isDeletingRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const isSelectingTemplateRef = useRef(false);
  const templateSelectionTimeoutRef = useRef(null);
  const currentPostRef = useRef(currentPost);


  // Update ref when currentPost changes
  useEffect(() => {
    currentPostRef.current = currentPost;
  }, [currentPost]);

  // Helper function for array comparison
  const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  // Content states
  const [postText, setPostText] = useState(DEFAULT_STATE.postText);
  const [postTitle, setPostTitle] = useState(DEFAULT_STATE.postTitle);
  const [postSubtitle, setPostSubtitle] = useState(DEFAULT_STATE.postSubtitle);
  const [imageSize, setImageSize] = useState(DEFAULT_STATE.imageSize);
  const [imageTemplate, setImageTemplate] = useState(DEFAULT_STATE.imageTemplate);
  const [dimensions, setDimensions] = useState(initialPost?.image?.dimensions || 'Square');

  // Prompt states
  const [imagePrompt, setImagePrompt] = useState(DEFAULT_STATE.imagePrompt);
  const [videoPrompt, setVideoPrompt] = useState(DEFAULT_STATE.videoPrompt);
  const [textPrompt, setTextPrompt] = useState(DEFAULT_STATE.textPrompt);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingTemplates, setIsGeneratingTemplates] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Platform and model states
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => 
    initialPlatform ? [initialPlatform] : []
  );

  const [selectedImageModel, setSelectedImageModel] = useState(DEFAULT_STATE.selectedImageModel);
  const [selectedVideoModel, setSelectedVideoModel] = useState(DEFAULT_STATE.selectedVideoModel);
  const [selectedLLMModel, setSelectedLLMModel] = useState(DEFAULT_STATE.selectedLLMModel);

  // Initialize state from initialPost only once
  useEffect(() => {
    if (initialPost && !initializationRef.current) {
      initializationRef.current = true;
      
      setSelectedPlatforms(initialPost.platforms || []);
      // Handle time initialization more carefully
      const rawTime = initialPost.timePost || DEFAULT_STATE.selectedTime;
      // Only format if it's not already in correct format
      const formattedTime = rawTime.includes(':') ? 
        rawTime.split(':')[0].padStart(2, '0') : 
        (rawTime.length === 2 ? rawTime : rawTime.padStart(2, '0'));
      setSelectedTime(formattedTime);
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
      setDimensions(initialPost.image?.dimensions || 'Square');
    }
  }, []); // Empty dependency array as we only want this to run once

  // Debounced save effect
  useEffect(() => {
    if (!postId || !show || isDeletingRef.current || isSelectingTemplateRef.current || !initializationRef.current) return;
    
    const hasChanges = () => {
      const current = currentPostRef.current;
      if (!current) return false;
      
      return (
        !arraysEqual(current.platforms, selectedPlatforms) ||
        current.datePost !== selectedDate ||
        current.timePost !== selectedTime ||
        current.text?.post !== postText ||
        current.text?.title !== postTitle ||
        current.text?.subtitle !== postSubtitle ||
        current.prompts?.image !== imagePrompt ||
        current.prompts?.video !== videoPrompt ||
        current.prompts?.text !== textPrompt ||
        current.models?.image !== selectedImageModel ||
        current.models?.video !== selectedVideoModel ||
        current.models?.text !== selectedLLMModel
      );
    };

    if (!hasChanges()) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Create a new date at UTC midnight
        const utcDate = new Date(Date.UTC(
          new Date(selectedDate).getFullYear(),
          new Date(selectedDate).getMonth(),
          new Date(selectedDate).getDate(),
          0, 0, 0, 0
        ));

        const postData = {
          platforms: selectedPlatforms,
          datePost: utcDate.toISOString().split('T')[0], // Only use the date portion
          timePost: selectedTime,
          image: currentPostRef.current?.image || {},
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
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    postId,
    show,
    selectedPlatforms,
    selectedDate,
    selectedTime,
    postText,
    postTitle,
    postSubtitle,
    imagePrompt,
    videoPrompt,
    textPrompt,
    selectedImageModel,
    selectedVideoModel,
    selectedLLMModel,
    updatePost
  ]);

  const handleDimensionsChange = async (newDimensions) => {
    setDimensions(newDimensions);
    
    // Set image size based on dimensions
    let newSize;
    switch (newDimensions) {
      case 'Square':
        newSize = { width: 1280, height: 1280 };
        break;
      case 'Portrait':
        newSize = { width: 1080, height: 1350 };
        break;
      case 'Landscape':
        newSize = { width: 1350, height: 1080 };
        break;
      default:
        newSize = { width: 1280, height: 1280 };
    }
    
    setImageSize(newSize);

    // Update post if it exists
    if (currentPost) {
      try {
        const updatedPost = await updatePost(postId, {
          ...currentPost,
          image: {
            ...currentPost.image,
            dimensions: newDimensions,
            size: newSize
          }
        });
        setCurrentPost(updatedPost);
      } catch (error) {
        console.error('Error updating dimensions:', error);
        setLocalError('Failed to update dimensions');
      }
    }
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

  const handleTemplateSelect = async (templateUrl) => {
    try {
      // Clear any pending template selection
      if (templateSelectionTimeoutRef.current) {
        clearTimeout(templateSelectionTimeoutRef.current);
      }

      // Set selecting template flag to prevent auto-save
      isSelectingTemplateRef.current = true;

      // Update post with new template selection
      const updatedPostData = {
        ...currentPost,
        image: {
          ...currentPost?.image,
          url: currentPost?.image?.url || templateUrl,
          template: templateUrl
        }
      };
      
      // Update UI immediately
      setCurrentPost(prev => ({
        ...prev,
        image: {
          ...prev.image,
          template: templateUrl
        }
      }));
      setImageTemplate(templateUrl);

      // Debounce the server update
      templateSelectionTimeoutRef.current = setTimeout(async () => {
        try {
          const savedPost = await updatePost(postId, updatedPostData);
          setCurrentPost(savedPost);
          setImageTemplate(savedPost.image?.template || '');
        } catch (error) {
          console.error('Error updating template:', error);
          setLocalError('Failed to update template');
        } finally {
          isSelectingTemplateRef.current = false;
        }
      }, 300); // 300ms debounce
    } catch (error) {
      console.error('Error updating template:', error);
      setLocalError('Failed to update template');
      isSelectingTemplateRef.current = false;
    }
  };

  // Cleanup template selection timeout
  useEffect(() => {
    return () => {
      if (templateSelectionTimeoutRef.current) {
        clearTimeout(templateSelectionTimeoutRef.current);
      }
    };
  }, []);

  const handleUpdateTemplates = async () => {
    if (!currentPost?.image?.url || !postTitle || !postSubtitle) {
      setLocalError('Title, subtitle and image are required to generate templates');
      return;
    }

    try {
      setIsGeneratingTemplates(true);
      setLocalError(null);

      // Delete old templates if they exist
      if (currentPost?.templatesUrls?.length > 0) {
        await api.deleteFiles(currentPost.templatesUrls);
      }

      // Generate new templates
      const templatesResult = await api.generateTemplates(postId);

      // Update post with new templates and reset template to original image
      const updatedPost = await updatePost(postId, {
        ...currentPost,
        image: {
          ...currentPost.image,
          template: currentPost.image.url // Reset template to original image
        },
        templatesUrls: templatesResult.templatesUrls || []
      });

      setCurrentPost(updatedPost);
      setImageTemplate(updatedPost.image.url);
    } catch (error) {
      console.error('Error generating templates:', error);
      setLocalError('Failed to generate templates');
    } finally {
      setIsGeneratingTemplates(false);
    }
  };

  const handleFieldChange = async (field, value) => {
    try {
      await updateField(field, value);
    } catch (err) {
      // Error is already logged in the hook
    }
  };

  const onGenerate = async () => {
    try {
      if (!videoPrompt || !selectedVideoModel) {
        setLocalError('Please provide a prompt and select a model');
        return;
      }

      setIsGeneratingVideo(true);
      setLocalError(null);

      // Ensure we have valid dimensions
      if (!imageSize?.width || !imageSize?.height) {
        setLocalError('Invalid image dimensions');
        return;
      }

      const params = {
        prompt: videoPrompt,
        model: selectedVideoModel,
        postId,
        size: {
          width: parseInt(imageSize.width),
          height: parseInt(imageSize.height)
        }
      };

      // If we have an image URL, use imageToVideo
      if (currentPost?.image?.url) {
        params.imageUrl = currentPost.image.url;
      }

      const response = await api.generateVideo(params);
      
      // Update the post with the new video URL
      const updatedPost = await updatePost(postId, {
        ...currentPost,
        image: {
          ...currentPost.image,
          video: response.videoUrl
        },
        prompts: {
          ...currentPost.prompts,
          video: videoPrompt
        },
        models: {
          ...currentPost.models,
          video: selectedVideoModel
        }
      });

      setCurrentPost(updatedPost);
      setLocalError(null);
    } catch (error) {
      console.error('Error generating video:', error);
      setLocalError(error.message || 'Failed to generate video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

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
          <div className="col-span-2 h-full ">
          <div className="mt-3.5">
          <DimensionsSelector value={dimensions} onChange={handleDimensionsChange}/>
          </div>
            <div className="rounded-lg overflow-hidden h-full">
              <SelectTemplate 
                templatesUrls={currentPost?.templatesUrls || []}
                title={postTitle}
                subtitle={postSubtitle}
                onTitleChange={setPostTitle}
                onSubtitleChange={setPostSubtitle}
                currentTemplate={currentPost?.image?.template}
                onTemplateSelect={handleTemplateSelect}
                originalImageUrl={currentPost?.image?.url}
                onUpdateTemplates={handleUpdateTemplates}
                isGeneratingTemplates={isGeneratingTemplates}
              />
            </div>
          </div>

          {/* Middle Column */}
          <div className="col-span-7 flex flex-col gap-4">
            {/* Top Section - Date, Platform, Time in equal blocks */}
            <div className="h-16 rounded-lg">
              <div className="grid grid-cols-3 h-full">
                <div className="flex items-center justify-center ps-2 pe-2 me-7">
                  <PostDateSelector date={selectedDate} onChange={setSelectedDate} accountId={accountId}/>
                </div>
                <div className="flex items-center justify-center">
                  <PostPlatformSelector
                    selectedPlatforms={selectedPlatforms}
                    onPlatformsChange={setSelectedPlatforms}
                  />
                </div>
                <div className="flex items-center justify-center ps-2 pe-2 ms-3">
                  <PostTimeSelector time={selectedTime} onChange={setSelectedTime} accountId={accountId} />
                </div>
              </div>
            </div>
            

            {/* Middle Section - Image Preview */}
            <div className="flex-[4] bg-gray-100 rounded-lg min-h-0 relative">
              <DisplayImage 
                imageUrl={currentPost?.image?.url}
                templateUrl={currentPost?.image?.template}
                videoUrl={currentPost?.image?.video}
                templatesUrls={currentPost?.templatesUrls || []}
                onTemplateSelect={handleTemplateSelect}
                showVideo={currentPost?.image?.showVideo}
                postId={postId}
                onImageUpload={async (imageUrl, templateUrl) => {
                  try {
                    // Delete old templates if they exist
                    if (currentPost?.templatesUrls?.length > 0) {
                      await api.deleteFiles(currentPost.templatesUrls);
                    }

                    // Delete old image if it exists
                    if (currentPost?.image?.url) {
                      await api.deleteFiles([currentPost.image.url]);
                    }

                    // Update post with new image URL and template
                    const updatedPost = await updatePost(postId, {
                      ...currentPost,
                      image: {
                        ...currentPost?.image,
                        url: imageUrl,
                        template: templateUrl, // Set template to the same URL initially
                        size: imageSize,
                        dimensions: dimensions
                      },
                      templatesUrls: [] // Clear existing templates
                    });
                    
                    setCurrentPost(updatedPost);
                    setImageTemplate(templateUrl); // Update template state

                    // Generate new templates if we have all required fields
                    if (updatedPost.image?.url && postTitle && postSubtitle) {
                      try {
                        const templatesResult = await api.generateTemplates(postId);
                        setCurrentPost(templatesResult);
                      } catch (error) {
                        console.error('Error generating templates:', error);
                        setLocalError('Image saved but template generation failed');
                      }
                    }
                    setLocalError(null);
                  } catch (error) {
                    console.error('Error updating image:', error);
                    setLocalError(error.message || 'Failed to update image');
                  }
                }}
              />
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
            <div className="flex items-center justify-end w-full">
              <PostNow accountId={accountId} post={currentPost} />
            </div>
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

                      // Delete the post (server will handle template cleanup)
                      await deletePost(postId);
                      setPostId(null);
                      setCurrentPost(null);
                      if (onUpdate) await onUpdate();
                      handleClose();
                    } catch (error) {
                      console.error('Error deleting post:', error);
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
                      // Generate the main image first
                      const { url } = await api.generateImage({
                        prompt: imagePrompt,
                        model: selectedImageModel,
                        width: imageSize.width,
                        height: imageSize.height,
                        accountId: accountId
                      });
                      
                      // Delete old templates if they exist
                      if (currentPost?.templatesUrls?.length > 0) {
                        await api.deleteFiles(currentPost.templatesUrls);
                      }

                      // Delete old image if it exists
                      if (currentPost?.image?.url) {
                        await api.deleteFiles([currentPost.image.url]);
                      }

                      // Update post with new image URL and set it as template initially
                      const updatedPost = await updatePost(postId, {
                        ...currentPost,
                        image: {
                          ...currentPost?.image,
                          url: url,
                          template: url, // Set template to the same URL initially
                          size: imageSize,
                          dimensions: dimensions
                        },
                        prompts: {
                          ...currentPost?.prompts,
                          image: imagePrompt // Save the image prompt
                        },
                        models: {
                          ...currentPost?.models,
                          image: selectedImageModel // Save the selected model
                        },
                        templatesUrls: [] // Clear existing templates
                      });
                      
                      setCurrentPost(updatedPost);
                      setImageTemplate(url); // Update template state

                      // Generate new templates if we have all required fields
                      if (updatedPost.image?.url && postTitle && postSubtitle) {
                        try {
                          const templatesResult = await api.generateTemplates(postId);
                          setCurrentPost(templatesResult);
                        } catch (error) {
                          console.error('Error generating templates:', error);
                          setLocalError('Image saved but template generation failed');
                        }
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
                  isLoading={isGeneratingVideo}
                  onGenerate={onGenerate}
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
                        model: selectedLLMModel,
                        accountId: accountId
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
                  className="w-full mt-5 bg-[#5CB338] hover:bg-[#4a9c2d] text-white rounded-lg" 
                  pulseColor="92 179 56"
                  duration="2s"
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
