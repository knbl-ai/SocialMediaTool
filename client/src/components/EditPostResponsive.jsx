import { useState, useEffect, useRef, useCallback } from "react";
import { ImagePlus, X, Trash2 } from "lucide-react";
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
import PostStatus from "./editPost/PostStatus";
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
  selectedImageModel: MODELS.image[1]?.value,
  selectedVideoModel: MODELS.video[3]?.value,
  selectedLLMModel: MODELS.llm[1]?.value
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
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  console.log("currentPost", currentPost);

  // Update ref when currentPost changes
  useEffect(() => {
    if (currentPost) {
      currentPostRef.current = currentPost;
      console.log("Updated currentPostRef with:", currentPost);
    }
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
      
      // First set initial values from the provided initialPost
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
      setDimensions(initialPost.image?.dimensions || 'Square');
      setImageTemplate(initialPost.image?.template || '');
      
      // Set initial currentPost state
      setCurrentPost({
        ...initialPost,
        image: {
          ...initialPost.image,
          showVideo: initialPost.image?.showVideo || false
        }
      });
      
      // Then fetch the latest post data from the server to ensure we have the most up-to-date values
      if (initialPost._id) {
        const fetchLatestPostData = async () => {
          try {
            const latestPost = await api.getPost(initialPost._id);
            if (latestPost) {
              // Update currentPost with the latest data from the server
              // Ensure we preserve the showVideo property
              setCurrentPost({
                ...latestPost,
                image: {
                  ...latestPost.image,
                  showVideo: latestPost.image?.showVideo !== undefined ? latestPost.image.showVideo : initialPost.image?.showVideo || false
                }
              });
            }
          } catch (error) {
            console.error('Error fetching latest post data:', error);
          }
        };
        
        fetchLatestPostData();
      }
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

        // Make sure we preserve the showVideo property and other image properties
        const currentImage = currentPostRef.current?.image || {};

        const postData = {
          platforms: selectedPlatforms,
          datePost: utcDate.toISOString().split('T')[0], // Only use the date portion
          timePost: selectedTime,
          image: {
            ...currentImage, // Preserve all image properties including showVideo
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

  const handleDimensionsChange = async (newDimensions, newSize) => {
    setDimensions(newDimensions);
    setImageSize(newSize);
    
    const updatedPostData = {
      ...currentPost,
      image: {
        ...currentPost.image,
        dimensions: newDimensions,
        size: newSize
      }
    };


    try {
      const savedPost = await updatePost(postId, updatedPostData);
      setCurrentPost(savedPost);
    } catch (error) {
      console.error('Error updating dimensions:', error);
      setLocalError('Failed to update dimensions');
    }
  };

  const handleClose = useCallback(async () => {
    if (onUpdate) {
      await onUpdate();
    }
    clearError();
    // Reset initialization flag so that the latest data is fetched when the modal is reopened
    initializationRef.current = false;
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

  const onGenerateVideo = async () => {
    try {
      if (!videoPrompt || !selectedVideoModel) {
        setLocalError('Please provide a prompt and select a model');
        return;
      }

      setIsGeneratingVideo(true);
      setLocalError(null);

      // Ensure we have valid dimensions and convert to numbers
      if (!imageSize?.width || !imageSize?.height || 
          isNaN(parseInt(imageSize.width)) || isNaN(parseInt(imageSize.height))) {
        setLocalError('Invalid image dimensions');
        setIsGeneratingVideo(false);
        return;
      }

      // Ensure dimensions are positive numbers
      const width = parseInt(imageSize.width);
      const height = parseInt(imageSize.height);
      
      if (width <= 0 || height <= 0) {
        setLocalError('Width and height must be positive numbers');
        setIsGeneratingVideo(false);
        return;
      }

      // First, ensure we have a post to update
      let currentPostId = postId;
      if (!currentPostId) {
        // Create a new post if it doesn't exist yet
        try {
          // Create a date at UTC midnight
          const utcDate = new Date(Date.UTC(
            new Date(selectedDate).getFullYear(),
            new Date(selectedDate).getMonth(),
            new Date(selectedDate).getDate(),
            0, 0, 0, 0
          ));

          // Create the new post with basic data
          const newPostData = {
            accountId,
            platforms: selectedPlatforms,
            datePost: utcDate.toISOString().split('T')[0],
            timePost: selectedTime,
            text: {
              post: postText,
              title: postTitle,
              subtitle: postSubtitle
            },
            image: {
              size: { width, height },
              dimensions: dimensions
            },
            prompts: {
              video: videoPrompt
            },
            models: {
              video: selectedVideoModel
            }
          };

          // Create the post
          const newPost = await api.createPost(newPostData);
          setPostId(newPost._id);
          setCurrentPost(newPost);
          currentPostId = newPost._id;
        } catch (createError) {
          console.error('Error creating new post:', createError);
          setLocalError('Failed to create post for video generation');
          setIsGeneratingVideo(false);
          return;
        }
      }

      const params = {
        prompt: videoPrompt,
        model: selectedVideoModel,
        postId: currentPostId,
        size: {
          width,
          height
        }
      };

      // If we have an image URL, use imageToVideo
      if (currentPost?.image?.url) {
        params.imageUrl = currentPost.image.url;
      }

      const response = await api.generateVideo(params);

      console.log("Video generation successful, setting showVideo to true");

      // Safely build the updated post data
      const updatedPostData = {
        // Only spread if currentPost exists
        ...(currentPost || {}),
        image: {
          // Safely spread image properties if they exist
          ...(currentPost?.image || {}),
          video: response.videoUrl,
          videoscreenshot: response.screenshotUrl,
          showVideo: true, // Explicitly set showVideo to true when generating a video
          // Ensure size is properly set
          size: { width, height }
        },
        prompts: {
          // Safely spread prompts if they exist
          ...(currentPost?.prompts || {}),
          video: videoPrompt
        },
        models: {
          // Safely spread models if they exist
          ...(currentPost?.models || {}),
          video: selectedVideoModel
        }
      };
      
      // Update the post and state
      const updatedPost = await updatePost(currentPostId, updatedPostData);
      setCurrentPost(null); // Force a rerender by clearing the state
      setTimeout(() => setCurrentPost(updatedPost), 0); // Set the new state in the next tick
      setLocalError(null);
    } catch (error) {
      console.error('Error generating video:', error);
      setLocalError(error.message || 'Failed to generate video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Add handleDelete function
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      // Reset confirmation after 3 seconds if not clicked
      setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }

    try {
      await api.deletePost(postId);
      onClose();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      // Get the current post data to ensure we don't lose any fields
      const currentPostData = await api.getPost(postId);
      
      if (!currentPostData) {
        console.error('Could not fetch current post data');
        return;
      }
      
      // Update only the status while preserving all other fields
      const updatedPost = await updatePost(postId, { 
        ...currentPostData,
        status: newStatus 
      });
      
      setCurrentPost(prev => ({ ...prev, status: newStatus }));
      onUpdate?.();
      return updatedPost;
    } catch (error) {
      console.error('Error updating post status:', error);
      throw error;
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
          <div className="col-span-2 h-full">
            <div className="flex items-center justify-end gap-2 h-16">
              <PostStatus 
                className="w-[40px]" 
                currentStatus={currentPost?.status || 'pending'}
                onStatusChange={handleStatusChange}
                disabled={isGeneratingTemplates}
                postId={postId}
              />
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
                onImageUpload={async (imageUrl, additionalProps = {}) => {
                  try {
                    // If this is a video upload (imageUrl is null), we only update video-related properties
                    if (imageUrl === null && additionalProps.video) {
                      console.log("EditPostResponsive: Handling video upload with:", additionalProps);
                      
                      // Update post with new video URL and screenshot
                      console.log("EditPostResponsive: Current post before update:", currentPost);
                      const updatedPostData = {
                        ...currentPost,
                        image: {
                          ...currentPost?.image,
                          video: additionalProps.video,
                          videoscreenshot: additionalProps.videoscreenshot,
                          showVideo: true // Ensure showVideo is true when uploading a video
                        }
                      };
                      console.log("EditPostResponsive: Updated post data to send:", updatedPostData);
                      
                      const updatedPost = await updatePost(postId, updatedPostData);
                      console.log("EditPostResponsive: Response from updatePost:", updatedPost);
                      
                      // Force a UI refresh by temporarily clearing the state
                      setCurrentPost(null);
                      // Use setTimeout to ensure the state update is processed
                      setTimeout(() => {
                        setCurrentPost(updatedPost);
                        console.log("EditPostResponsive: UI refreshed with new video:", updatedPost.image?.video);
                      }, 0);
                      
                      return;
                    }
                    
                    // Regular image upload flow
                    // Delete old templates if they exist
                    if (currentPost?.templatesUrls?.length > 0) {
                      await api.deleteFiles(currentPost.templatesUrls);
                    }

                    // Delete old image if it exists
                    if (currentPost?.image?.url) {
                      await api.deleteFiles([currentPost.image.url]);
                    }

                    // Get the current showVideo value
                    const currentShowVideo = currentPost?.image?.showVideo;
                    console.log("Current showVideo value before image generation:", currentShowVideo);

                    // Update post with new image URL and set it as template initially
                    const updatedPost = await updatePost(postId, {
                      ...currentPost,
                      image: {
                        ...currentPost?.image,
                        url: imageUrl,
                        template: imageUrl, // Set template to the same URL initially
                        size: imageSize, // Make sure we're using the current imageSize
                        dimensions: dimensions,
                        showVideo: currentShowVideo // Preserve the current showVideo value
                      },
                      templatesUrls: [] // Clear existing templates
                    });
                    
                    setCurrentPost(updatedPost);
                    setImageTemplate(imageUrl); // Update template state

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
                data-auto-dir="true"
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
                onClick={handleDelete}
                className={`relative w-9 h-9 ${
                  deleteConfirm 
                    ? 'bg-red-100 hover:bg-red-200 text-red-600 w-[70px]' 
                    : 'text-red-400 hover:text-red-500'
                } ml-4 transition-all duration-200`}
              >
                {deleteConfirm ? (
                  <span className="text-xs font-medium">Delete?</span>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
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
                      console.log('Missing fields for image generation:', {
                        hasPrompt: !!imagePrompt,
                        hasModel: !!selectedImageModel,
                        imageSize
                      });
                      setLocalError('Please provide all required fields for image generation');
                      return;
                    }
                    try {
                      console.log('Starting image generation with size:', imageSize);
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

                      console.log('Updating post with new image and size:', imageSize);
                      
                      // Get the current showVideo value
                      const currentShowVideo = currentPost?.image?.showVideo;
                      console.log("Current showVideo value before image generation:", currentShowVideo);
                      
                      // Update post with new image URL and set it as template initially
                      const updatedPost = await updatePost(postId, {
                        ...currentPost,
                        image: {
                          ...currentPost?.image,
                          url: url,
                          template: url, // Set template to the same URL initially
                          size: imageSize, // Make sure we're using the current imageSize
                          dimensions: dimensions,
                          showVideo: currentShowVideo // Preserve the current showVideo value
                        },
                        prompts: {
                          ...currentPost?.prompts,
                          image: imagePrompt
                        },
                        models: {
                          ...currentPost?.models,
                          image: selectedImageModel
                        },
                        templatesUrls: []
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
                  onGenerate={onGenerateVideo}
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
