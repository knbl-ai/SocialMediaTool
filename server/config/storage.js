import { Storage } from '@google-cloud/storage';

if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_BUCKET_NAME) {
  throw new Error('Google Cloud credentials not properly configured. Please check your .env file.');
}

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

export const uploadImage = async (input) => {
  if (!input) {
    throw new Error('No input provided');
  }

  try {
    let fileName;
    let buffer;
    let contentType;

    // Handle both file upload from form and direct buffer upload
    if (input.buffer) {
      // Direct buffer upload
      buffer = input.buffer;
      
      // Get file extension from original filename or default to .jpg
      const fileExtension = input.originalname 
        ? '.' + input.originalname.split('.').pop().toLowerCase() 
        : '.jpg';
      
      // Create standardized filename with timestamp
      fileName = `accounts/${Date.now()}-iGentityUploadFile${fileExtension}`;
      contentType = input.mimetype;
    } else {
      // Form upload
      buffer = input.buffer;
      
      // Get file extension from original filename or default to .jpg
      const fileExtension = input.originalname 
        ? '.' + input.originalname.split('.').pop().toLowerCase() 
        : '.jpg';
      
      // Create standardized filename with timestamp
      fileName = `accounts/${Date.now()}-iGentityUploadFile${fileExtension}`;
      contentType = input.mimetype;
    }

    console.log(`Uploading file with standardized name: ${fileName}`);

    const file = bucket.file(fileName);

    // Create write stream
    const stream = file.createWriteStream({
      metadata: {
        contentType: contentType,
      },
      public: true,
      resumable: false
    });

    // Handle stream events
    await new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });

      stream.on('finish', () => {
        resolve();
      });

      // Write buffer to stream
      stream.end(buffer);
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const deleteFile = async (fileUrl) => {
  try {
    // Only handle Google Cloud Storage URLs
    if (!fileUrl?.startsWith(`https://storage.googleapis.com/${bucketName}/`)) {
      console.log(`Skipping deletion of non-GCS file: ${fileUrl}`);
      return true;
    }

    // Extract filename from URL
    const url = new URL(fileUrl);
    // Remove leading slash and get full path after bucket name
    const filePath = decodeURIComponent(url.pathname.split(`/${bucketName}/`)[1]);
    
    if (!filePath) {
      console.error(`Invalid file URL format: ${fileUrl}`);
      return false;
    }
    
    // Delete the file
    await bucket.file(filePath).delete();
    console.log(`Successfully deleted file: ${filePath}`);
    return true;
  } catch (error) {
    // If file doesn't exist, consider it a success case
    if (error.code === 404) {
      console.log(`File already deleted or doesn't exist: ${fileUrl}`);
      return true;
    }
    // For other errors, log and return false
    console.error(`Error deleting file ${fileUrl}:`, error);
    return false;
  }
};

export const deleteFiles = async (fileUrls) => {
  if (!Array.isArray(fileUrls) || fileUrls.length === 0) return;

  // Filter out non-GCS URLs
  const gcsUrls = fileUrls.filter(url => url?.startsWith(`https://storage.googleapis.com/${bucketName}/`));
  
  if (gcsUrls.length === 0) {
    console.log('No GCS files to delete');
    return [];
  }

  const results = await Promise.all(
    gcsUrls.map(async (url) => {
      const success = await deleteFile(url);
      return { url, success };
    })
  );

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.error('Some files failed to delete:', failed);
  }

  return results;
};

export default storage;
