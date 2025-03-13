const express = require('express');
const router = express.Router();
const linkedInScraper = require('../services/linkedinScraper');
const { chromium } = require('playwright');
const fs = require('fs').promises;

// Initialize the LinkedIn scraper when needed
let isInitialized = false;
let initializeInProgress = false;
let lastInitializeAttempt = null;

const initializeScraperIfNeeded = async () => {
  try {
    // If initialization is already in progress, wait for it to finish
    if (initializeInProgress) {
      console.log('Initialization already in progress, waiting...');
      
      // Wait for up to 30 seconds for the current initialization to complete
      const startWait = Date.now();
      while (initializeInProgress && Date.now() - startWait < 30000) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // If it's still initializing after waiting, there's probably an issue
      if (initializeInProgress) {
        console.log('Waited too long for initialization. Possible hang.');
        initializeInProgress = false;
        return false;
      }
      
      return isInitialized;
    }
    
    // Don't try to initialize again if we've just tried recently (within last 30 seconds)
    // unless it wasn't successful
    if (isInitialized && lastInitializeAttempt && (Date.now() - lastInitializeAttempt < 30000)) {
      console.log('Using recent successful initialization');
      return true;
    }
    
    // Start initialization
    try {
      initializeInProgress = true;
      
      // First check if there's an existing browser we can connect to
      console.log('Checking for existing browser...');
      const browserExists = await linkedInScraper.checkExistingBrowser();
      
      if (browserExists) {
        console.log('Connected to existing browser, skipping full initialization');
        isInitialized = true;
        lastInitializeAttempt = Date.now();
        return true;
      }
      
      console.log('No existing browser found or connection failed, initializing LinkedIn scraper...');
      isInitialized = await linkedInScraper.initialize();
      lastInitializeAttempt = Date.now();
      console.log(`LinkedIn scraper initialization ${isInitialized ? 'successful' : 'failed'}`);
      return isInitialized;
    } finally {
      initializeInProgress = false;
    }
  } catch (error) {
    console.error('Error during scraper initialization:', error);
    initializeInProgress = false;
    return false;
  }
};

// Route to scrape a LinkedIn profile
router.post('/scrape', async (req, res) => {
  try {
    console.log('Received scrape request');
    const { linkedinUrl } = req.body;
    
    // Validate the LinkedIn URL
    if (!linkedinUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'LinkedIn URL is required' 
      });
    }
    
    // Check for valid LinkedIn URL format
    if (!linkedinUrl.includes('linkedin.com/in/') && 
        !linkedinUrl.includes('linkedin.com/company/')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid LinkedIn URL. Must be a personal profile (linkedin.com/in/...) or company profile (linkedin.com/company/...)' 
      });
    }

    console.log(`Processing request for LinkedIn URL: ${linkedinUrl}`);
    
    // Initialize the scraper if needed
    const isInitialized = await initializeScraperIfNeeded();
    if (!isInitialized) {
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize LinkedIn scraper. Please check browser and login functionality.'
      });
    }

    // Scrape the profile
    console.log('Starting profile scraping...');
    const profileData = await linkedInScraper.scrapeProfile(linkedinUrl);
    
    if (!profileData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to scrape LinkedIn profile. The page might require authentication or have a different structure.'
      });
    }

    console.log('Profile scraping completed successfully');
    return res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error in LinkedIn scraping route:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while scraping the LinkedIn profile'
    });
  }
});

// Route to check the status of the LinkedIn scraper
router.get('/status', async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      isInitialized,
      isLoggedIn: isInitialized ? linkedInScraper.isLoggedIn : false
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while checking scraper status'
    });
  }
});

// Route to manually initialize the LinkedIn scraper
router.post('/initialize', async (req, res) => {
  try {
    // Force re-initialization
    isInitialized = false;
    const initialized = await initializeScraperIfNeeded();
    
    return res.status(200).json({
      success: initialized,
      message: initialized ? 'LinkedIn scraper initialized successfully' : 'Failed to initialize LinkedIn scraper'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while initializing the LinkedIn scraper'
    });
  }
});

// Route to close the browser instance
router.post('/close', async (req, res) => {
  try {
    if (isInitialized) {
      await linkedInScraper.close();
      isInitialized = false;
    }
    
    return res.status(200).json({
      success: true,
      message: 'LinkedIn scraper closed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while closing the LinkedIn scraper'
    });
  }
});

