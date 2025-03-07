# Social Media Tool

A comprehensive social media management platform for scheduling and managing posts across multiple platforms.

## Architecture Overview

### Client-Server Architecture
The application follows a client-server architecture with:
- Frontend: React + Vite application
- Backend: Node.js + Express server
- Database: MongoDB with Mongoose ODM

## Recent Improvements

### Enhanced Image and Video Processing

#### 1. Standardized File Naming
We've implemented a standardized file naming convention to prevent issues with special characters, spaces, and non-ASCII characters:

```javascript
// Standardized naming pattern
`${Date.now()}-iGentityUploadFile${fileExtension}`

// Implementation details:
- Preserves original file extension for proper MIME type handling
- Uses timestamp for uniqueness
- Eliminates problematic characters from filenames
- Consistent across all file upload services (Google Cloud Storage and FAL.ai)
```

**Modified Files:**
- `server/config/storage.js`: Updated `uploadImage` function to use standardized filenames
- `server/services/videoService.js`: Updated `uploadFile` function to use the same naming convention

#### 2. Improved Video Generation from Images
We've enhanced the image-to-video generation process to handle any image aspect ratio:

```javascript
// Video Generation Workflow
1. Image Analysis
   - Analyzes original image dimensions and aspect ratio
   - Determines closest standard aspect ratio (1:1, 4:3, 16:9, 9:16)
   - Logs detailed information about the conversion process

2. Smart Image Processing
   - Automatically crops and resizes to the optimal aspect ratio
   - Uses center-focused cropping to preserve important content
   - Maintains high image quality (90% JPEG quality)
   - Warns about significant cropping for unusual aspect ratios

3. Standardized Upload
   - Uses consistent naming convention for processed images
   - Uploads with appropriate content type
   - Provides detailed logging throughout the process

4. Video Generation
   - Uses processed image with standard aspect ratio
   - Configures video parameters based on processed image
   - Ensures compatibility with video generation APIs
```

**Technical Implementation:**

1. **New Image Processing Function**
   ```javascript
   // server/utils/imageProcessor.js
   export const prepareImageForVideo = async (imageUrl) => {
     // 1. Fetch and analyze the image
     // 2. Find closest standard aspect ratio
     // 3. Resize and crop to target dimensions
     // 4. Return processed image with metadata
   }
   ```

2. **Enhanced Video Generation**
   ```javascript
   // server/services/videoService.js
   export const imageToVideo = async (prompt, model, imageUrl, options = {}) => {
     // 1. Process image to standard aspect ratio
     // 2. Upload with standardized filename
     // 3. Configure video generation with processed image parameters
     // 4. Generate and return video
   }
   ```

3. **Standardized File Upload**
   ```javascript
   // server/services/videoService.js
   export const uploadFile = async (fileOrBuffer, filename = `${Date.now()}-iGentityUploadFile.jpg`) => {
     // 1. Handle both Buffer and File objects
     // 2. Apply standardized naming
     // 3. Upload to FAL.ai storage
   }
   ```

**Modified Files:**
- `server/utils/imageProcessor.js`: Added new `prepareImageForVideo` function
- `server/services/videoService.js`: Updated `imageToVideo` and `uploadFile` functions
- `server/config/storage.js`: Updated `uploadImage` function

These improvements ensure:
- Reliable file handling across all storage systems
- Consistent video generation regardless of input image format
- Prevention of errors caused by special characters in filenames
- Better error handling and logging throughout the process

#### 3. Image-to-Video Toggle Functionality
We've implemented a new feature that allows users to toggle between text-to-video and image-to-video generation modes:

```javascript
// Image-to-Video Toggle Implementation
1. UI Enhancement
   - Added image icon next to "Video Generation" header
   - Icon appears active/inactive based on image availability
   - Visual feedback shows current mode (blue when active)
   - Tooltip explains functionality to users

2. State Management
   - New state variable: useImageToVideo (boolean)
   - Toggle function: handleToggleImageToVideo
   - Conditional logic in video generation based on toggle state
   - Preserves original image as screenshot when using image-to-video

3. Server-Side Processing
   - Enhanced generateVideo controller to handle both modes
   - Detects mode based on presence of imageUrl parameter
   - Uses appropriate video generation service based on mode
   - Returns consistent response format for both modes

4. Video Generation Flow
   - Text-to-Video: Uses prompt to generate video from scratch
   - Image-to-Video: Uses existing image as starting point with prompt for guidance
   - Both modes maintain consistent dimensions and aspect ratios
   - Both update post with appropriate video URLs and screenshots
```

**Technical Implementation:**

