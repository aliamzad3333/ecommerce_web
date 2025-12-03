# Quick Start Guide

## 🚀 Run Automation Script

### Option 1: Simple Script (Opens Browser & Logs In)
```bash
cd test
node run-test.js
```

OR

```bash
cd test
npm run login
```

This will:
- ✅ Open Chrome browser
- ✅ Navigate to https://partner.uat.cheq.io/
- ✅ Auto-login with credentials
- ✅ Keep browser open for 5 minutes

### Option 2: Full Test Suite
```bash
cd test
npm run test:headed
```

This will:
- ✅ Run all tests in visible browser
- ✅ Take screenshots
- ✅ Show test results

### Option 3: Run Single Test
```bash
cd test
npx playwright test tests/login.test.js --headed
```

## 📝 Commands Summary

```bash
# Navigate to test folder
cd test

# Run simple browser script
node run-test.js

# Run full test suite (headed)
npm run test:headed

# Run tests (headless)
npm test

# Run in debug mode
npm run test:debug
```

## 🛑 To Stop
Press `Ctrl + C` in terminal to stop the script.

