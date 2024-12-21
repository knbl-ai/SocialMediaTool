# Social Media Tool

A comprehensive social media management platform built with modern web technologies.

## Overview
Social Media Tool is a comprehensive web application designed to streamline social media content creation, scheduling, and management across multiple platforms.

## Application Structure

### Frontend (`/client`)
```
client/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── editPost/        # Post editing components
│   │   └── *.jsx            # Feature components
│   ├── context/             # React Context providers
│   ├── pages/               # Route components
│   ├── services/            # API services
│   ├── config/              # Configuration
│   └── lib/                 # Utilities
```

### Backend (`/server`)
```
server/
├── config/                  # App configuration
├── controllers/             # Route controllers
├── middleware/              # Express middleware
├── models/                  # Mongoose models
├── routes/                  # API routes
├── services/               # Business logic services
└── utils/                  # Utility functions
```

## Tech Stack

### Frontend
- React + Vite
- React Router for routing
- Shadcn UI + Tailwind CSS for styling
- Axios for HTTP requests
- Google OAuth for authentication

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Image processing services
- LLM integration

## Core Features
- Multi-platform social media management
- Post scheduling and templating
- Account management
- Image and text content generation
- Authentication with Google OAuth

## Identified Issues and Recommended Improvements

### Code Structure Issues

1. **Inconsistent API Error Handling**
   - Current: Inconsistent error response formats across controllers
   - Recommendation: Implement a centralized error handling middleware
   ```javascript
   // Create: server/middleware/errorHandler.js
   const errorHandler = (err, req, res, next) => {
     res.status(err.status || 500).json({
       error: {
         message: err.message,
         code: err.code,
         status: err.status
       }
     });
   };
   ```

2. **Authentication Token Management**
   - Current: Mixed usage of localStorage and cookies
   - Recommendation: Standardize to HTTP-only cookies for security

3. **Frontend State Management**
   - Current: Prop drilling in some components
   - Recommendation: Implement React Query for server state management

4. **API Service Layer**
   - Current: Direct axios calls in components
   - Recommendation: Centralize API calls in service files

### Security Improvements

1. **Input Validation**
   - Add request validation middleware using Joi or Zod
   - Implement consistent sanitization

2. **Rate Limiting**
   - Add rate limiting for API endpoints
   - Implement request throttling

3. **Environment Variables**
   - Current: Some hardcoded configuration
   - Recommendation: Move all config to environment variables

### Performance Optimizations

1. **Image Optimization**
   - Implement image compression
   - Add lazy loading for images
   - Use WebP format with fallbacks

2. **Code Splitting**
   - Implement React.lazy for route-based code splitting
   - Optimize bundle size

3. **Caching Strategy**
   - Implement Redis for API caching
   - Add service worker for offline support

### Code Quality Improvements

1. **TypeScript Migration**
   - Current: JavaScript with JSDoc comments
   - Recommendation: Gradually migrate to TypeScript

2. **Testing**
   - Add unit tests for utilities
   - Implement integration tests for API endpoints
   - Add E2E tests for critical flows

3. **Documentation**
   - Add JSDoc comments for all functions
   - Create API documentation using Swagger
   - Add component documentation using Storybook

## Development Setup

### Prerequisites
- Node.js (v16+)
- MongoDB
- Google OAuth credentials

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd social-media-tool
```

2. Install dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. Environment setup
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend (.env)
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start development servers
```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License