1. **Client-Side Toggle Component**
   ```jsx
   // PostSelectItems.jsx
   {type === 'video' && (
     <div 
       className={`flex items-center ${hasImage ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
       onClick={() => hasImage && onToggleImageToVideo && onToggleImageToVideo()}
       title={hasImage ? 'Toggle image-to-video mode' : 'No image available for image-to-video'}
     >
       <Image 
         className={`w-4 h-4 ml-2 ${useImageToVideo ? 'text-blue-500' : 'text-gray-400'}`} 
       />
     </div>
   )}
   ```

2. **Video Generation Logic**
   ```javascript
   // EditPostResponsive.jsx
   const onGenerateVideo = async () => {
     // ... existing setup code ...
     
     // Check if we should use image-to-video
     const shouldUseImageToVideo = useImageToVideo && currentPost?.image?.url;
     
     // If we have an image URL and useImageToVideo is true, use imageToVideo
     if (shouldUseImageToVideo) {
       params.imageUrl = currentPost.image.url;
       
       // Save the current image URL as screenshot before generating video
       const imageScreenshot = currentPost.image.url;
       
       // Generate video using image-to-video
       const response = await api.generateVideo(params);
       
       // Update post with video URL and original image as screenshot
       // ... update logic ...
     } else {
       // Use regular text-to-video
       // ... existing text-to-video logic ...
     }
   };
   ```

3. **Server-Side Controller**
   ```javascript
   // postsController.js
   export const generateVideo = async (req, res) => {
     // ... existing setup code ...
     
     // Check if we should use image-to-video or text-to-video
     if (imageUrl) {
       // Use image-to-video if imageUrl is provided
       const result = await imageToVideo(prompt, model, imageUrl, { 
         size: { width, height } 
       });
       
       videoUrl = result.videoUrl;
       screenshotUrl = result.screenshotUrl;
     } else {
       // Use text-to-video if no imageUrl is provided
       // ... existing text-to-video logic ...
     }
   };
   ```

**Benefits:**
- **Enhanced User Control**: Users can choose the most appropriate video generation method
- **Improved Results**: Using existing images often produces more consistent and predictable videos
- **Resource Efficiency**: Image-to-video can be faster and use fewer resources than text-to-video
- **Workflow Integration**: Seamlessly integrates with the existing image generation workflow
- **Visual Feedback**: Clear UI indicators show which mode is active and when it's available

**Usage:**
1. First generate or upload an image in the post editor
2. Switch to video generation tab
3. If an image is available, the image icon next to "Video Generation" becomes clickable
4. Click the icon to toggle between text-to-video and image-to-video modes
5. When image-to-video is active, the icon turns blue
6. Enter a prompt to guide the video generation
7. Click "Generate Video" to create a video based on the selected mode

#### 4. Benefits and Troubleshooting

**Key Benefits:**
- **Improved Reliability**: Eliminates failures due to non-standard filenames or unusual aspect ratios
- **Better User Experience**: Users can upload any image and have it properly processed for video generation
- **Reduced Support Issues**: Fewer errors related to file handling and video generation
- **Enhanced Debugging**: Comprehensive logging throughout the process makes troubleshooting easier
- **Consistent Quality**: Standardized approach ensures consistent results across different input types

**Troubleshooting:**

If you encounter issues with image processing or video generation:

1. **Check Logs for Image Analysis**
   ```
   Original image dimensions: [width]x[height], ratio: [ratio]
   Comparing to [aspect ratio] ([ratio value]): difference = [difference]
   Selected aspect ratio: [name] ([width]x[height])
   ```
   These logs help identify if the system is correctly analyzing the image dimensions.

2. **Verify Processed Image**
   ```
   Processed image: [width]x[height], size: [size]MB
   ```
   Confirms the image was successfully processed to a standard aspect ratio.

3. **Check Upload Confirmation**
   ```
   Uploading file with standardized name: [filename]
   ```
   Ensures the file was uploaded with the correct standardized naming convention.

4. **Video Generation Parameters**
   ```
   Generating video with aspect ratio: [aspect_ratio], dimensions: [width]x[height]
   ```
   Confirms the correct parameters are being passed to the video generation API.

**Common Issues and Solutions:**

1. **Issue**: Video generation fails with unusual aspect ratios
   **Solution**: The new `prepareImageForVideo` function automatically converts to standard ratios

2. **Issue**: Files with special characters in names cause errors
   **Solution**: Standardized naming convention eliminates problematic characters

3. **Issue**: Image processing fails for very large images
   **Solution**: Check server memory limits and consider adding size restrictions if needed

4. **Issue**: Video generation API returns errors
   **Solution**: Check the detailed error logs which now include more information about the processed image and API parameters

## Frontend Architecture

### Core Structure
```
client/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Shadcn UI components
│   │   └── editPost/     # Post editing components
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   │   └── useContentPlanner.js  # Content planner state management
│   ├── lib/              # Utilities and API client
│   ├── pages/            # Route components
│   └── services/         # API service layers
```

### Content Planner System

1. **Content Planner Model**
   ```javascript
   contentPlanner: {
     accountId: ObjectId,      // Reference to Account
     voice: String,            // Professional, Funny, Engaging, etc.
     template: String,         // Template selection
     audience: String,         // Target audience description
     creativity: Number,       // 0-1 scale for content generation
     textGuidelines: String,   // Guidelines for text generation
     llm: String,             // Selected LLM model
     imageGuidelines: String,  // Guidelines for image generation
     generateUploaded: Boolean, // Switch between image generation and uploaded images
     uploadedImages: [{        // Array of uploaded images with descriptions
       imageUrl: String,       // URL of the uploaded image
       imageDescription: String // Description of the uploaded image
     }],
     imageModel: String,       // Selected image model
     date: Date,              // Start date
     duration: String,         // Week/Month
     frequency: Number,        // Posts per period
     postingTime: Number,      // Hour of the day (0-23)
     platforms: [String],      // Selected platforms ['Instagram', 'Facebook', etc.]
     autoRenew: Boolean,      // Auto-renewal setting
     contentPlanJSON: String   // Generated content plan in JSON format
   }
   ```

2. **Date and UTC Handling**
   ```javascript
   // Date Management
   - All dates are stored in UTC in the database
   - Frontend displays dates in local timezone
   - Backend adjusts dates for content generation:
     ├── Adjusts for timezone offset when generating content plan
     ├── Maintains consistent dates across platforms
     └── Uses formula: date.setMinutes(date.getMinutes() - date.getTimezoneOffset())

   // UTC Offset Handling
   - Content generation respects selected date regardless of timezone
   - Post scheduling maintains consistent timing across regions
   - Prevents date shifting when generating content across midnight UTC
   ```

3. **Platform-Specific Image Generation**
   ```javascript
   // Image Dimensions by Platform
   Instagram: {
     dimensions: { width: 1080, height: 1080 },
     type: 'Square'
   },
   Facebook: {
     dimensions: { width: 1200, height: 630 },
     type: 'Horizontal'
   },
   LinkedIn: {
     dimensions: { width: 1200, height: 627 },
     type: 'Horizontal'
   },
   TikTok: {
     dimensions: { width: 1080, height: 1920 },
     type: 'Story'
   },
   X: {
     dimensions: { width: 1200, height: 675 },
     type: 'Horizontal'
   }

   // Image Processing Flow
   1. Generate base image with optimal dimensions
   2. Resize for each platform using Sharp
   3. Upload platform-specific versions
   4. Store URLs and dimensions in post model

   // Image Quality Management
   - JPEG format for consistency
   - 90% quality preservation
   - Maintains aspect ratios
   - Handles both AI-generated and uploaded images
   ```

4. **State Management**
   - Uses `useContentPlanner` hook for state management
   - Implements optimistic updates with error rollback
   - Debounced API calls (500ms) for better performance
   - Automatic state synchronization with backend

3. **Component Structure**
   ```
   ContentPlanner/
   ├── SelectField          # Reusable select component
   ├── CreativitySlider     # Creativity level control
   ├── TargetAudience      # Audience input component
   ├── Duration            # Date and duration settings with shadcn select
   ├── PlatformSelector    # Social media platform selection
   └── TooltipLabel        # Reusable tooltip component for field labels
   ```

4. **UI Enhancements**
   ```javascript
   // Tooltip Configuration
   const contentPlannerTooltips = {
     voice: "Select the tone and style for your content",
     template: "Choose a template for consistent formatting",
     audience: "Define your target audience demographics",
     // ... more tooltip texts
   }

   // Duration Component Layout
   Duration = {
     layout: "grid",
     components: [
       StartDate: { type: "datepicker", position: "left" },
       DurationSelect: { type: "shadcn/select", position: "right" }
     ]
   }

   // AutoRenew Position
   ContentPlanner = {
     layout: "flex",
     autoRenewSwitch: { position: "bottom-right" }
   }
   ```

5. **Best Practices**
   - Centralized tooltip text management
   - Consistent UI component spacing
   - Reusable tooltip components
   - Responsive grid layouts
   - Clear visual hierarchy
   - Informative help text
   ```

