import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import ContentPlanner from '../models/ContentPlanner.js';
import Account from '../models/Account.js';
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

const validatePDFBuffer = (buffer) => {
  // Check if buffer exists and has content
  if (!buffer || buffer.length === 0) {
    throw new ApiError(400, 'Empty PDF file');
  }

  // Check if the file starts with the PDF magic number (%PDF-)
  const pdfHeader = buffer.toString('ascii', 0, 5);
  if (pdfHeader !== '%PDF-') {
    throw new ApiError(400, 'Invalid PDF file format');
  }
};

export const parsePDF = async (buffer) => {
  try {
    // Validate PDF buffer before parsing
    validatePDFBuffer(buffer);

    const options = {
      max: 2, // Maximum pages to parse (adjust as needed)
      version: 'v2.0.550'  // Use a specific version of pdf.js
    };

    const data = await pdfParse(buffer, options);
    
    if (!data || !data.text) {
      throw new ApiError(500, 'Failed to extract text from PDF');
    }

    const cleanedText = cleanPDFText(data.text);
    
    if (!cleanedText || cleanedText.length === 0) {
      throw new ApiError(400, 'No readable text found in PDF');
    }

    return cleanedText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    // Handle specific PDF parsing errors
    if (error.message?.includes('bad XRef entry')) {
      throw new ApiError(400, 'PDF file is corrupted or invalid');
    }
    if (error.message?.includes('no PDF header found')) {
      throw new ApiError(400, 'Invalid PDF file format');
    }
    
    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Generic error
    throw new ApiError(500, 'Failed to process PDF file: ' + error.message);
  }
};

export const savePDFContent = async (accountId, pdfText, isContentPlanner = true) => {
  try {
    if (isContentPlanner) {
      // Content planner flow - save to ContentPlanner
      const updatedPlanner = await ContentPlanner.findOneAndUpdate(
        { accountId },
        { textGuidelines: pdfText },
        { new: true }
      );

      if (!updatedPlanner) {
        throw new ApiError(404, 'Content planner not found');
      }

      return updatedPlanner;
    } else {
      // Account overview flow - save to Account
      const updatedAccount = await Account.findByIdAndUpdate(
        accountId,
        { accountReview: pdfText },
        { new: true }
      );

      if (!updatedAccount) {
        throw new ApiError(404, 'Account not found');
      }

      return updatedAccount;
    }
  } catch (error) {
    console.error('Error saving PDF content:', error);
    throw error;
  }
}; 