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

export const uploadImage = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    const fileName = `accounts/${Date.now()}-${file.originalname}`;
    const fileOptions = {
      destination: fileName,
      metadata: {
        contentType: file.mimetype,
      },
      public: true
    };

    await bucket.file(fileName).save(file.buffer, {
      contentType: file.mimetype,
      public: true
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
    // Extract filename from URL
    const url = new URL(fileUrl);
    const fileName = url.pathname.split('/').pop();
    
    // Delete the file
    await bucket.file(fileName).delete();
    console.log(`Successfully deleted file: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileUrl}:`, error);
    return false;
  }
};

export const deleteFiles = async (fileUrls) => {
  if (!Array.isArray(fileUrls) || fileUrls.length === 0) return;

  const results = await Promise.all(
    fileUrls.map(async (url) => {
      try {
        await deleteFile(url);
        return { url, success: true };
      } catch (error) {
        return { url, success: false, error };
      }
    })
  );

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.error('Some files failed to delete:', failed);
  }

  return results;
};

export default storage;
