import { testTwitterService } from '../services/twitterService.js';

console.log('Starting Twitter service test...');

testTwitterService()
  .then(result => {
    console.log('Test completed successfully:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 