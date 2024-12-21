# Social Media Tool

A comprehensive social media management platform built with modern web technologies.

## Overview
Social Media Tool is a comprehensive web application designed to streamline social media content creation, scheduling, and management across multiple platforms.

## Tech Stack

### Frontend
- **Framework**: React (v18.3.1)
- **Routing**: React Router (v7.0.2)
- **State Management**: React Hooks
- **UI Libraries**: 
  - Shadcn UI
  - Radix UI Components
- **Styling**: 
  - Tailwind CSS
  - CSS Modules
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Authentication**: @react-oauth/google

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Google OAuth
- **File Upload**: Multer

## Project Structure

### Client (`/client`)
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   ├── editPost/        # Post editing related components
│   └── ...             # Feature-specific components
├── context/             # React Context providers
│   └── AuthContext.jsx  # Authentication state management
├── pages/               # Route-level components
├── services/           # API service layer
└── utils/              # Utility functions
```

### Server (`/server`)
```
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Express middleware
├── models/            # Mongoose models
├── routes/            # API routes
└── utils/             # Utility functions
```

## Authentication Flow

1. **Client-Side**:
   - Uses `AuthContext` for global auth state management
   - Implements Google OAuth for social login
   - Stores JWT in HTTP-only cookies
   - Auto-verifies token on app load

2. **Server-Side**:
   - JWT-based authentication
   - Token verification middleware
   - Secure cookie handling
   - Google OAuth verification

## Component Architecture

### Core Components

1. **Account Management**:
   - `AccountCard.jsx`: Display account information
   - `AccountName.jsx`: Edit account details
   - `AccountOverview.jsx`: Account statistics
   - `AccountTemplates.jsx`: Template management

2. **Post Management**:
   - `EditPostResponsive.jsx`: Main post editor
   - `PostsDashboard.jsx`: Posts overview
   - `PlatformSelector.jsx`: Social platform selection

3. **UI Components**:
   - Located in `/components/ui`
   - Shadcn UI integration
   - Custom styled components

## API Routes

### Authentication Routes (`/api/auth`)
- POST `/login`: User login
- POST `/register`: User registration
- GET `/verify`: Token verification
- POST `/logout`: User logout

### Account Routes (`/api/accounts`)
- GET `/`: List all accounts
- POST `/`: Create new account
- GET `/:id`: Get account details
- PATCH `/:id`: Update account
- DELETE `/:id`: Delete account
- POST `/:id/logo`: Upload account logo

## Development Guidelines

1. **Adding New Features**:
   - Create components in appropriate directories
   - Use existing UI components from `/components/ui`
   - Follow established naming conventions
   - Implement proper error handling

2. **State Management**:
   - Use React Context for global state
   - Utilize hooks for component-level state
   - Follow established patterns in `AuthContext`

3. **API Integration**:
   - Add new routes in appropriate route files
   - Implement controllers with proper error handling
   - Use authentication middleware where needed
   - Follow RESTful conventions

4. **Styling**:
   - Use Tailwind CSS for styling
   - Follow existing component patterns
   - Maintain responsive design principles

## Security Considerations

1. **Authentication**:
   - HTTP-only cookies for JWT
   - Server-side token verification
   - Protected routes implementation

2. **API Security**:
   - Input validation
   - CORS configuration
   - Rate limiting
   - Error handling

## Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance
- Google Cloud Project (for OAuth and Cloud Storage)

## Installation

### Clone the Repository
```bash
git clone https://github.com/yourusername/social-media-tool.git
cd social-media-tool
```

### Setup Backend
```bash
cd server
npm install
cp .env.example .env  # Configure environment variables
```

### Setup Frontend
```bash
cd ../client
npm install
```

## Environment Variables
Create `.env` files in both `server` and `client` directories with the following key variables:

### Server `.env`
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

### Client `.env`
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID for frontend

## Running the Application

### Development Mode
```bash
# Start Backend (from server directory)
npm run dev

# Start Frontend (from client directory)
npm run dev
```

### Production Build
```bash
# Build Frontend
cd client
npm run build

# Start Backend
cd ../server
npm start
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Contact
Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/social-media-tool](https://github.com/yourusername/social-media-tool)