4. **API Integration**
   ```javascript
   // Content Planner Endpoints
   GET    /api/content-planner/:accountId  // Get planner
   PUT    /api/content-planner/:accountId  // Update planner
   POST   /api/content-planner/:accountId/generate  // Generate content plan
   ```

5. **Default Values**
   ```javascript
   {
     voice: 'professional',
     template: 'no',
     creativity: 0.3,
     llm: 'claude-3-5-haiku-20241022',
     imageModel: 'fal-ai/flux/schnell',
     duration: 'month',
     frequency: 2,
     postingTime: 10,
     platforms: ['Instagram', 'Facebook'],
     autoRenew: false
   }
   ```

6. **Content Plan Generation System**
   
   The system supports two modes of content generation:

   A. AI-Generated Images Mode:
   // ... existing content about AI image generation ...

   B. Uploaded Images Mode:
   ```javascript
   // Process Flow
   1. User uploads images with descriptions
   2. User switches to "Uploaded Images" mode
   3. System generates content based on:
      - Start date from content planner
      - Frequency setting for post spacing
      - Image descriptions for context
      - Text guidelines for content style
   
   // Generation Process
   1. Date Calculation
      - Starts from contentPlanner.date
      - Spaces posts based on contentPlanner.frequency
      - Creates a date-to-image mapping
   
   2. Content Generation
      - Uses image descriptions as context
      - Applies text guidelines and voice settings
      - Generates matching content for each image
      - Maintains platform-specific formatting
   
   3. Post Creation
      - Creates posts with uploaded images
      - Adds generated text content
      - Sets proper image dimensions
      - Maintains platform compatibility
   
   // API Endpoints
   POST /api/content-planner/:accountId/generate-from-uploaded
   
   // Response Format
   {
     message: 'ContentPlanSaved:ok',
     posts: [
       {
         datePost: "2024-02-10",
         image: {
           url: "https://...",
           template: "https://...",
           dimensions: "Square"
         },
         text: {
           post: "Generated content...",
           title: "Post title",
           subtitle: "Post subtitle"
         }
       },
       // ... more posts
     ]
   }
   ```

