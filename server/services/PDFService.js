import PDFParser from 'pdf2json';
import ContentPlanner from '../models/ContentPlanner.js';
import Account from '../models/Account.js';
import { ApiError } from '../utils/ApiError.js';

const cleanPDFText = (text) => {
  return text
    // Decode URI encoded characters
    .replace(/%20/g, ' ')
    .replace(/%2C/g, ',')
    .replace(/%0A/g, '\n')
    .replace(/%09/g, '\t')
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

  // Check minimum PDF file size (at least 100 bytes for a valid PDF)
  if (buffer.length < 100) {
    throw new ApiError(400, 'PDF file is too small to be valid');
  }

  // Check if the file starts with the PDF magic number (%PDF-)
  const pdfHeader = buffer.toString('ascii', 0, 5);
  if (pdfHeader !== '%PDF-') {
    throw new ApiError(400, 'Invalid PDF file format');
  }
};

export const parsePDF = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate PDF buffer before parsing
      validatePDFBuffer(buffer);

      const pdfParser = new PDFParser();

      // Handle parsing errors
      pdfParser.on('pdfParser_dataError', errData => {
        console.error('PDF parsing error:', errData.parserError);
        reject(new ApiError(400, 'Unable to parse PDF. The file might be corrupted or password protected.'));
      });

      // Handle successful parsing
      pdfParser.on('pdfParser_dataReady', pdfData => {
        try {
          // Extract text from all pages
          const text = pdfData.Pages
            .map(page => 
              page.Texts
                .map(text => decodeURIComponent(text.R[0].T))
                .join(' ')
            )
            .join('\n');

          const cleanedText = cleanPDFText(text);

          if (!cleanedText || cleanedText.length === 0) {
            reject(new ApiError(400, 'No readable text found in PDF'));
            return;
          }

          resolve(cleanedText);
        } catch (error) {
          console.error('Error processing PDF content:', error);
          reject(new ApiError(400, 'Error processing PDF content. Please try a different PDF.'));
        }
      });

      // Start parsing
      pdfParser.parseBuffer(buffer);

    } catch (error) {
      console.error('Error in PDF parsing:', error);
      reject(new ApiError(400, 'Failed to process PDF. Please ensure the file is not corrupted.'));
    }
  });
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