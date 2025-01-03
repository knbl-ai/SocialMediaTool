# Social Media Tool

A comprehensive social media management platform for scheduling and managing posts across multiple platforms.

## Architecture Overview

### Client-Server Architecture
The application follows a client-server architecture with:
- Frontend: React + Vite application
- Backend: Node.js + Express server
- Database: MongoDB with Mongoose ODM

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

2. **State Management**
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
   ├── Duration            # Date and duration settings
   └── PlatformSelector    # Social media platform selection
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
   - Step 1: Initial Content Plan Generation
     ```javascript
     // Input Parameters
     {
       accountName: String,     // From Account model
       accountReview: String,   // From Account model
       audience: String,        // From ContentPlanner
       guidelines: String,      // From ContentPlanner.textGuidelines
       startDate: Date,         // From ContentPlanner.date
       endDate: Date,          // Calculated based on duration
       frequency: Number,       // From ContentPlanner
       voice: String           // From ContentPlanner
     }

     // Process
     1. Calculate end date based on duration (week/month)
     2. Generate content plan using LLM
     3. Save plan as JSON string in contentPlanJSON field
     4. Return success response

     // Response Format
     {
       "2024-01-01": "Cloud migration success metrics overview",
       "2024-01-03": "Common IT infrastructure challenges",
       ...
     }
     ```

   - Step 2: Post Generation Process
     ```javascript
     // For each date in content plan:
     1. Generate Post Content
        - Generate post text using LLM with context
        - Generate image prompt based on topic
        - Generate image if model selected (skip if 'no_images')
     
     2. Create Post
        - Save post with generated content
        - Set default image dimensions (Square, 1280x1280)
        - Associate with platforms from content planner
     
     3. Generate Templates
        - If post has image, generate templates
        - Save template URLs to post
        - Continue if template generation fails
     
     // Error Handling
     - Individual post generation failures don't stop the process
     - Template generation failures are logged but don't block post creation
     - Each step has independent error handling
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
   │   └── Actions: createAccount, updateAccount, deleteAccount
   │
   ├── AccountCard
   │   ├── Props: account, onAccountDeleted
   │   └── Actions: handleDelete, handleEdit
   │
   └── AccountDashboard
       ├── State: account settings, templates
       ├── Hook: useAccounts for updates
       └── Components:
           ├── AccountOverview
           ├── AccountTemplates
           └── ConnectedPlatforms

   Data Flow:
   1. User initiates account action
   2. useAccounts hook handles API call
   3. Backend validates and processes
   4. Hook updates local state
   5. Components re-render with new data
   6. UI reflects changes immediately
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

1. **Token Management**
   ```javascript
   // Token Generation (authController.js)
   const generateToken = (userId) => {
     return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
   };

   // Cookie Configuration
   const cookieOptions = {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     path: '/'
   };
   ```

2. **Authentication Endpoints** (`/api/auth`):
   ```javascript
   POST /login
   ├── Body: { email, password }
   ├── Response: { user: { id, email, name } }
   ├── Sets HTTP-only cookie with JWT
   └── Validation: email format, password verification

   POST /google
   ├── Body: { credential }
   ├── Response: { user: { id, email, name } }
   ├── Sets HTTP-only cookie with JWT
   └── Creates new user if not exists

   POST /logout
   ├── Clears HTTP-only cookie
   └── Response: { message: 'Logged out successfully' }

   GET /check
   ├── Requires valid JWT in cookie
   ├── Response: user object if authenticated
   └── Used for session verification
   ```

3. **Auth Middleware**
   ```javascript
   // Middleware Flow
   auth = async (req, res, next) => {
     1. Extract token from:
        - HTTP-only cookie
        - Authorization header (Bearer token)
     
     2. Verify token:
        - Check token existence
        - Validate JWT signature
        - Extract userId
     
     3. Load user:
        - Find user by ID
        - Exclude password field
        - Attach to request
     
     4. Error responses:
        401 - No token: AUTH_NO_TOKEN
        401 - Invalid token: AUTH_INVALID_TOKEN
        401 - User not found: AUTH_USER_NOT_FOUND
   }
   ```

4. **CORS Configuration**
   ```javascript
   // Development
   cors({
     origin: 'http://localhost:5173',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
   });

   // Production
   cors({
     origin: process.env.CLIENT_URL,
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
   });
   ```

5. **Client-Side Integration**
   ```javascript
   // API Client Configuration
   const client = axios.create({
     baseURL: `${API_URL}/api`,
     withCredentials: true,
     headers: {
       'Content-Type': 'application/json'
     }
   });

   // Auth Context Flow
   AuthContext = {
     1. Initial Load:
        - Check if not on auth page
        - Call checkAuthStatus()
        - Set user if authenticated
     
     2. Login/Google Login:
        - Send credentials
        - Receive user data
        - Cookie set by server
        - Update context state
     
     3. Logout:
        - Call logout endpoint
        - Clear cookie on server
        - Clear local state
        - Redirect to auth page
   }
   ```

6. **Error Handling**
   ```javascript
   // Standardized Error Format
   {
     error: {
       message: String,  // User-friendly message
       code: String      // Error code for client handling
     }
   }

   // Error Codes
   AUTH_NO_TOKEN        // No token provided
   AUTH_INVALID_TOKEN   // Token validation failed
   AUTH_USER_NOT_FOUND  // User not found
   LOGIN_FAILED         // Login attempt failed
   GOOGLE_AUTH_FAILED   // Google authentication failed
   LOGOUT_FAILED        // Logout operation failed
   ```

7. **Security Considerations**
   - JWT stored in HTTP-only cookies
   - CORS configured for specific origins
   - Credentials required for cross-origin requests
   - Token expiration set to 7 days
   - Password never returned to client
   - Secure cookie in production
   - SameSite cookie policy
