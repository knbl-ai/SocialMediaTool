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

export default storage;
