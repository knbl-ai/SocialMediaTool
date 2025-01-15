import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import ContentPlanner from '../models/ContentPlanner.js';
import { ApiError } from '../utils/ApiError.js';

const cleanPDFText = (text) => {
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

export const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return cleanPDFText(data.text);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new ApiError(500, 'Failed to parse PDF file');
  }
};

export const savePDFContent = async (accountId, pdfText) => {
  try {
    // Find and update the content planner
    const updatedPlanner = await ContentPlanner.findOneAndUpdate(
      { accountId },
      { textGuidelines: pdfText },
      { new: true }
    );

    if (!updatedPlanner) {
      throw new ApiError(404, 'Content planner not found');
    }

    return updatedPlanner;
  } catch (error) {
    console.error('Error saving PDF content:', error);
    throw error;
  }
}; 