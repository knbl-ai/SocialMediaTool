# LinkedIn Profile and Post Scraper

A Node.js application that uses Playwright to scrape LinkedIn profiles and posts. This application provides an API endpoint to scrape a LinkedIn profile (either personal or company) and return profile information along with the latest 20 posts.

## Features

- Scrapes both personal and company LinkedIn profiles
- Extracts profile information (name, title/industry, location, etc.)
- Collects the latest 20 posts with engagement metrics and media URLs
- Smart authentication with cookie persistence (only logs in when necessary)
- **Improved browser reuse** - connects to existing browser instances between app restarts
- Exposes an API for easy integration with other applications

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A valid LinkedIn account

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Configure your environment variables by renaming `.env.example` to `.env` and filling in your LinkedIn credentials:

```
PORT=3000
LINKEDIN_EMAIL=your_linkedin_email@example.com
LINKEDIN_PASSWORD=your_linkedin_password
COOKIES_PATH=./cookies.json
```

## Usage

1. Start the server:

```bash
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

2. Use the API endpoint to scrape a LinkedIn profile:

```bash
curl -X POST http://localhost:3000/api/linkedin/scrape \
  -H "Content-Type: application/json" \
  -d '{"linkedinUrl": "https://www.linkedin.com/in/username/"}'
```

Or for a company profile:

```bash
curl -X POST http://localhost:3000/api/linkedin/scrape \
  -H "Content-Type: application/json" \
  -d '{"linkedinUrl": "https://www.linkedin.com/company/companyname/"}'
```

## API Endpoints

### `POST /api/linkedin/scrape`

Scrapes a LinkedIn profile and returns profile information and recent posts.

**Request Body:**

```json
{
  "linkedinUrl": "https://www.linkedin.com/in/username/"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "profileInfo": { /* Profile information */ },
    "posts": [
      {
        "text": "Post content",
        "timestamp": "2h",
        "likes": "42",
        "comments": "5",
        "hasMedia": true,
        "mediaType": "image",
        "mediaUrl": "https://media.linkedin.com/...",
        "thumbnailUrl": null,
        "allMediaUrls": {
          "images": ["https://media.linkedin.com/..."],
          "videos": null,
          "backgroundImages": null,
          "externalVideos": null
        }
      }
    ]
  }
}
```

### `GET /api/linkedin/status`

Checks the status of the LinkedIn scraper.

**Response:**

```json
{
  "success": true,
  "isInitialized": true,
  "isLoggedIn": true
}
```

### `GET /api/linkedin/browser-status`

Checks if a browser is already running and can be connected to.

**Response:**

```json
{
  "success": true,
  "browserRunning": true,
  "message": "Browser is running and accessible"
}
```

### `POST /api/linkedin/initialize`

Manually initializes the LinkedIn scraper (typically not needed as this happens automatically).

**Response:**

```json
{
  "success": true,
  "message": "LinkedIn scraper initialized successfully"
}
```

### `POST /api/linkedin/close`

Closes the current page and context but keeps the browser instance running for reuse.

**Response:**

```json
{
  "success": true,
  "message": "LinkedIn scraper closed successfully"
}
```

### `POST /api/linkedin/force-close`

Completely closes the browser instance (use this when you're done with the scraper).

**Response:**

```json
{
  "success": true,
  "message": "LinkedIn browser instance completely closed"
}
```

### `POST /api/linkedin/launch-browser`

Explicitly launches a new browser instance. This is useful for debugging or when you want to force a new browser to be created.

**Response:**

```json
{
  "success": true,
  "message": "New browser launched successfully",
  "wsEndpoint": "ws://127.0.0.1:12345/devtools/browser/abcdef123456"
}
```

### `GET /api/linkedin/browser-debug`

Gets detailed debug information about the current browser state. This is useful for troubleshooting browser reuse issues.

**Response:**

```json
{
  "success": true,
  "browserInfo": {
    "isInitialized": true,
    "isLoggedIn": true,
    "savedWsEndpoint": "ws://127.0.0.1:12345/devtools/browser/abcdef123456",
    "globalBrowser": {
      "connected": true,
      "wsEndpoint": "ws://127.0.0.1:12345/devtools/browser/abcdef123456"
    },
    "lastInitializeAttempt": "2023-06-01T12:34:56.789Z",
    "initializeInProgress": false
  }
}
```

### `POST /api/linkedin/cleanup-browser`

Checks and cleans up browser resources, including stale lock files and WebSocket endpoint files. This is useful for recovering from error states or when browser reuse is not working correctly.

**Response:**

```json
{
  "success": true,
  "message": "Browser resources checked and cleaned up",
  "isInitialized": false,
  "initializeInProgress": false,
  "lastInitializeAttempt": "2023-06-01T12:34:56.789Z"
}
```

## Browser Reuse

The application is designed to reuse the browser instance between requests and even between application restarts:

1. The first request launches a new browser and saves its WebSocket endpoint
2. Subsequent requests will reuse the existing browser
3. If the application is restarted, it will try to connect to the previously launched browser
4. Use the `/api/linkedin/browser-status` endpoint to check if a browser is already running
5. Use the `/api/linkedin/close` endpoint to close the current page but keep the browser running
6. Use the `/api/linkedin/force-close` endpoint when you're completely done with the scraper

## Troubleshooting Browser Reuse

If you're experiencing issues with browser reuse (e.g., new browsers being launched when they shouldn't be), try the following steps:

1. Check the browser status using `GET /api/linkedin/browser-debug` to see if a browser is already running
2. Clean up any stale resources using `POST /api/linkedin/cleanup-browser`
3. Force close any existing browsers using `POST /api/linkedin/force-close`
4. Launch a new browser explicitly using `POST /api/linkedin/launch-browser`
5. Check for any lock files (`.browser-lock`) or WebSocket endpoint files (`.browser-ws-endpoint.txt`) in the project directory and delete them if the application is not running

Common issues:

- **Multiple browser instances**: This can happen if the application crashes without properly cleaning up. Use the cleanup endpoint to resolve this.
- **Stale WebSocket endpoint**: If the browser was closed externally but the WebSocket endpoint file still exists, the application might try to connect to a non-existent browser. Use the cleanup endpoint to remove stale files.
- **Stuck initialization**: If the application gets stuck during initialization, use the cleanup endpoint to reset the initialization flags.

For persistent issues, try restarting the application after cleaning up all browser resources.

## Important Notes

- When first running the application, the browser will be launched in visible mode for authentication
- LinkedIn's UI changes frequently, so selectors may need to be updated over time
- Excessive scraping may lead to LinkedIn temporarily blocking your account, use responsibly
- This application is intended for educational purposes only
- If you encounter security checkpoints, you'll need to solve them manually in the browser window

## License

MIT # SM_Scraper