7. **Features**
   - Automatic content planner creation with new accounts
   - Real-time updates with debouncing
   - Integrated LLM and image model selection
   - Customizable content guidelines
   - Flexible scheduling options
   - Template management
   - Platform-specific content generation
   - Configurable posting time
   - Multi-platform support

8. **Best Practices**
   - Memoized components for performance
   - Debounced API calls
   - Error handling with rollback
   - Type validation
   - Default values for all fields
   - Progress indication for long operations
   - User feedback through toast notifications

### Image and Template Management

1. **Image Upload and Display**
   - Component: `DisplayImage.jsx`
   - Features:
     - Direct image upload through click/drag-n-drop
     - Maintains original image proportions
     - Supports image preview
     - Handles both uploaded and generated images
     - Maximum file size: 5MB
     - Supported formats: All image types

2. **Template Management**
   - Component: `SelectTemplate.jsx`
   - Features:
     - Displays original image and generated templates
     - Maintains aspect ratio for all images
     - Supports template selection/deselection
     - Provides template regeneration
     - Title and subtitle input for templates
     - Visual feedback for selected template

3. **Image Dimensions**
   - Component: `DimensionsSelector.jsx`
   - Supported Formats:
     ```javascript
     const dimensions = [
       { name: 'Square', size: { width: 1280, height: 1280} },
       { name: 'Horizontal', size: { width: 1280, height: 960} },
       { name: 'Horizontal Wide', size: { width: 1280, height: 720} },
       { name: 'Story', size: { width: 720, height: 1280} }
     ]
     ```
   - Features:
     - Immediate database updates on selection
     - Maintains consistency with image generation
     - Error handling with state reversion

4. **Template Generation Flow**
   - Requirements:
     - Original image URL
     - Post title
     - Post subtitle
     - Image dimensions
   - Process:
     1. Deletes existing templates
     2. Generates new templates
     3. Updates post with new template URLs
     4. Resets template to original image
     5. Updates UI with new templates

5. **State Management**
   - Debounced template selection (300ms)
   - Immediate dimension updates
   - Automatic template generation on image upload
   - Error handling with user feedback
   - Cleanup of old images and templates

### Post Model Image Structure
```javascript
image: {
  url: String,          // Original image URL
  template: String,     // Currently selected template URL
  size: {              // Image dimensions
    width: Number,
    height: Number
  },
  dimensions: String    // Dimension preset name
},
templatesUrls: [String] // Array of generated template URLs
```

