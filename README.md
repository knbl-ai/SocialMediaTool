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
│   ├── lib/              # Utilities and API client
│   ├── pages/            # Route components
│   └── services/         # API service layers
```

### Key Components

1. **State Management**
   - `AuthContext`: Manages authentication state and user sessions
     - Handles Google OAuth login/logout
     - Maintains user session state
     - Provides user information to components

   - `PlatformContext`: Manages selected social media platforms
     - Stores platform selection per account
     - Provides platform switching functionality
     - Maintains platform state across components

   - Custom hooks:
     - `useAccounts`: Account management operations
       ```javascript
       const { 
         accounts,        // List of user accounts
         loading,        // Loading state
         error,         // Error state
         createAccount,  // Create new account
         updateAccount,  // Update existing account
         deleteAccount   // Delete account
       } = useAccounts();
       ```
       Used in:
       - Main.jsx: Account listing and management
       - AccountDashboard.jsx: Account details and settings

     - `usePosts`: Post management and calendar operations
       ```javascript
       const {
         loading,        // Loading state
         error,         // Error state
         fetchPosts,    // Fetch posts for date range
         getPostsByDate, // Get posts for specific date
         clearError     // Clear error state
       } = usePosts(accountId);
       ```
       Used in:
       - PostsDashboard.jsx: Calendar view and post management
       - DayCell.jsx: Individual day post management

2. **API Integration**
   - `lib/api.js`: Centralized API client with:
     - Axios instance configuration
     - Error handling interceptors
     - Authentication handling
     - Endpoint methods for all API operations

3. **Main Features**
   - `PostsDashboard`: Calendar view for post management
   - `EditPostResponsive`: Post editor with platform-specific settings
   - `AccountDashboard`: Account management interface

4. **Data Flow**
   ```
   User Action → Component → Custom Hook → API Client → Backend
        ↑          ↓            ↓            ↑
   UI Update ← State Update ← Response ← API Response
   ```

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
MONGODB_URI=mongodb://localhost/social-media-tool
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

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

4. **Error Handling**
   - Use ApiError for backend errors
   - Implement proper validation
   - Show user-friendly messages
   - Log errors properly

This documentation serves as a reference for understanding the application's architecture and implementing new features. It provides context about data flow, component relationships, and best practices for maintaining and extending the codebase.
