import { google } from 'googleapis';
import { ApiError } from '../utils/ApiError.js';
import ContentPlanner from '../models/ContentPlanner.js';

// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_CLOUD_PROJECT_ID',
  'GOOGLE_CLOUD_PRIVATE_KEY',
  'GOOGLE_CLOUD_CLIENT_EMAIL',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1); // Stop the server if credentials are missing
}

// Initialize Google Docs API
const docs = google.docs('v1');
const sheets = google.sheets('v4');

// Initialize auth client with specific credentials
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  },
  scopes: [
    'https://www.googleapis.com/auth/documents.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly'
  ]
});

// Validate auth client on startup
(async () => {
  try {
    await auth.getClient();
    console.log('Google Auth credentials validated successfully');
  } catch (error) {
    console.error('Failed to validate Google Auth credentials:', error);
    process.exit(1); // Stop the server if credentials are invalid
  }
})();

const isValidGoogleUrl = (url) => {
  if (!url) {
    throw new ApiError(400, 'URL is required');
  }
  
  try {
    const urlObj = new URL(url);
    const isValidDomain = (
      urlObj.hostname === 'docs.google.com' || 
      urlObj.hostname === 'drive.google.com'
    );
    const hasDocId = url.includes('/d/');
    const isValidProtocol = urlObj.protocol === 'https:';

    if (!isValidDomain) {
      throw new ApiError(400, 'Invalid domain. URL must be from docs.google.com or drive.google.com');
    }
    if (!hasDocId) {
      throw new ApiError(400, 'Invalid URL format. Missing document ID');
    }
    if (!isValidProtocol) {
      throw new ApiError(400, 'Invalid protocol. URL must use HTTPS');
    }

    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError(400, 'Invalid URL format. Please provide a valid Google Docs URL');
    }
    throw new ApiError(400, 'Invalid URL format');
  }
};

const extractDocId = (url) => {
  try {
    // Handle both docs.google.com and drive.google.com URLs
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new ApiError(400, 'Could not extract document ID from URL');
    }
    return match[1];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, 'Invalid document ID format');
  }
};

const cleanText = (text) => {
  if (!text || typeof text !== 'string') {
    throw new ApiError(500, 'Invalid text content received from document');
  }

  return text
    // Remove multiple line breaks and replace with single line break
    .replace(/\n{3,}/g, '\n\n')
    // Remove multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Remove spaces at the start of lines
    .replace(/^\s+/gm, '')
    // Trim the entire text
    .trim();
};

export const parseGoogleDoc = async (url) => {
  try {
    // Validate URL format
    isValidGoogleUrl(url);

    // Extract and validate document ID
    const docId = extractDocId(url);

    // Get auth client
    let authClient;
    try {
      authClient = await auth.getClient();
      google.options({ auth: authClient });
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new ApiError(500, 'Failed to authenticate with Google services');
    }

    // Detect if it's a document or spreadsheet based on the URL
    if (url.includes('document')) {
      try {
        // Handle Google Doc
        const { data } = await docs.documents.get({
          documentId: docId
        }).catch(error => {
          if (error.code === 404) {
            throw new ApiError(404, 'Document not found. Please check the URL');
          }
          if (error.code === 403) {
            throw new ApiError(403, 'Access denied. Make sure the document is accessible (Anyone with the link can view)');
          }
          throw new ApiError(500, 'Failed to fetch document');
        });

        if (!data?.body?.content) {
          throw new ApiError(404, 'No content found in the document. Make sure the document is accessible (Anyone with the link can view)');
        }

        // Extract text content from the document
        let text = '';
        data.body.content.forEach(item => {
          if (item.paragraph) {
            item.paragraph.elements.forEach(element => {
              if (element.textRun) {
                text += element.textRun.content;
              }
            });
          }
        });

        return cleanText(text);
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError(500, 'Failed to process document');
      }
    } else if (url.includes('spreadsheet')) {
      try {
        // Handle Google Spreadsheet
        const { data } = await sheets.spreadsheets.values.get({
          spreadsheetId: docId,
          range: 'A1:Z1000' // Adjust range as needed
        }).catch(error => {
          if (error.code === 404) {
            throw new ApiError(404, 'Spreadsheet not found. Please check the URL');
          }
          if (error.code === 403) {
            throw new ApiError(403, 'Access denied. Make sure the spreadsheet is accessible (Anyone with the link can view)');
          }
          throw new ApiError(500, 'Failed to fetch spreadsheet');
        });

        if (!data?.values || data.values.length === 0) {
          throw new ApiError(404, 'No content found in the spreadsheet. Make sure the spreadsheet is accessible (Anyone with the link can view)');
        }

        // Convert spreadsheet data to text
        const text = data.values
          .map(row => row.filter(cell => cell).join(' ')) // Filter out empty cells
          .filter(line => line.trim()) // Filter out empty lines
          .join('\n');

        return cleanText(text);
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError(500, 'Failed to process spreadsheet');
      }
    }

    throw new ApiError(400, 'Unsupported Google Doc type. Only Google Docs and Sheets are supported');
  } catch (error) {
    console.error('Error parsing Google Doc:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to parse Google Doc');
  }
};

export const saveGoogleDocContent = async (accountId, text) => {
  if (!accountId) {
    throw new ApiError(400, 'Account ID is required');
  }

  if (!text || typeof text !== 'string') {
    throw new ApiError(400, 'Valid text content is required');
  }

  try {
    // Find and update the content planner
    const updatedPlanner = await ContentPlanner.findOneAndUpdate(
      { accountId },
      { textGuidelines: text },
      { new: true }
    );

    if (!updatedPlanner) {
      throw new ApiError(404, 'Content planner not found');
    }

    return updatedPlanner;
  } catch (error) {
    console.error('Error saving Google Doc content:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to save content to database');
  }
}; 