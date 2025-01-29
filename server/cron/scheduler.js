import cron from 'node-cron';
import postingService from '../services/postingService.js';

// Schedule the job to run at the start of every hour
const initScheduler = () => {
  console.log('Initializing post scheduler');

  
  // Run at minute 0 of every hour (e.g., 1:00, 2:00, 3:00)
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled post check');
    console.log('Container time:', new Date());
    console.log('UTC time:', new Date().toUTCString());
    console.log('Time zone offset:', new Date().getTimezoneOffset());
    try {
      const result = await postingService.postScheduled();
      console.log('Scheduled posts processed:', {
        processed: result.processed,
        successful: result.results.length,
        failed: result.errors.length
      });
    } catch (error) {
      console.error('Error in post scheduler:', error);
    }
  });

  // Optional: Run immediately on startup to catch any missed posts
  postingService.postScheduled().catch(error => {
    console.error('Error in initial post check:', error);
  });
};

export default initScheduler; 