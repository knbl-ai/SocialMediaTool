import { google } from 'googleapis';
import { ApiError } from '../utils/ApiError.js';
import ContentPlanner from '../models/ContentPlanner.js';

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
    client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
  },
  scopes: [
    'https://www.googleapis.com/auth/documents.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly'
  ]
});

const isValidGoogleUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === 'docs.google.com' || 
      urlObj.hostname === 'drive.google.com'
    ) && url.includes('/d/');
  } catch {
    return false;
  }
};

const extractDocId = (url) => {
  try {
    // Handle both docs.google.com and drive.google.com URLs
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

const cleanText = (text) => {
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
    if (!isValidGoogleUrl(url)) {
      throw new ApiError(400, 'Invalid Google Doc URL. Please provide a valid Google Docs or Sheets URL');
    }

    const docId = extractDocId(url);
    if (!docId) {
      throw new ApiError(400, 'Could not extract document ID from URL');
    }

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    // Detect if it's a document or spreadsheet based on the URL
    if (url.includes('document')) {
      // Handle Google Doc
      const { data } = await docs.documents.get({
        documentId: docId
      });

      if (!data.body?.content) {
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
    } else if (url.includes('spreadsheet')) {
      // Handle Google Spreadsheet
      const { data } = await sheets.spreadsheets.values.get({
        spreadsheetId: docId,
        range: 'A1:Z1000' // Adjust range as needed
      });

      if (!data.values || data.values.length === 0) {
        throw new ApiError(404, 'No content found in the spreadsheet. Make sure the spreadsheet is accessible (Anyone with the link can view)');
      }

      // Convert spreadsheet data to text
      const text = data.values
        .map(row => row.join(' '))
        .join('\n');

      return cleanText(text);
    }

    throw new ApiError(400, 'Unsupported Google Doc type. Only Google Docs and Sheets are supported');
  } catch (error) {
    console.error('Error parsing Google Doc:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.code === 403) {
      throw new ApiError(403, 'Access denied. Make sure the document is accessible (Anyone with the link can view)');
    }
    throw new ApiError(500, 'Failed to parse Google Doc');
  }
};

export const saveGoogleDocContent = async (accountId, text) => {
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
    throw error;
  }
}; 