// Route to force close the browser instance
router.post('/force-close', async (req, res) => {
  try {
    if (isInitialized) {
      await linkedInScraper.forceCloseBrowser();
      isInitialized = false;
    }
    
    return res.status(200).json({
      success: true,
      message: 'LinkedIn browser instance completely closed'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while force closing the LinkedIn browser'
    });
  }
});

// Route to check if a browser is already running
router.get('/browser-status', async (req, res) => {
  try {
    const browserExists = await linkedInScraper.checkExistingBrowser();
    
    return res.status(200).json({
      success: true,
      browserRunning: browserExists,
      message: browserExists ? 'Browser is running and accessible' : 'No running browser found'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while checking browser status'
    });
  }
});

// Route to force launch a new browser (useful for debugging)
router.post('/launch-browser', async (req, res) => {
  try {
    // Force close any existing browser first
    if (isInitialized) {
      await linkedInScraper.forceCloseBrowser();
      isInitialized = false;
    }
    
    // Launch a new browser
    console.log('Launching a new browser instance...');
    const browser = await chromium.launch({ 
      headless: false,
      args: ['--remote-debugging-port=0']
    });
    
    // Save the WebSocket endpoint
    const browserWSEndpoint = browser.wsEndpoint();
    await fs.writeFile('.browser-ws-endpoint.txt', browserWSEndpoint);
    
    return res.status(200).json({
      success: true,
      message: 'New browser launched successfully',
      wsEndpoint: browserWSEndpoint
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while launching a new browser'
    });
  }
});

// Route to get detailed browser debug information
router.get('/browser-debug', async (req, res) => {
  try {
    // Get browser info from the scraper
    const scraperBrowserInfo = await linkedInScraper.getBrowserInfo();
    
    return res.status(200).json({
      success: true,
      browserInfo: {
        isInitialized,
        initializeInProgress,
        lastInitializeAttempt: lastInitializeAttempt ? new Date(lastInitializeAttempt).toISOString() : null,
        ...scraperBrowserInfo
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while getting browser debug information'
    });
  }
});

// Route to check and clean up browser resources
router.post('/cleanup-browser', async (req, res) => {
  try {
    console.log('Checking and cleaning up browser resources...');
    
    // Check if there's a stale lock file
    try {
      const lockFileExists = await fs.access('.browser-lock').then(() => true).catch(() => false);
      if (lockFileExists) {
        try {
          const lockData = await fs.readFile('.browser-lock', 'utf8');
          const lockTime = parseInt(lockData);
          
          if (isNaN(lockTime) || Date.now() - lockTime > 60000) {
            // Lock is stale, remove it
            await fs.unlink('.browser-lock').catch(() => {});
            console.log('Removed stale browser lock file');
          }
        } catch (error) {
          // If we can't read the lock file, assume it's invalid and remove it
          await fs.unlink('.browser-lock').catch(() => {});
          console.log('Removed unreadable browser lock file');
        }
      }
    } catch (error) {
      console.log('Error checking lock file:', error.message);
    }
    
    // Check if there's a WebSocket endpoint file but no browser
    const wsEndpointExists = await fs.access('.browser-ws-endpoint.txt').then(() => true).catch(() => false);
    
    if (wsEndpointExists) {
      // Try to connect to the browser
      const browserExists = await linkedInScraper.checkExistingBrowser();
      
      if (!browserExists) {
        // If we couldn't connect, remove the WebSocket endpoint file
        await fs.unlink('.browser-ws-endpoint.txt').catch(() => {});
        console.log('Removed stale WebSocket endpoint file');
      }
    }
    
    // Reset initialization flags if they're stuck
    if (initializeInProgress && lastInitializeAttempt && (Date.now() - lastInitializeAttempt > 60000)) {
      console.log('Resetting stuck initialization flags');
      initializeInProgress = false;
    }
    
    return res.status(200).json({
      success: true,
      message: 'Browser resources checked and cleaned up',
      isInitialized,
      initializeInProgress,
      lastInitializeAttempt: lastInitializeAttempt ? new Date(lastInitializeAttempt).toISOString() : null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while cleaning up browser resources'
    });
  }
});

module.exports = router; 