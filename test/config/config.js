module.exports = {
  baseUrl: 'https://partner.uat.cheq.io',
  timeout: 30000,
  headless: false, // Set to true to run in headless mode
  browser: 'chromium',
  
  // Test data
  testUsers: {
    valid: {
      email: 'cheqlogin+12261@cheq.io',
      password: 'Foodieland1!'
    }
  },
  
  // Screenshots and videos
  screenshotPath: './screenshots',
  videoPath: './videos',
};