### API Integration

1. **Image Operations**
   ```javascript
   // Upload image
   api.uploadImage(formData)
   
   // Generate templates
   api.generateTemplates(postId)
   
   // Delete files
   api.deleteFiles(urls)
   ```

2. **Storage Management**
   - Google Cloud Storage integration
   - Automatic cleanup of old files
   - URL validation for deletion
   - Error handling for missing files

### Error Handling
1. **Upload Validation**
   - File type checking
   - Size limitations
   - Missing file handling

2. **Template Generation**
   - Missing fields validation
   - Generation failure recovery
   - Partial success handling

3. **Dimension Updates**
   - State reversion on failure
   - Database sync validation
   - User feedback on errors

### Best Practices
1. **Image Handling**
   - Maintain aspect ratios
   - Prevent image stretching
   - Center images in containers
   - Provide loading states

2. **State Management**
   - Debounce frequent updates
   - Immediate UI feedback
   - Delayed server sync
   - Error state recovery

3. **Resource Cleanup**
   - Delete unused images
   - Clear old templates
   - Handle missing resources
   - Prevent orphaned files

### Authorization System

1. **Authorized Users Model**
   ```javascript
   authorizedUser: {
     email: String,           // Required, unique, lowercase
     status: String,          // 'active' or 'inactive'
     addedBy: ObjectId,       // Reference to User who added
     createdAt: Date         // Timestamp of creation
   }
   ```

2. **Authorization Management**
   - Server-side authorization checks
   - Email-based access control
   - Status tracking for user access
   - Automatic email normalization
   - Indexed email lookups for performance

3. **CLI Tool for User Management**
   ```bash
   # Add single user
   npm run auth-user user@example.com

   # Add multiple users
   npm run auth-user user1@example.com user2@example.com

   # Add users from file
   npm run auth-user -- --file emails.txt
   ```

4. **Features**
   - Email validation and normalization
   - Automatic reactivation of inactive users
   - Bulk user import from file
   - Status tracking and management
   - Detailed operation logging
   - Error handling and reporting

5. **API Integration**
   ```javascript
   // Authorization Endpoints
   GET    /api/auth/check-authorization   // Check user authorization
   POST   /api/auth/login                 // User login with authorization check
   POST   /api/auth/register              // User registration with authorization check
   ```

6. **UI Implementation**
   - Conditional rendering based on authorization
   - Clear feedback for unauthorized users
   - Seamless integration with existing auth flow
   - Status-aware component behavior

7. **Best Practices**
   - Secure email storage
   - Case-insensitive email matching
   - Efficient database indexing
   - Detailed error messaging
   - Audit logging capability
   - Scalable user management

## Backend Architecture

### Core Structure
```
server/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
└── utils/          # Utility functions
```

### Key Components

1. **Data Models**
   ```javascript
   // User Model
   {
     email: String,
     password: String,
     accounts: [AccountId]
   }

   // Account Model
   {
     name: String,
     platforms: [String],
     settings: {
       timezone: String,
       language: String
     }
   }

   // Post Model
   {
     accountId: ObjectId,
     platforms: [String],
     datePost: Date,
     timePost: String,
     text: {
       post: String,
       title: String,
       subtitle: String
     },
     image: {
       url: String,
       size: { width: Number, height: Number },
       template: String
     },
     models: {
       image: String,
       video: String,
       text: String
     }
   }
   ```

2. **Authentication Flow**
   - JWT-based authentication
   - HTTP-only cookies for token storage
   - Google OAuth integration
   - Protected route middleware

3. **API Structure**

   **Authentication Endpoints** (`/api/auth`):
   ```
   POST /login
   ├── Body: { email, password }
   ├── Response: { user, token }
   └── Validation: email format, password min length

   POST /register
   ├── Body: { email, password, name }
   ├── Response: { user, token }
   └── Validation: email unique, password strength

   POST /logout
   └── Clears HTTP-only cookie
   ```

   **Account Management** (`/api/accounts`):
   ```
   GET /
   ├── Query: { page, limit }
   └── Response: { accounts[], total }

   POST /
   ├── Body: { name, platforms[], settings }
   └── Validation: name required, platforms array

   PUT /:id
   ├── Params: accountId
   ├── Body: { name?, platforms[], settings? }
   └── Validation: valid accountId, platforms array

   DELETE /:id
   ├── Params: accountId
   └── Validation: valid accountId, user ownership
   ```

   **Post Management** (`/api/posts`):
   ```
   GET /search
   ├── Query: { accountId, startDate, endDate, platform }
   └── Response: { posts[] }

   POST /
   ├── Body: {
   │   accountId,
   │   platforms[],
   │   datePost,
   │   timePost,
   │   text: { post, title, subtitle },
   │   image: { size, template },
   │   models: { image, video, text }
   │ }
   └── Validation: required fields, valid models

   PUT /:id
   ├── Params: postId
   ├── Body: same as POST
   └── Validation: valid postId, field types

   DELETE /:id
   ├── Params: postId
   └── Validation: valid postId, user ownership
   ```

   **Middleware Chain**:
   ```
   Request
     ↓
   Auth Middleware (verify token)
     ↓
   Validation Middleware (Joi schemas)
     ↓
   Route Handler
     ↓
   Error Handler (if error occurs)
     ↓
   Response
   ```

