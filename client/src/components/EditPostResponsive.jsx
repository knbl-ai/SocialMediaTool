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
import api from '../lib/api';
import MODELS from '../config/models';

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

const EditPostResponsive = ({ show, onClose, date, accountId, initialPlatform, postId: initialPostId, onUpdate }) => {
  // Basic post states
  const [selectedTime, setSelectedTime] = useState(DEFAULT_STATE.selectedTime)
  const [selectedDate, setSelectedDate] = useState(date)
  const [postId, setPostId] = useState(initialPostId);
  const [error, setError] = useState(null);
  const initializationRef = useRef(false);

  // Content states
  const [postText, setPostText] = useState(DEFAULT_STATE.postText);
  const [postTitle, setPostTitle] = useState(DEFAULT_STATE.postTitle);
  const [postSubtitle, setPostSubtitle] = useState(DEFAULT_STATE.postSubtitle);
  const [imageSize, setImageSize] = useState(DEFAULT_STATE.imageSize);
  const [imageTemplate, setImageTemplate] = useState(DEFAULT_STATE.imageTemplate);

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

  const handleClose = useCallback(async () => {
    if (onUpdate) {
      await onUpdate();
    }
    onClose();
  }, [onClose, onUpdate]);

  // Reset states when modal closes
  useEffect(() => {
    if (!show) {
      Object.entries(DEFAULT_STATE).forEach(([key, value]) => {
        const setter = eval(`set${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (setter) setter(value);
      });
      initializationRef.current = false;
      setError(null);
    }
  }, [show]);

  // Initialize post data
  useEffect(() => {
    let isActive = true;

    const initializePost = async () => {
      if (!show || !accountId || !date || initializationRef.current) {
        return;
      }

      try {
        let post;
        try {
          if (initialPostId) {
            post = await api.getPost(initialPostId);
          } else {
            // Try to find existing post
            const response = await api.getPosts({
              accountId,
              startDate: date.toISOString().split('T')[0],
              endDate: date.toISOString().split('T')[0],
              platform: initialPlatform
            });
            
            post = Array.isArray(response) && response.length > 0 ? response[0] : null;

            // If no post exists, create a new one
            if (!post) {
              post = await api.createPost({
                accountId,
                platforms: [initialPlatform],
                datePost: date.toISOString().split('T')[0],
                timePost: DEFAULT_STATE.selectedTime
              });
            }
          }
        } catch (error) {
          console.error('Error fetching/creating post:', error);
          throw new Error('Failed to initialize post: ' + error.message);
        }

        if (!isActive || !show) return;

        if (post) {
          setPostId(post._id);
          setSelectedPlatforms(post.platforms || []);
          setSelectedTime(post.timePost || DEFAULT_STATE.selectedTime);
          setPostText(post.text?.post || '');
          setPostTitle(post.text?.title || '');
          setPostSubtitle(post.text?.subtitle || '');
          setImagePrompt(post.prompts?.image || '');
          setVideoPrompt(post.prompts?.video || '');
          setTextPrompt(post.prompts?.text || '');
          setSelectedImageModel(post.models?.image || DEFAULT_STATE.selectedImageModel);
          setSelectedVideoModel(post.models?.video || DEFAULT_STATE.selectedVideoModel);
          setSelectedLLMModel(post.models?.text || DEFAULT_STATE.selectedLLMModel);
          setImageSize(post.image?.size || DEFAULT_STATE.imageSize);
          setImageTemplate(post.image?.template || '');
        }

        initializationRef.current = true;
      } catch (error) {
        console.error('Error during post initialization:', error);
        setError(error.message || 'Failed to initialize post');
      }
    };

    initializePost();
    return () => {
      isActive = false;
    };
  }, [show, accountId, date, initialPlatform, initialPostId]);

  // Save changes when form values change
  useEffect(() => {
    if (!postId) return;

    const saveChanges = async () => {
      try {
        const postData = {
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
        };

        await api.updatePost(postId, postData);
        setError(null);
      } catch (error) {
        console.error('Error saving changes:', error);
        setError(error.message || 'Failed to save changes');
      }
    };

    const debouncedSave = (() => {
      let timeoutId;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(saveChanges, 1000);
      };
    })();

    debouncedSave();
    return () => clearTimeout(debouncedSave);
  }, [
    postId, selectedPlatforms, selectedDate, selectedTime,
    imageSize, imageTemplate, postText, postTitle, postSubtitle,
    imagePrompt, videoPrompt, textPrompt,
    selectedImageModel, selectedVideoModel, selectedLLMModel
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
              <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-400 hover:text-gray-500">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditPostResponsive;
