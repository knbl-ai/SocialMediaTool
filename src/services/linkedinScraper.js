const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Static browser instance that can be reused
let globalBrowser = null;
let browserInitializationInProgress = false;
let lastBrowserInitTime = null;
let browserConnectAttempts = 0;
const MAX_CONNECT_ATTEMPTS = 3;
const BROWSER_LOCK_FILE = '.browser-lock';

class LinkedInScraper {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.cookiesPath = process.env.COOKIES_PATH || './cookies.json';
    this.loginEmail = process.env.LINKEDIN_EMAIL;
    this.loginPassword = process.env.LINKEDIN_PASSWORD;
    this.isLoggedIn = false;
    
    // Log environment variable status (without revealing actual credentials)
    console.log('LinkedIn Scraper Configuration:');
    console.log(`- Cookies Path: ${this.cookiesPath}`);
    console.log(`- LinkedIn Email: ${this.loginEmail ? 'Set' : 'Not set'}`);
    console.log(`- LinkedIn Password: ${this.loginPassword ? 'Set' : 'Not set'}`);
  }

  async acquireBrowserLock(timeout = 30000) {
    const startTime = Date.now();
    
    while (true) {
      try {
        // Try to create the lock file
        await fs.writeFile(BROWSER_LOCK_FILE, Date.now().toString(), { flag: 'wx' });
        console.log('Browser lock acquired');
        return true;
      } catch (error) {
        // If file already exists, check if the lock is stale (older than 2 minutes)
        try {
          const lockData = await fs.readFile(BROWSER_LOCK_FILE, 'utf8');
          const lockTime = parseInt(lockData);
          
          if (isNaN(lockTime) || Date.now() - lockTime > 120000) {
            // Lock is stale, remove it and try again
            await fs.unlink(BROWSER_LOCK_FILE).catch(() => {});
            console.log('Removed stale browser lock');
            continue;
          }
        } catch (readError) {
          // If we can't read the lock file, assume it's invalid and try to remove it
          await fs.unlink(BROWSER_LOCK_FILE).catch(() => {});
          continue;
        }
        
        // Check if we've timed out
        if (Date.now() - startTime > timeout) {
          console.log('Timed out waiting for browser lock');
          return false;
        }
        
        // Wait a bit before trying again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async releaseBrowserLock() {
    try {
      await fs.unlink(BROWSER_LOCK_FILE).catch(() => {});
      console.log('Browser lock released');
    } catch (error) {
      console.log('Error releasing browser lock:', error.message);
    }
  }

  async initialize() {
    try {
      console.log('Initializing LinkedIn scraper...');
      console.log(`Global browser status: ${globalBrowser ? 'exists' : 'null'}`);
      
      // Acquire a lock to prevent multiple processes from initializing browsers simultaneously
      const lockAcquired = await this.acquireBrowserLock();
      if (!lockAcquired) {
        console.log('Could not acquire browser lock, proceeding with caution');
      }
      
      try {
        // If browser initialization is in progress, wait for it to complete
        if (browserInitializationInProgress) {
          console.log('Browser initialization already in progress, waiting...');
          let waitTime = 0;
          while (browserInitializationInProgress && waitTime < 30000) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            waitTime += 1000;
          }
          
          if (browserInitializationInProgress) {
            console.log('Timed out waiting for browser initialization');
            browserInitializationInProgress = false;
          }
        }
        
        // First check if we already have a global browser
        if (globalBrowser) {
          try {
            // Test if the browser is still responsive
            const testContext = await globalBrowser.newContext();
            await testContext.close();
            console.log('Existing global browser is responsive, reusing it');
            this.browser = globalBrowser;
          } catch (error) {
            console.log('Existing global browser is not responsive, will create a new one');
            globalBrowser = null;
          }
        }
        
        // If we don't have a global browser, try to connect to an existing one or launch a new one
        if (!globalBrowser) {
          browserInitializationInProgress = true;
          browserConnectAttempts = 0;
          
          // Try to connect to an existing browser using the WebSocket endpoint
          const wsEndpoint = await fs.readFile('.browser-ws-endpoint.txt', 'utf8').catch(() => null);
          
          if (wsEndpoint) {
            console.log(`Found WebSocket endpoint: ${wsEndpoint}, attempting to connect...`);
            
            try {
              const browser = await chromium.connect(wsEndpoint);
              console.log('Successfully connected to existing browser');
              
              // Verify the connection by creating a test context
              try {
                const testContext = await browser.newContext();
                const testPage = await testContext.newPage();
                await testPage.goto('about:blank');
                await testPage.close();
                await testContext.close();
                
                // If we got here, the browser is responsive
                globalBrowser = browser;
                this.browser = globalBrowser;
                console.log('Browser connection verified and working');
              } catch (contextError) {
                console.log('Connected to browser but could not create context:', contextError.message);
                try {
                  await browser.close();
                } catch (closeError) {
                  console.log('Error closing browser:', closeError.message);
                }
                globalBrowser = null;
              }
            } catch (connectError) {
              console.log(`Failed to connect to existing browser: ${connectError.message}`);
              
              // Remove the stale WebSocket endpoint file
              try {
                await fs.unlink('.browser-ws-endpoint.txt').catch(() => {});
                console.log('Removed stale WebSocket endpoint file');
              } catch (unlinkError) {
                console.log(`Error removing stale WebSocket endpoint file: ${unlinkError.message}`);
              }
              
              globalBrowser = null;
            }
          } else {
            console.log('No WebSocket endpoint file found');
          }
          
          // If we still don't have a browser, launch a new one
          if (!globalBrowser) {
            console.log('Launching a new browser instance');
            
            try {
              globalBrowser = await chromium.launch({ 
                headless: false,
                args: ['--remote-debugging-port=0'] // Use a random port for WebSocket server
              });
              
              this.browser = globalBrowser;
              
              // Save the WebSocket endpoint for future connections
              try {
                const browserWSEndpoint = globalBrowser.wsEndpoint();
                console.log(`New browser launched with endpoint: ${browserWSEndpoint}`);
                await fs.writeFile('.browser-ws-endpoint.txt', browserWSEndpoint);
              } catch (saveError) {
                console.log(`Error saving browser endpoint: ${saveError.message}`);
              }
            } catch (launchError) {
              console.error('Failed to launch new browser:', launchError);
              browserInitializationInProgress = false;
              await this.releaseBrowserLock();
              return false;
            }
          }
          
          lastBrowserInitTime = Date.now();
          browserInitializationInProgress = false;
        } else {
          this.browser = globalBrowser;
        }
        
        console.log('Browser assigned to scraper instance');
        
        // Create a new browser context
        console.log('Creating new browser context');
        this.context = await this.browser.newContext();
        
        // Try to restore cookies if they exist
        try {
          const cookiesString = await fs.readFile(this.cookiesPath, 'utf8');
          const cookies = JSON.parse(cookiesString);
          await this.context.addCookies(cookies);
          console.log('Cookies loaded successfully');
        } catch (error) {
          console.log('No valid cookies found, will need to login');
        }
        
        // Create a new page
        console.log('Creating new page');
        this.page = await this.context.newPage();
        
        // Check if we're logged in
        await this.checkLoginStatus();
        
        return true;
      } finally {
        // Always release the lock when done
        if (lockAcquired) {
          await this.releaseBrowserLock();
        }
      }
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      browserInitializationInProgress = false;
      return false;
    }
  }

  async handleSecurityCheckpoints() {
    try {
      console.log('Checking for security checkpoints...');
      
      // Check for security challenge
      const isSecurityChallenge = await this.page.evaluate(() => {
        return document.body.textContent.includes('Security Verification') || 
               document.body.textContent.includes('security challenge') ||
               document.body.textContent.includes('Verify it\'s you') ||
               document.body.textContent.includes('CAPTCHA') ||
               document.querySelector('#captcha-challenge') !== null;
      });
      
      if (isSecurityChallenge) {
        console.log('⚠️ Security checkpoint detected! ⚠️');
        console.log('Please manually solve the security checkpoint in the browser window.');
        
        // Take a screenshot for reference
        await this.page.screenshot({ path: 'security-checkpoint.png' });
        console.log('A screenshot has been saved as "security-checkpoint.png"');
        
        // Wait for manual resolution (up to 2 minutes)
        console.log('Waiting for manual resolution (max 2 minutes)...');
        
        // Wait for navigation or success indicators
        await Promise.race([
          this.page.waitForNavigation({ timeout: 120000 }),
          this.page.waitForSelector('.feed-container', { timeout: 120000 }),
          this.page.waitForSelector('.global-nav', { timeout: 120000 })
        ]).catch(err => {
          console.log('Timeout waiting for security check resolution');
        });
        
        // Verify if we're past the security challenge
        const isPastChallenge = await this.page.evaluate(() => {
          return !document.body.textContent.includes('Security Verification') && 
                 !document.body.textContent.includes('security challenge') &&
                 !document.body.textContent.includes('Verify it\'s you') &&
                 !document.body.textContent.includes('CAPTCHA') &&
                 document.querySelector('#captcha-challenge') === null;
        });
        
        if (isPastChallenge) {
          console.log('Security checkpoint successfully passed!');
          return true;
        } else {
          console.log('Still on security checkpoint page. Please complete the verification.');
          return false;
        }
      }
      
      return true; // No security checkpoint detected
    } catch (error) {
      console.error('Error handling security checkpoints:', error);
      return false;
    }
  }

  async checkLoginStatus() {
    try {
      // Visit LinkedIn homepage
      await this.page.goto('https://www.linkedin.com', { waitUntil: 'domcontentloaded' });
      
      // Handle any security checkpoints
      const passedSecurityCheck = await this.handleSecurityCheckpoints();
      if (!passedSecurityCheck) {
        console.log('Could not pass security checkpoint. Login check interrupted.');
        return false;
      }
      
      // Check if we're logged in by looking for elements only visible when logged in
      const isLoggedIn = await this.page.evaluate(() => {
        // Check for nav items that only appear when logged in
        return !!document.querySelector('.global-nav');
      });

      this.isLoggedIn = isLoggedIn;
      
      // If not logged in, try to login
      if (!isLoggedIn) {
        console.log('Not logged in, attempting to login...');
        await this.login();
      } else {
        console.log('Already logged in to LinkedIn');
      }
      
      return this.isLoggedIn;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  async login() {
    try {
      // Check if login credentials are defined
      if (!this.loginEmail || !this.loginPassword) {
        throw new Error('LinkedIn login credentials are missing. Please check your .env file.');
      }
      
      // Go to LinkedIn login page
      await this.page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
      
      // Fill in login credentials
      await this.page.fill('#username', this.loginEmail);
      await this.page.fill('#password', this.loginPassword);
      
      // Click login button
      await this.page.click('.btn__primary--large');
      
      // Handle any security checkpoints after login
      await this.handleSecurityCheckpoints();
      
      // Wait for navigation to complete and check for elements indicating successful login
      await this.page.waitForSelector('.global-nav', { timeout: 30000 })
        .catch(() => {
          throw new Error('Login failed, could not detect successful login elements');
        });
      
      // Save cookies for future use
      const cookies = await this.context.cookies();
      await fs.writeFile(this.cookiesPath, JSON.stringify(cookies));
      
      console.log('Login successful, cookies saved');
      this.isLoggedIn = true;
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      this.isLoggedIn = false;
      return false;
    }
  }

  async scrapeProfile(profileUrl) {
    try {
      if (!this.isLoggedIn) {
        console.log('Not logged in. Cannot scrape profile.');
        return null;
      }

      console.log(`Navigating to profile: ${profileUrl}`);
      // Navigate to the profile
      await this.page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
      
      // Wait for the page to load essential elements instead of waiting for networkidle
      // Use a more specific selector that should be present on both personal and company profiles
      console.log('Waiting for profile page to load...');
      
      // Wait for either a personal profile or company profile indicator
      await Promise.race([
        this.page.waitForSelector('.pv-top-card', { timeout: 30000 }).catch(() => console.log('No personal profile card found')),
        this.page.waitForSelector('.org-top-card', { timeout: 30000 }).catch(() => console.log('No company profile card found')),
        this.page.waitForSelector('h1', { timeout: 30000 }).catch(() => console.log('No h1 found'))
      ]);
      
      // Add a small delay to ensure more content is loaded
      await this.page.waitForTimeout(2000);
      
      console.log('Profile page loaded, proceeding with scraping');

      // Determine if this is a personal profile or company page
      const isCompanyPage = await this.page.evaluate(() => {
        return window.location.href.includes('/company/');
      });

      console.log(`Detected profile type: ${isCompanyPage ? 'Company' : 'Personal'}`);
      
      let profileInfo;
      let posts = [];

      if (isCompanyPage) {
        profileInfo = await this.scrapeCompanyProfile();
        posts = await this.scrapeCompanyPosts();
      } else {
        profileInfo = await this.scrapePersonalProfile();
        posts = await this.scrapePersonalPosts();
      }

      return {
        profileInfo,
        posts
      };
    } catch (error) {
      console.error('Error scraping profile:', error);
      
      // Try to capture a screenshot of the current state for debugging
      try {
        const screenshotPath = `error-screenshot-${Date.now()}.png`;
        await this.page.screenshot({ path: screenshotPath });
        console.log(`Error screenshot saved to ${screenshotPath}`);
      } catch (screenshotError) {
        console.error('Failed to capture error screenshot:', screenshotError);
      }
      
      return null;
    }
  }

  async scrapePersonalProfile() {
    console.log('Scraping personal profile data...');
    try {
      // First take a screenshot to help debug
      await this.page.screenshot({ path: 'personal-profile-debug.png' });
      console.log('Debug screenshot saved as personal-profile-debug.png');
      
      return await this.page.evaluate(() => {
        // Basic profile info with multiple selector fallbacks
        const nameElement = document.querySelector('.text-heading-xlarge') || 
                           document.querySelector('h1.text-heading-xlarge') || 
                           document.querySelector('h1.top-card-layout__title') ||
                           document.querySelector('h1');
                           
        const titleElement = document.querySelector('.text-body-medium') || 
                            document.querySelector('.top-card-layout__headline') ||
                            document.querySelector('.pv-text-details__left-panel');
                            
        const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words') || 
                               document.querySelector('.top-card-layout__first-subline') ||
                               document.querySelector('.pv-text-details__left-panel .text-body-small');
                               
        const aboutElement = document.querySelector('#about ~ .display-flex .pv-shared-text-with-see-more span') || 
                            document.querySelector('.about-section .pv-shared-text-with-see-more span') ||
                            document.querySelector('[data-section="summary"]');
        
        // Profile image with fallback
        const profileImgElement = document.querySelector('.pv-top-card-profile-picture__image') || 
                                 document.querySelector('.top-card-layout__entity-image') ||
                                 document.querySelector('.profile-photo-edit__preview');
        
        // Connections
        const connectionsElement = document.querySelector('.pv-top-card--list-bullet li') || 
                                  document.querySelector('.top-card-layout__link') ||
                                  document.querySelector('.pv-top-card--list-bullet');
        
        // Try to get sections using multiple approaches
        const getSectionElements = (selectors) => {
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements && elements.length > 0) return Array.from(elements);
          }
          return [];
        };
        
        // Education with fallbacks
        const educationElements = getSectionElements([
          '#education-section .pvs-entity',
          'section[id*="education"] .pvs-list__item',
          '.education-section .pvs-entity',
          '[data-section="educationsDetails"] li'
        ]);
        
        const education = educationElements.map(edu => {
          try {
            const school = edu.querySelector('.display-flex .visually-hidden')?.textContent.trim() ||
                           edu.querySelector('.display-flex t-black')?.textContent.trim() ||
                           edu.querySelector('h3')?.textContent.trim();
                           
            const degreeDetails = edu.querySelectorAll('.pvs-list .visually-hidden') ||
                                  edu.querySelectorAll('.t-14.t-normal') ||
                                  edu.querySelectorAll('p');
                                  
            const degree = degreeDetails && degreeDetails.length > 0 ? degreeDetails[0]?.textContent.trim() : '';
            const dates = degreeDetails && degreeDetails.length > 1 ? degreeDetails[1]?.textContent.trim() : '';
            
            return { school, degree, dates };
          } catch (e) {
            return { school: 'Error extracting education data', degree: '', dates: '' };
          }
        });
        
        // Experience with fallbacks
        const experienceElements = getSectionElements([
          '#experience-section .pvs-entity',
          'section[id*="experience"] .pvs-list__item',
          '.experience-section .pvs-entity',
          '[data-section="experienceDetails"] li'
        ]);
        
        const experience = experienceElements.map(exp => {
          try {
            const company = exp.querySelector('.display-flex .visually-hidden')?.textContent.trim() ||
                            exp.querySelector('.display-flex t-black')?.textContent.trim() ||
                            exp.querySelector('h3')?.textContent.trim();
                            
            const positionDetails = exp.querySelectorAll('.pvs-list .visually-hidden') ||
                                    exp.querySelectorAll('.t-14.t-normal') ||
                                    exp.querySelectorAll('p');
                                    
            const position = positionDetails && positionDetails.length > 0 ? positionDetails[0]?.textContent.trim() : '';
            const dates = positionDetails && positionDetails.length > 1 ? positionDetails[1]?.textContent.trim() : '';
            
            return { company, position, dates };
          } catch (e) {
            return { company: 'Error extracting experience data', position: '', dates: '' };
          }
        });
        
        const profileData = {
          name: nameElement ? nameElement.textContent.trim() : null,
          title: titleElement ? titleElement.textContent.trim() : null,
          location: locationElement ? locationElement.textContent.trim() : null,
          about: aboutElement ? aboutElement.textContent.trim() : null,
          profileImage: profileImgElement ? profileImgElement.src : null,
          connections: connectionsElement ? connectionsElement.textContent.trim() : null,
          education,
          experience
        };
        
        return profileData;
      });
    } catch (error) {
      console.error('Error while scraping personal profile:', error);
      
      // Try a simpler approach if the first one fails
      try {
        console.log('Trying alternative personal profile scraping approach...');
        
        return await this.page.evaluate(() => {
          // Just get the basic information
          const name = document.querySelector('h1')?.textContent.trim() || null;
          const title = document.querySelector('h2')?.textContent.trim() || null;
          
          // Get profile image
          const profileImage = document.querySelector('img[src*="profile-displayphoto"]')?.src || 
                              document.querySelector('.pv-top-card img')?.src ||
                              null;
          
          return {
            name,
            title,
            profileImage,
            scrapingMethod: 'fallback'
          };
        });
      } catch (fallbackError) {
        console.error('Fallback personal profile scraping also failed:', fallbackError);
        return {
          name: 'Error scraping profile',
          error: error.message,
          fallbackError: fallbackError.message
        };
      }
    }
  }

  async scrapeCompanyProfile() {
    console.log('Scraping company profile data...');
    try {
      // First take a screenshot to help debug
      await this.page.screenshot({ path: 'company-profile-debug.png' });
      console.log('Debug screenshot saved as company-profile-debug.png');
      
      return await this.page.evaluate(() => {
        // Company name and basic info with fallbacks
        const nameElement = document.querySelector('.org-top-card-summary__title') || 
                           document.querySelector('.org-top-card-primary-content__title') ||
                           document.querySelector('h1');
                           
        const industryElement = document.querySelector('.org-top-card-summary-info-list__info-item') || 
                               document.querySelector('.org-page-details__definition-text');
                               
        const locationElement = document.querySelector('.org-top-card-summary-info-list__info-item:nth-child(2)') || 
                               document.querySelector('.org-location-card .org-location-card__location-type');
                               
        const websiteElement = document.querySelector('.org-top-card-summary-info-list__info-item a[href^="http"]') || 
                              document.querySelector('.org-page-details__definition-text a[href^="http"]');
        
        // Find followers element by checking all info items for text containing "follower"
        let followersElement = null;
        const infoItems = document.querySelectorAll('.org-top-card-summary-info-list__info-item, .org-top-card-summary-info-list span, .org-about-module p');
        
        for (const item of infoItems) {
          if (item.textContent && item.textContent.includes('follower')) {
            followersElement = item;
            break;
          }
        }
        
        // Company About section with fallback
        const aboutElement = document.querySelector('.org-about-us-organization-description__text') || 
                            document.querySelector('.org-about-module__description') ||
                            document.querySelector('.org-about-module .break-words');
        
        // Company logo with fallback
        const logoElement = document.querySelector('.org-top-card-primary-content__logo') || 
                           document.querySelector('.org-top-card-primary-content__logo-container img') ||
                           document.querySelector('.org-top-card img');
        
        const extractFollowersCount = (element) => {
          if (!element) return null;
          const text = element.textContent || '';
          const match = text.match(/([\d,]+)\s+follower/);
          return match ? match[1] : null;
        };
        
        // Get all text content for debugging
        const allTextContent = document.body.textContent;
        const followerTextMatch = allTextContent.match(/([\d,]+)\s+follower/);
        const followersFromText = followerTextMatch ? followerTextMatch[1] : null;
        
        const companyData = {
          name: nameElement ? nameElement.textContent.trim() : null,
          industry: industryElement ? industryElement.textContent.trim() : null,
          location: locationElement ? locationElement.textContent.trim() : null,
          website: websiteElement ? websiteElement.href : null,
          followers: extractFollowersCount(followersElement) || followersFromText,
          about: aboutElement ? aboutElement.textContent.trim() : null,
          logo: logoElement ? logoElement.src : null
        };
        
        return companyData;
      });
    } catch (error) {
      console.error('Error while scraping company profile:', error);
      
      // Try a simpler approach if the first one fails
      try {
        console.log('Trying alternative company profile scraping approach...');
        
        return await this.page.evaluate(() => {
          // Just get the basic information
          const name = document.querySelector('h1')?.textContent.trim() || null;
          
          // Get all text content
          const allText = document.body.textContent;
          
          // Extract followers if present
          const followerMatch = allText.match(/([\d,]+)\s+follower/);
          const followers = followerMatch ? followerMatch[1] : null;
          
          // Get logo if present
          const logo = document.querySelector('img[src*="media-exp"]')?.src || null;
          
          return {
            name,
            followers,
            logo,
            scrapingMethod: 'fallback'
          };
        });
      } catch (fallbackError) {
        console.error('Fallback company profile scraping also failed:', fallbackError);
        return {
          name: 'Error scraping company profile',
          error: error.message,
          fallbackError: fallbackError.message
        };
      }
    }
  }

  async scrapePersonalPosts() {
    try {
      console.log('Attempting to scrape personal posts...');
      
      // Try multiple approaches to find the activity section
      const activityTabElement = await this.page.$('a[href*="/recent-activity/"]');
      const postsTabElement = await this.page.$('a[href*="/detail/recent-activity/"]');
      
      if (activityTabElement) {
        console.log('Found activity tab, clicking...');
        await activityTabElement.click();
        await this.page.waitForTimeout(2000);
      } else if (postsTabElement) {
        console.log('Found posts tab, clicking...');
        await postsTabElement.click();
        await this.page.waitForTimeout(2000);
      } else {
        console.log('Activity tab not found, trying URL navigation');
        const currentUrl = this.page.url();
        const activityUrl = currentUrl.endsWith('/') 
          ? `${currentUrl}recent-activity/` 
          : `${currentUrl}/recent-activity/`;
        
        console.log(`Navigating to: ${activityUrl}`);
        await this.page.goto(activityUrl, { waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(2000);
      }

      // Wait for posts to appear with multiple selector options
      await Promise.race([
        this.page.waitForSelector('.feed-shared-update-v2', { timeout: 10000 }).catch(() => {}),
        this.page.waitForSelector('.occludable-update', { timeout: 10000 }).catch(() => {}),
        this.page.waitForSelector('.feed-shared-card', { timeout: 10000 }).catch(() => {})
      ]);

      // Scroll to load more posts (up to 20)
      console.log('Scrolling to load more posts...');
      await this.scrollToLoadPosts();

      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'posts-loaded.png' });
      console.log('Posts screenshot saved as posts-loaded.png');

      // Get all post elements
      const postSelectors = [
        '.feed-shared-update-v2',
        '.occludable-update',
        '.feed-shared-card',
        '.artdeco-card'
      ];
      
      let postElements = [];
      for (const selector of postSelectors) {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          postElements = elements;
          console.log(`Found ${elements.length} posts with selector: ${selector}`);
          break;
        }
      }
      
      if (postElements.length === 0) {
        console.log('No posts found with any selector');
        return [];
      }
      
      // Limit to 20 posts
      postElements = postElements.slice(0, 20);
      
      // Extract post data
      console.log(`Processing ${postElements.length} posts...`);
      const posts = [];
      
      for (let i = 0; i < postElements.length; i++) {
        try {
          const post = postElements[i];
          
          // Extract basic post data
          const postData = await post.evaluate(element => {
            // Try multiple selectors for text content
            const textElement = 
              element.querySelector('.feed-shared-update-v2__description-wrapper') ||
              element.querySelector('.feed-shared-text') ||
              element.querySelector('.update-components-text');
            
            // Try multiple selectors for timestamp
            const timeElement = 
              element.querySelector('.feed-shared-actor__sub-description') ||
              element.querySelector('.feed-shared-time-ago');
            
            // Try multiple selectors for engagement metrics
            const likesElement = 
              element.querySelector('.social-details-social-counts__reactions-count') ||
              element.querySelector('.social-action-counts__count-value') ||
              element.querySelector('button[aria-label*="reactions"]');
            
            const commentsElement = 
              element.querySelector('.social-details-social-counts__comments') ||
              element.querySelector('.social-action-counts__comments') ||
              element.querySelector('button[aria-label*="comments"]');
            
            return {
              text: textElement ? textElement.textContent.trim() : null,
              timestamp: timeElement ? timeElement.textContent.trim() : null,
              likes: likesElement ? likesElement.textContent.trim() : '0',
              comments: commentsElement ? commentsElement.textContent.trim() : '0'
            };
          });
          
          // Extract media URLs
          const mediaData = await this.extractMediaUrls(post);
          
          // Determine media type
          let mediaType = null;
          let mediaUrl = null;
          let thumbnailUrl = null;
          
          if (mediaData.videoUrls) {
            mediaType = 'video';
            mediaUrl = mediaData.videoUrls[0].src;
            thumbnailUrl = mediaData.videoUrls[0].poster;
          } else if (mediaData.externalVideoUrls) {
            mediaType = 'external_video';
            mediaUrl = mediaData.externalVideoUrls[0];
          } else if (mediaData.imageUrls) {
            mediaType = 'image';
            mediaUrl = mediaData.imageUrls[0];
          } else if (mediaData.bgImageUrls) {
            mediaType = 'image';
            mediaUrl = mediaData.bgImageUrls[0];
          }
          
          posts.push({
            ...postData,
            hasMedia: !!(mediaType),
            mediaType,
            mediaUrl,
            thumbnailUrl,
            allMediaUrls: {
              images: mediaData.imageUrls,
              videos: mediaData.videoUrls,
              backgroundImages: mediaData.bgImageUrls,
              externalVideos: mediaData.externalVideoUrls
            }
          });
          
        } catch (error) {
          console.error(`Error processing post ${i}:`, error);
          posts.push({
            text: 'Error extracting post data',
            error: error.toString()
          });
        }
      }
      
      console.log(`Successfully extracted ${posts.length} posts`);
      return posts;
    } catch (error) {
      console.error('Error scraping personal posts:', error);
      return [];
    }
  }

  async scrapeCompanyPosts() {
    try {
      console.log('Attempting to scrape company posts...');
      
      // Try multiple approaches to find the posts section
      const postsTab = await this.page.$('a[href*="/posts/"]');
      const updatesTab = await this.page.$('a[href*="/updates/"]');
      
      if (postsTab) {
        console.log('Found posts tab, clicking...');
        await postsTab.click();
        await this.page.waitForTimeout(2000);
      } else if (updatesTab) {
        console.log('Found updates tab, clicking...');
        await updatesTab.click();
        await this.page.waitForTimeout(2000);
      } else {
        console.log('Posts tab not found, trying URL navigation');
        const currentUrl = this.page.url();
        const postsUrl = currentUrl.endsWith('/') 
          ? `${currentUrl}posts/` 
          : `${currentUrl}/posts/`;
          
        console.log(`Navigating to: ${postsUrl}`);
        await this.page.goto(postsUrl, { waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(2000);
      }

      // Wait for posts to appear with multiple selector options
      await Promise.race([
        this.page.waitForSelector('.ember-view.occludable-update', { timeout: 10000 }).catch(() => {}),
        this.page.waitForSelector('.feed-shared-update-v2', { timeout: 10000 }).catch(() => {}),
        this.page.waitForSelector('.org-updates__occluded-update', { timeout: 10000 }).catch(() => {}),
        this.page.waitForSelector('.artdeco-card', { timeout: 10000 }).catch(() => {})
      ]);

      // Scroll to load more posts (up to 20)
      console.log('Scrolling to load more posts...');
      await this.scrollToLoadPosts();

      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'company-posts-loaded.png' });
      console.log('Company posts screenshot saved as company-posts-loaded.png');

      // Get all post elements
      const postSelectors = [
        '.ember-view.occludable-update',
        '.org-updates__occluded-update',
        '.feed-shared-update-v2',
        '.artdeco-card'
      ];
      
      let postElements = [];
      for (const selector of postSelectors) {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          postElements = elements;
          console.log(`Found ${elements.length} company posts with selector: ${selector}`);
          break;
        }
      }
      
      if (postElements.length === 0) {
        console.log('No company posts found with any selector');
        return [];
      }
      
      // Limit to 20 posts
      postElements = postElements.slice(0, 20);
      
      // Extract post data
      console.log(`Processing ${postElements.length} company posts...`);
      const posts = [];
      
      for (let i = 0; i < postElements.length; i++) {
        try {
          const post = postElements[i];
          
          // Extract basic post data
          const postData = await post.evaluate(element => {
            // Try multiple selectors for text content
            const textElement = 
              element.querySelector('.feed-shared-text') ||
              element.querySelector('.feed-shared-update-v2__description-wrapper') ||
              element.querySelector('.update-components-text');
            
            // Try multiple selectors for timestamp
            const timeElement = 
              element.querySelector('.feed-shared-actor__sub-description') ||
              element.querySelector('.feed-shared-time-ago');
            
            // Try multiple selectors for engagement metrics
            const likesElement = 
              element.querySelector('.social-details-social-counts__reactions-count') ||
              element.querySelector('.social-action-counts__count-value') ||
              element.querySelector('button[aria-label*="reactions"]');
            
            const commentsElement = 
              element.querySelector('.social-details-social-counts__comments') ||
              element.querySelector('.social-action-counts__comments') ||
              element.querySelector('button[aria-label*="comments"]');
            
            return {
              text: textElement ? textElement.textContent.trim() : null,
              timestamp: timeElement ? timeElement.textContent.trim() : null,
              likes: likesElement ? likesElement.textContent.trim() : '0',
              comments: commentsElement ? commentsElement.textContent.trim() : '0'
            };
          });
          
          // Extract media URLs
          const mediaData = await this.extractMediaUrls(post);
          
          // Determine media type
          let mediaType = null;
          let mediaUrl = null;
          let thumbnailUrl = null;
          
          if (mediaData.videoUrls) {
            mediaType = 'video';
            mediaUrl = mediaData.videoUrls[0].src;
            thumbnailUrl = mediaData.videoUrls[0].poster;
          } else if (mediaData.externalVideoUrls) {
            mediaType = 'external_video';
            mediaUrl = mediaData.externalVideoUrls[0];
          } else if (mediaData.imageUrls) {
            mediaType = 'image';
            mediaUrl = mediaData.imageUrls[0];
          } else if (mediaData.bgImageUrls) {
            mediaType = 'image';
            mediaUrl = mediaData.bgImageUrls[0];
          }
          
          posts.push({
            ...postData,
            hasMedia: !!(mediaType),
            mediaType,
            mediaUrl,
            thumbnailUrl,
            allMediaUrls: {
              images: mediaData.imageUrls,
              videos: mediaData.videoUrls,
              backgroundImages: mediaData.bgImageUrls,
              externalVideos: mediaData.externalVideoUrls
            }
          });
          
        } catch (error) {
          console.error(`Error processing company post ${i}:`, error);
          posts.push({
            text: 'Error extracting company post data',
            error: error.toString()
          });
        }
      }
      
      console.log(`Successfully extracted ${posts.length} company posts`);
      return posts;
    } catch (error) {
      console.error('Error scraping company posts:', error);
      return [];
    }
  }

  async scrollToLoadPosts() {
    // Enhanced scrolling to load more posts
    console.log('Starting scroll to load more posts...');
    
    // First check how many post elements we have initially
    const initialCount = await this.page.evaluate(() => {
      const selectors = [
        '.feed-shared-update-v2',
        '.occludable-update',
        '.feed-shared-card',
        '.ember-view.occludable-update',
        '.artdeco-card'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) return elements.length;
      }
      return 0;
    });
    
    console.log(`Initially found ${initialCount} posts before scrolling`);
    
    // Scroll multiple times, checking for new content after each scroll
    let currentCount = initialCount;
    let scrollAttempts = 0;
    let noChangeCount = 0;
    
    // Scroll until we have at least 20 posts or until we've made multiple attempts with no new posts
    while (currentCount < 20 && scrollAttempts < 15 && noChangeCount < 3) {
      scrollAttempts++;
      
      // Scroll down
      await this.page.evaluate(() => {
        window.scrollBy(0, 800);
      });
      
      // Wait for potential new content to load
      await this.page.waitForTimeout(1000);
      
      // Check if we have more posts after scrolling
      const newCount = await this.page.evaluate(() => {
        const selectors = [
          '.feed-shared-update-v2',
          '.occludable-update',
          '.feed-shared-card',
          '.ember-view.occludable-update',
          '.artdeco-card'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements && elements.length > 0) return elements.length;
        }
        return 0;
      });
      
      console.log(`After scroll attempt ${scrollAttempts}, found ${newCount} posts`);
      
      // Check if the count has increased
      if (newCount > currentCount) {
        currentCount = newCount;
        noChangeCount = 0;  // Reset the no change counter
      } else {
        noChangeCount++;  // Increment the no change counter
      }
      
      // Try a more aggressive scroll if we're not finding new posts
      if (noChangeCount >= 2) {
        console.log('No new posts found, trying a longer scroll...');
        await this.page.evaluate(() => {
          window.scrollBy(0, 1500);
        });
        await this.page.waitForTimeout(1500);
      }
    }
    
    console.log(`Finished scrolling. Found ${currentCount} posts after ${scrollAttempts} scroll attempts.`);
  }

  async close() {
    try {
      // Close the page and context but keep the browser running
      if (this.page) {
        try {
          await this.page.close().catch(err => console.log('Error closing page:', err.message));
        } catch (error) {
          console.log('Error closing page:', error.message);
        } finally {
          this.page = null;
        }
      }
      
      if (this.context) {
        try {
          await this.context.close().catch(err => console.log('Error closing context:', err.message));
        } catch (error) {
          console.log('Error closing context:', error.message);
        } finally {
          this.context = null;
        }
      }
      
      // We don't close the browser to allow reuse
      // Just mark that we're not logged in anymore in this instance
      this.isLoggedIn = false;
      
      console.log('Closed page and context, browser instance remains available for reuse');
      return true;
    } catch (error) {
      console.error('Error closing browser resources:', error);
      return false;
    }
  }

  async forceCloseBrowser() {
    try {
      // Acquire a lock to prevent race conditions
      const lockAcquired = await this.acquireBrowserLock(10000);
      
      try {
        if (this.page) {
          await this.page.close().catch(err => console.log('Error closing page:', err.message));
          this.page = null;
        }
        
        if (this.context) {
          await this.context.close().catch(err => console.log('Error closing context:', err.message));
          this.context = null;
        }
        
        // Close the global browser instance
        if (globalBrowser) {
          try {
            await globalBrowser.close().catch(err => console.log('Error closing global browser:', err.message));
          } catch (error) {
            console.log('Error closing global browser:', error.message);
          } finally {
            globalBrowser = null;
            this.browser = null;
          }
          
          // Remove the WebSocket endpoint file
          try {
            await fs.unlink('.browser-ws-endpoint.txt').catch(() => {});
            console.log('Removed browser WebSocket endpoint file');
          } catch (error) {
            console.log('Error removing WebSocket endpoint file:', error.message);
          }
        } else if (this.browser) {
          // If we have a browser instance that's not the global one
          try {
            await this.browser.close().catch(err => console.log('Error closing browser:', err.message));
          } catch (error) {
            console.log('Error closing browser:', error.message);
          } finally {
            this.browser = null;
          }
        }
        
        this.isLoggedIn = false;
        console.log('Browser instance completely closed');
        return true;
      } finally {
        // Always release the lock when done
        if (lockAcquired) {
          await this.releaseBrowserLock();
        }
      }
    } catch (error) {
      console.error('Error force closing browser:', error);
      return false;
    }
  }

  // Add this helper function to extract media URLs more effectively
  async extractMediaUrls(post) {
    try {
      // Get all image URLs in the post
      const imageUrls = await post.evaluate(element => {
        const images = Array.from(element.querySelectorAll('img'));
        return images
          .filter(img => 
            img.src && 
            (img.src.includes('media.licdn.com') || 
             img.src.includes('media-exp') || 
             img.width > 100) && // Filter out tiny icons
            !img.src.includes('profile-displayphoto') // Filter out profile photos
          )
          .map(img => img.src);
      });
      
      // Get all video URLs in the post
      const videoUrls = await post.evaluate(element => {
        const videos = Array.from(element.querySelectorAll('video'));
        return videos
          .filter(video => video.src)
          .map(video => ({
            src: video.src,
            poster: video.poster
          }));
      });
      
      // Get background images from style attributes
      const bgImageUrls = await post.evaluate(element => {
        const elementsWithBg = Array.from(element.querySelectorAll('[style*="background-image"]'));
        return elementsWithBg.map(el => {
          const style = window.getComputedStyle(el);
          const bgImage = style.backgroundImage;
          const match = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
          return match ? match[1] : null;
        }).filter(url => url);
      });
      
      // Get external video links
      const externalVideoUrls = await post.evaluate(element => {
        const videoLinks = Array.from(element.querySelectorAll('a[href*="youtube.com"], a[href*="vimeo.com"], a[data-control-name="view_external_video"]'));
        return videoLinks.map(link => link.href).filter(url => url);
      });
      
      return {
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
        videoUrls: videoUrls.length > 0 ? videoUrls : null,
        bgImageUrls: bgImageUrls.length > 0 ? bgImageUrls : null,
        externalVideoUrls: externalVideoUrls.length > 0 ? externalVideoUrls : null
      };
    } catch (error) {
      console.error('Error extracting media URLs:', error);
      return {
        imageUrls: null,
        videoUrls: null,
        bgImageUrls: null,
        externalVideoUrls: null
      };
    }
  }

  async checkExistingBrowser() {
    try {
      // Acquire a lock to prevent race conditions
      const lockAcquired = await this.acquireBrowserLock(10000); // shorter timeout for this check
      
      try {
        // If we already have a global browser, check if it's responsive
        if (globalBrowser) {
          console.log('Global browser already exists, checking if responsive...');
          try {
            const testContext = await globalBrowser.newContext();
            const testPage = await testContext.newPage();
            await testPage.goto('about:blank');
            await testPage.close();
            await testContext.close();
            console.log('Existing global browser is responsive');
            this.browser = globalBrowser;
            return true;
          } catch (error) {
            console.log('Existing global browser is not responsive, will try to connect or launch a new one');
            try {
              await globalBrowser.close().catch(() => {});
            } catch (closeError) {
              console.log('Error closing unresponsive browser:', closeError.message);
            }
            globalBrowser = null;
          }
        }
        
        // Check if there's a WebSocket endpoint file
        const wsEndpoint = await fs.readFile('.browser-ws-endpoint.txt', 'utf8').catch(() => null);
        if (!wsEndpoint) {
          console.log('No WebSocket endpoint file found');
          return false;
        }
        
        console.log(`Found WebSocket endpoint: ${wsEndpoint}`);
        
        // Try to connect to the browser
        try {
          console.log('Attempting to connect to browser at:', wsEndpoint);
          const browser = await chromium.connect(wsEndpoint);
          console.log('Successfully connected to existing browser');
          
          // Check if the browser is responsive
          try {
            const context = await browser.newContext();
            const page = await context.newPage();
            await page.goto('about:blank');
            await page.close();
            await context.close();
            
            // If we got here, the browser is responsive
            globalBrowser = browser;
            this.browser = globalBrowser;
            console.log('Browser connection verified and working');
            return true;
          } catch (contextError) {
            console.log('Connected to browser but could not create context:', contextError.message);
            try {
              await browser.close();
            } catch (closeError) {
              console.log('Error closing browser:', closeError.message);
            }
            
            // Remove the stale WebSocket endpoint file
            try {
              await fs.unlink('.browser-ws-endpoint.txt').catch(() => {});
              console.log('Removed stale WebSocket endpoint file');
            } catch (unlinkError) {
              console.log(`Error removing stale WebSocket endpoint file: ${unlinkError.message}`);
            }
            
            return false;
          }
        } catch (error) {
          console.log(`Failed to connect to existing browser: ${error.message}`);
          
          // Remove the stale WebSocket endpoint file
          try {
            await fs.unlink('.browser-ws-endpoint.txt').catch(() => {});
            console.log('Removed stale WebSocket endpoint file');
          } catch (unlinkError) {
            console.log(`Error removing stale WebSocket endpoint file: ${unlinkError.message}`);
          }
          
          return false;
        }
      } finally {
        // Always release the lock when done
        if (lockAcquired) {
          await this.releaseBrowserLock();
        }
      }
    } catch (error) {
      console.error('Error checking existing browser:', error);
      return false;
    }
  }

  async getBrowserInfo() {
    try {
      // Get information about the global browser
      const globalBrowserInfo = globalBrowser ? {
        connected: true,
        wsEndpoint: globalBrowser.wsEndpoint ? globalBrowser.wsEndpoint() : 'Not available'
      } : {
        connected: false
      };
      
      // Get information about this instance's browser
      const instanceBrowserInfo = this.browser ? {
        connected: true,
        wsEndpoint: this.browser.wsEndpoint ? this.browser.wsEndpoint() : 'Not available',
        isSameAsGlobal: this.browser === globalBrowser
      } : {
        connected: false
      };
      
      // Check if there's a WebSocket endpoint file
      let savedWsEndpoint = null;
      try {
        savedWsEndpoint = await fs.readFile('.browser-ws-endpoint.txt', 'utf8').catch(() => null);
      } catch (error) {
        console.log('Error reading WebSocket endpoint file:', error.message);
      }
      
      return {
        globalBrowser: globalBrowserInfo,
        instanceBrowser: instanceBrowserInfo,
        savedWsEndpoint,
        isLoggedIn: this.isLoggedIn,
        lastBrowserInitTime: lastBrowserInitTime ? new Date(lastBrowserInitTime).toISOString() : null,
        browserInitializationInProgress
      };
    } catch (error) {
      console.error('Error getting browser info:', error);
      return {
        error: error.message
      };
    }
  }
}

module.exports = new LinkedInScraper(); 