4. **Error Handling**
   - Centralized error handling middleware
   - Standardized error responses
   - Input validation using Joi
   - Custom ApiError class

## Environment Configuration

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000

# AI Models Configuration
VITE_IMAGE_MODELS='[
  {"value":"fal-ai/flux/schnell","label":"flux-schnell"},
  {"value":"fal-ai/ideogram/v2/turbo","label":"ideogram-turbo"},
  {"value":"fal-ai/flux-pro/v1.1-ultra","label":"flux-ultra"}
]'

VITE_VIDEO_MODELS='[
  {"value":"runway","label":"Runway Gen-3"},
  {"value":"pika","label":"Pika Labs"}
]'

VITE_LLM_MODELS='[
  {"value":"claude-3-5-haiku@20241022","label":"claude-haiku"},
  {"value":"claude-3-5-sonnet-v2@20241022","label":"claude-sonnet"}
]'
```

Models are configured in `config/models.js`:
```javascript
const parseEnvModels = (envVar, defaultValue = []) => {
  try {
    return JSON.parse(envVar || '[]');
  } catch (error) {
    console.error(`Error parsing models from environment variable:`, error);
    return defaultValue;
  }
};

const MODELS = {
  image: parseEnvModels(import.meta.env.VITE_IMAGE_MODELS),
  video: parseEnvModels(import.meta.env.VITE_VIDEO_MODELS),
  llm: parseEnvModels(import.meta.env.VITE_LLM_MODELS)
};
```

### Backend (.env)
```env
# Server Configuration
PORT=5000                           # Server port (optional, defaults to 5000)
CLIENT_URL=http://localhost:5173    # Frontend URL for CORS

# Database Configuration
MONGODB_URI=mongodb://localhost/social-media-tool

# Authentication
JWT_SECRET=your-secret-key          # Secret for JWT token generation
GOOGLE_CLIENT_ID=your-client-id     # OAuth client ID
GOOGLE_CLIENT_SECRET=your-client-secret

# Google Cloud Storage Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account-email
GOOGLE_CLOUD_PRIVATE_KEY="your-private-key"  # Include quotes to preserve newlines

