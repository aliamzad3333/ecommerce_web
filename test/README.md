# Cheq Partner Portal - Test Automation

Automation tests using Page Object Model (POM) pattern for Cheq partner portal.

## Project Structure

```
test/
├── pages/           # Page Object Model classes
│   └── LoginPage.js
├── tests/           # Test files
│   └── login.test.js
├── utils/           # Utility functions
├── config/          # Configuration files
│   └── config.js
├── playwright.config.js
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

## Running Tests

Run tests in headed mode (visible browser):
```bash
npm run test:headed
```

Run tests in headless mode:
```bash
npm test
```

Run tests in debug mode:
```bash
npm run test:debug
```

## Page Object Model (POM)

The project follows POM pattern:
- **pages/**: Contains page objects with locators and methods
- **tests/**: Contains test cases that use page objects

## Features

- ✅ Opens Chrome browser
- ✅ Navigates to https://partner.uat.cheq.io/
- ✅ Page Object Model structure
- ✅ Screenshot on failure
- ✅ Video recording on failure




