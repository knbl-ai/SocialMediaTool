import 'dotenv/config';
import mongoose from 'mongoose';
import AuthorizedUser from '../models/AuthorizedUser.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addAuthorizedUsers = async (emails) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const email of emails) {
      try {
        const authorizedUser = await AuthorizedUser.findOne({ email: email.toLowerCase() });
        
        if (authorizedUser) {
          if (authorizedUser.status === 'inactive') {
            // Reactivate if inactive
            authorizedUser.status = 'active';
            await authorizedUser.save();
            console.log(`✅ Reactivated user: ${email}`);
          } else {
            console.log(`⚠️ User already authorized: ${email}`);
          }
        } else {
          // Create new authorized user
          await AuthorizedUser.create({
            email: email.toLowerCase(),
            status: 'active'
          });
          console.log(`✅ Added new authorized user: ${email}`);
        }
      } catch (error) {
        console.error(`❌ Error processing email ${email}:`, error.message);
      }
    }

    console.log('\nAuthorization process completed!');
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Check if emails are provided as command line arguments
const emails = process.argv.slice(2);

if (emails.length === 0) {
  console.log(`
Usage: 
  Single email:    npm run auth-user user@example.com
  Multiple emails: npm run auth-user user1@example.com user2@example.com
  From file:       npm run auth-user -- --file emails.txt

The emails.txt file should contain one email per line.
`);
  process.exit(1);
}

// Check if using file input
if (emails[0] === '--file') {
  const filePath = emails[1];
  if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
  }

  // Read emails from file
  try {
    const fileContent = await fs.readFile(path.resolve(process.cwd(), filePath), 'utf8');
    const emailsFromFile = fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes('@')); // Basic email validation

    if (emailsFromFile.length === 0) {
      console.error('No valid emails found in file');
      process.exit(1);
    }

    await addAuthorizedUsers(emailsFromFile);
  } catch (error) {
    console.error('Error reading file:', error.message);
    process.exit(1);
  }
} else {
  // Process emails from command line arguments
  await addAuthorizedUsers(emails);
} 