# AI Services Configuration
FAL_KEY=your-fal-api-key           # For image generation (flux, ideogram models)
ANTHROPIC_API_KEY=your-claude-key   # For text generation (Claude models)
```

Notes:
1. Google Cloud Storage configuration:
   - Requires setting up a service account with Storage Admin permissions
   - The private key should be the full key string with newlines preserved
   - Bucket should be configured with proper CORS settings for file uploads

2. AI Services setup:
   - FAL API key: Get from https://fal.ai/dashboard/keys
   - Anthropic API key: Get from https://console.anthropic.com/
   - Both services require active subscriptions for production use

3. Security considerations:
   - Never commit .env file to version control
   - Use strong, unique values for JWT_SECRET
   - Keep API keys secure and rotate them periodically
   - Set appropriate CORS origins in production

## Component Relationships and Data Flow

1. **Post Management System**
   ```
   PostsDashboard (Calendar View)
   ├── State: currentDate, platform selection
   ├── Hook: usePosts(accountId)
   │   └── Provides: fetchPosts, getPostsByDate
   │
   ├── DayCell (Calendar Day)
   │   ├── Props: day, posts, accountId, currentPlatform
   │   ├── State: modalState (isOpen, platform, postId)
   │   └── Actions: handleCellClick, handlePlatformSelect
   │
   └── EditPostResponsive (Post Editor)
       ├── Props: date, accountId, initialPlatform, postId
       ├── State: post content, models, prompts
       ├── Hook: useEffect for auto-save
       └── API: api.updatePost, api.createPost
   ```

2. **Post Creation Flow**
   ```
   User Action:
   1. User clicks calendar day
      → DayCell.handleCellClick
      → api.getPosts (find existing) or api.createPost (create new)
      → Opens EditPostResponsive modal

   Post Editing:
   2. EditPostResponsive initializes
      → Loads post data if existing
      → Sets up auto-save effect
      → Configures AI models from environment

   Real-time Updates:
   3. User makes changes
      → Debounced auto-save triggers
      → api.updatePost sends changes
      → onUpdate callback refreshes calendar
      → UI updates through usePosts hook
   ```

2. **Account Management System**
   ```
   Main (Account List)
   ├── Hook: useAccounts()
   │   ├── State: accounts, loading, error
   │   ├── Actions: createAccount, updateAccount, deleteAccount
   │   └── Position Management:
   │       ├── updateAccountPosition: Optimistic UI updates
   │       ├── Background server sync
   │       └── Error recovery with full refresh
   │
   ├── AccountCard
   │   ├── Props: account, onAccountDeleted
   │   ├── Features:
   │   │   ├── Draggable interface
   │   │   ├── Circular logo display
   │   │   └── Scrollable description
   │   └── Actions: handleDelete, handleEdit, handleDrag
   │
   └── AccountDashboard
       ├── State: account settings, templates
       ├── Hook: useAccounts for updates
       └── Components:
           ├── AccountOverview
           ├── AccountTemplates
           └── ConnectedPlatforms
               └── Features:
                   ├── Blinking connection indicators
                   └── Real-time connection status

   Data Flow:
   1. User initiates account action (drag/edit/delete)
   2. useAccounts hook handles optimistic UI update
   3. Backend validates and processes in background
   4. Hook maintains UI consistency
   5. Error recovery with automatic refresh if needed
   6. UI reflects changes immediately for smooth UX
   ```

   **Position Management Implementation**:
   ```javascript
   // Client-side optimistic updates
   updateAccountPosition = async (accountId, newPosition) => {
     1. Update local state immediately
        - Splice account from current position
        - Insert at new position
        - Update all positions sequentially
     
     2. Send update to server in background
        - PATCH request with new position
        - No loading state shown
     
     3. Error handling
        - Console error logging
        - Automatic account refresh on failure
        - Maintains data consistency
   }

   // Server-side batch updates
   router.patch('/:id', async (req, res) => {
     1. Find all user accounts (sorted by position)
     2. Locate target account
     3. Update positions in memory
     4. Batch update all affected accounts
     5. Return updated account data
   })
   ```

   **UI Enhancements**:
   - Smooth drag and drop interactions
   - No loading flicker during position updates
   - Immediate visual feedback
   - Graceful error recovery
   - Consistent position management
   ```

## Key Features and Implementation

1. **Calendar Management**
   - Month-based view with day cells
   - Post preview in calendar cells
   - Real-time updates
   - Platform-specific filtering

2. **Post Editor**
   - Multi-platform support
   - AI model integration
   - Image generation
   - Template system

3. **Account System**
   - Multi-account support
   - Platform-specific settings
   - Template management
   - Access control

## Development Guidelines

1. **State Management**
   - Use contexts for global state
   - Use hooks for component logic
   - Keep components focused
   - Implement proper cleanup

2. **API Integration**
   - Use centralized API client
   - Handle errors consistently
   - Implement proper validation
   - Use TypeScript interfaces

3. **Component Structure**
   - Follow atomic design
   - Implement proper prop types
   - Use composition over inheritance
   - Keep components pure

4. **File Management System**
   - **Storage Integration**
     - Uses Google Cloud Storage for file storage
     - Handles template images through dedicated storage routes
     - Maintains clean storage through automated cleanup

   - **Template Management**
     ```
     Template Lifecycle:
     1. Generation
        ├── Delete old templates if they exist
        ├── Generate new templates
        └── Update post with new template URLs

     2. Image Updates
        ├── Delete existing templates
        ├── Generate new image
        └── Regenerate templates if needed

     3. Post Deletion
        ├── Server retrieves template URLs
        ├── Deletes template files from storage
        └── Removes post from database
     ```

   - **File Cleanup Strategy**
     - Centralized cleanup in server controllers
     - Proper URL path extraction for Google Storage
     - Handles template deletion in specific scenarios:
       * When generating new templates
       * When generating new images
       * When deleting posts

   - **Storage Routes** (`/api/storage`):
     ```
     POST /delete
     ├── Body: { urls: string[] }
     ├── Validates URL format
     ├── Extracts file paths
     └── Returns deletion results
     ```

5. **Error Handling**
   - Use ApiError for backend errors
   - Implement proper validation
   - Show user-friendly messages
   - Log errors properly

This documentation serves as a reference for understanding the application's architecture and implementing new features. It provides context about data flow, component relationships, and best practices for maintaining and extending the codebase.

### Authentication Flow

1. **Client-Side Auth Flow**
   ```javascript
   AuthContext
   ├── State: user, loading, error
   ├── Initial Load:
   │   ├── Check if not on auth page
   │   └── Call checkAuthStatus()
   │
   ├── Login/Register:
   │   ├── Call API endpoint with credentials
   │   ├── Receive user data in response
   │   ├── Set user state with response.user
   │   └── Navigate to main page
   │
   ├── Google Login:
   │   ├── Receive Google credential
   │   ├── Send to server for verification
   │   ├── Set user state with response.user
   │   └── Navigate to main page
   │
   └── Logout:
       ├── Clear cookie on server
       ├── Clear user state
       └── Redirect to auth page
   ```

2. **Server-Side Auth Flow**
   ```javascript
   Auth Endpoints (/api/auth)
   ├── POST /login
   │   ├── Body: { email, password }
   │   ├── Response: { user: { id, email, name } }
   │   └── Sets HTTP-only cookie with JWT
   │
   ├── POST /google
   │   ├── Body: { credential }
   │   ├── Response: { user: { id, email, name } }
   │   └── Sets HTTP-only cookie with JWT
   │
   ├── POST /logout
   │   ├── Clears HTTP-only cookie
   │   └── Response: { message: 'Logged out successfully' }
   │
   └── GET /check
       ├── Validates JWT from cookie
       ├── Response: user object if authenticated
       └── Error: 401 if not authenticated
   ```

3. **Protected Routes**
   ```javascript
   Main Component
   ├── On Mount:
   │   ├── Check auth status if user not present
   │   └── Redirect to /auth if not authenticated
   │
   ├── After Auth:
   │   ├── Display loading state while checking
   │   ├── Show user data when authenticated
   │   └── Fetch accounts and other protected data
   │
   └── Error Handling:
       ├── Network errors: Show error message
       └── Auth errors: Redirect to login
   ```

4. **Security Features**
   - JWT stored in HTTP-only cookies
   - Automatic redirection on auth errors
   - Loading states during auth checks
   - Error handling for failed requests
   - Protected route access control
   - Secure cookie settings in production

5. **State Management**
   ```javascript
   AuthProvider
   ├── Manages global auth state
   ├── Provides auth methods to components
   └── Handles auth status persistence

   useAuth Hook
   ├── Provides access to auth context
   ├── Exposes auth methods and state
   └── Throws if used outside AuthProvider
   ```

### Content Import System

#### PDF Import Service
```javascript
// PDFService Features
- Automatic text extraction from PDF files
- Text cleaning and formatting
- File size limit: 5MB
- Error handling with specific messages
- Integration with ContentPlanner model

// API Endpoint
POST /api/pdf/upload
Content-Type: multipart/form-data
{
  pdf: File,
  accountId: string
}

// Response
{
  message: string,
  textGuidelines: string
}
```

#### Google Docs Integration
```javascript
// Features
- Support for both Google Docs and Sheets
- Real-time content extraction
- Automatic text formatting
- Access validation
- Error handling with specific messages

// Requirements
- Document must be set to "Anyone with the link can view"
- Supports both docs.google.com and drive.google.com URLs
- HTTPS protocol required
- Valid Google Cloud credentials

// API Endpoint
POST /api/google-docs/parse
{
  url: string,
  accountId: string
}

// Response
{
  message: string,
  textGuidelines: string
}
```

#### Environment Variables for Content Import
```env
# Google Cloud Configuration for Docs API
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_PRIVATE_KEY="your-private-key"  # Include quotes to preserve newlines
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account-email
```

#### Content Import Components
```javascript
// PDFButton Component
- File selection and upload
- Progress indication
- Error handling with toasts
- Success feedback
- Automatic content update

// GoogleDocButton Component
- URL input and validation
- Processing state indication
- Error handling with toasts
- Success feedback
- Automatic content update

// ContentGuidelinesAdvanced Component
- Integration of both import methods
- Shared success handler
- Real-time content updates
- Error state management
```

#### Error Handling for Content Import
```javascript
// Common Error Codes
400: {
  - Invalid file type
  - Invalid URL format
  - Missing document ID
  - Invalid protocol
}
403: {
  - Access denied to Google Doc
  - Insufficient permissions
}
404: {
  - Document not found
  - No content in document
}
500: {
  - PDF parsing failed
  - Google API errors
  - Server processing errors
}

// Error Response Format
{
  error: "Detailed error message"
}
```
