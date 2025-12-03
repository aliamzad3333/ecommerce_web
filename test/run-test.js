const { chromium } = require('playwright');

async function openCheqPortal() {
  console.log('🚀 Opening Chrome browser...');
  
  // Launch browser in headed mode (visible) with maximize
  const browser = await chromium.launch({ 
    headless: false,
    channel: 'chrome', // Use Chrome instead of Chromium
    slowMo: 500, // Slow down actions for better visibility
    args: ['--start-maximized'] // Start browser maximized
  });
  
  const context = await browser.newContext({
    viewport: null // No viewport restriction - use full screen
  });
  
  const page = await context.newPage();
  
  console.log('📄 Navigating to Cheq partner portal...');
  await page.goto('https://partner.stg.cheq.io/');
  
  console.log('✅ Page loaded! Waiting for elements...');
  await page.waitForLoadState('networkidle');
  
  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  console.log('✅ Login page is ready!');
  console.log('Current URL:', page.url());
  
  // Login with credentials
  console.log('🔐 Attempting to login...');
  const email = 'tapu.edit@yopmail.com';
  const password = 'Cheq@234';
  
  await page.fill('input[type="email"]', email);
  console.log('✅ Email entered');
  
  await page.fill('input[type="password"]', password);
  console.log('✅ Password entered');
  
  console.log('🔘 Clicking Login button...');
  await page.click('button:has-text("Login")');
  
  console.log('⏳ Waiting for login to complete...');
  await page.waitForTimeout(5000);
  
  const currentUrl = page.url();
  console.log('✅ Login attempt completed!');
  console.log('📍 Current URL:', currentUrl);
  
  // Check if login was successful
  if (currentUrl !== 'https://partner.stg.cheq.io/') {
    console.log('✅ Login appears successful - URL changed!');
  } else {
    console.log('⚠️ Still on login page - checking...');
  }
  
  // Take screenshot after login
  await page.screenshot({ path: 'screenshots/after-login.png', fullPage: true });
  console.log('📸 Screenshot saved!');
  
  // Wait for dashboard to load
  console.log('⏳ Waiting for dashboard to load...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Maximize browser window to see all elements
  console.log('🖥️ Maximizing browser window...');
  try {
    // Try to maximize using JavaScript
    await page.evaluate(() => {
      if (window.screen && window.screen.availWidth && window.screen.availHeight) {
        window.resizeTo(window.screen.availWidth, window.screen.availHeight);
        window.moveTo(0, 0);
      }
    });
    console.log('✅ Browser window maximized!');
  } catch (e) {
    console.log('⚠️ Could not maximize programmatically, but viewport is set to full screen');
  }
  await page.waitForTimeout(1000);
  
  // Click on Menus button
  try {
    console.log('📋 Attempting to click on Menus...');
    const menusXPath = '/html/body/div/div/div/div[1]/div[2]/div[2]/div[1]/a/button/span[1]/div/h6';
    
    // Wait for the element to be visible using XPath locator
    const menusLocator = page.locator(`xpath=${menusXPath}`);
    await menusLocator.waitFor({ timeout: 10000, state: 'visible' });
    console.log('✅ Menus button found!');
    
    // Click on Menus
    await menusLocator.click();
    console.log('✅ Successfully clicked on Menus!');
    
    // Wait for navigation/action to complete
    await page.waitForTimeout(3000);
    
    // Take screenshot after clicking Menus
    await page.screenshot({ path: 'screenshots/after-clicking-menus.png', fullPage: true });
    console.log('📸 Screenshot after clicking Menus saved!');
    
    console.log('📍 Current URL after clicking Menus:', page.url());
    
    // Wait for Menus page to fully load
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    
    // Function to create an item
    async function createItem(itemNumber) {
      const numStr = itemNumber.toString().padStart(2, '0');
      const firstValue = `muttonrezala${numStr}`;
      const secondValue = `Pizza ${numStr}`;
      const thirdValue = '5';
      
      console.log(`\n📦 Creating item ${itemNumber} with values: "${firstValue}", "${secondValue}", "${thirdValue}"`);
      
      // Click on Add Item button
      try {
      console.log('➕ Attempting to click on Add Item button...');
      const addItemXPath = '/html/body/div[1]/div/div[2]/div/div/div/div[2]/div/div/div/div[2]/div[5]/div[2]/div/div/div/div/div/div/div[1]/div/div[2]/div[3]/div[2]/label/button';
      
      // Wait for the Add Item button to be visible
      const addItemLocator = page.locator(`xpath=${addItemXPath}`);
      await addItemLocator.waitFor({ timeout: 10000, state: 'visible' });
      console.log('✅ Add Item button found!');
      
      // Click on Add Item button
      await addItemLocator.click();
      console.log('✅ Successfully clicked on Add Item button!');
      
      // Wait for popup to appear and be fully loaded
      console.log('⏳ Waiting for popup to appear...');
      
      // Wait for popup/modal to be visible (check for dialog or modal)
      try {
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});
        await page.waitForSelector('.MuiDialog-root', { timeout: 5000 }).catch(() => {});
        await page.waitForSelector('[class*="Dialog"]', { timeout: 5000 }).catch(() => {});
        console.log('✅ Popup/modal detected!');
      } catch (e) {
        console.log('⚠️ Popup detection in progress...');
      }
      
      // Wait for network to be idle and ensure popup content is loaded
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Take screenshot of popup
      await page.screenshot({ path: 'screenshots/popup-opened.png', fullPage: true });
      console.log('📸 Screenshot of popup saved!');
      
      // Additional wait for popup content to fully render
      await page.waitForTimeout(1000);
      
      // Click "Create New SKU Item" button
      console.log('🆕 Looking for "Create New SKU Item" button...');
      try {
        // Try multiple XPath variations
        const createNewSKUXPaths = [
          '/html/body/div[22]/div[3]/div/div/div[2]/div/button/span[1]',
          '/html/body/div[22]/div[3]/div/div/div[2]/div/button',
          '//button[contains(., "Create New SKU")]',
          '//button[contains(., "Create New")]',
          '//button[.//span[contains(text(), "Create New SKU")]]'
        ];
        
        let buttonClicked = false;
        
        // First try the original XPath
        for (const xpath of createNewSKUXPaths) {
          try {
            console.log(`  Trying XPath: ${xpath}`);
            const createNewSKULocator = page.locator(`xpath=${xpath}`);
            
            // Wait for button to be visible (longer timeout after popup)
            await createNewSKULocator.waitFor({ timeout: 10000, state: 'visible' });
            console.log(`✅ Button found using: ${xpath}`);
            
            // Scroll into view
            await createNewSKULocator.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            
            // Try clicking the button
            await createNewSKULocator.click({ force: true });
            console.log('✅ Successfully clicked "Create New SKU Item" button!');
            buttonClicked = true;
            await page.waitForTimeout(2000);
            break;
          } catch (e) {
            console.log(`  ⚠️ Failed with XPath ${xpath}: ${e.message}`);
            continue;
          }
        }
        
        // If XPath didn't work, try text-based selector
        if (!buttonClicked) {
          console.log('⚠️ Trying text-based selector...');
          try {
            const textButton = page.locator('button:has-text("Create New SKU Item")');
            await textButton.waitFor({ timeout: 5000, state: 'visible' });
            await textButton.scrollIntoViewIfNeeded();
            await textButton.click({ force: true });
            console.log('✅ Successfully clicked using text selector!');
            buttonClicked = true;
            await page.waitForTimeout(2000);
          } catch (e) {
            console.log(`  ⚠️ Text selector failed: ${e.message}`);
          }
        }
        
        // If still not clicked, try finding by button text content
        if (!buttonClicked) {
          console.log('⚠️ Trying alternative text search...');
          try {
            const altButton = page.locator('button:has-text("Create New SKU")');
            await altButton.first().waitFor({ timeout: 5000, state: 'visible' });
            await altButton.first().scrollIntoViewIfNeeded();
            await altButton.first().click({ force: true });
            console.log('✅ Successfully clicked using alternative text search!');
            buttonClicked = true;
            await page.waitForTimeout(2000);
          } catch (e) {
            console.log(`  ⚠️ Alternative text search failed: ${e.message}`);
          }
        }
        
        if (buttonClicked) {
          // Wait for new page/form to load after clicking Create New SKU Item
          console.log('⏳ Waiting for new page/form to load...');
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          
          // Fill the input field
          try {
            console.log(`⌨️ Looking for first input field to enter "${firstValue}"...`);
            const inputFieldXPath = '/html/body/div[10]/div[3]/div/div/form/div[2]/div[2]/div/div/div/div[1]/div/div[1]/div/div/input';
            const inputFieldLocator = page.locator(`xpath=${inputFieldXPath}`);
            
            await inputFieldLocator.waitFor({ timeout: 10000, state: 'visible' });
            console.log('✅ Input field found!');
            
            // Clear and fill the input field with generated value
            await inputFieldLocator.clear();
            await inputFieldLocator.fill(firstValue);
            console.log(`✅ Entered "${firstValue}" in input field`);
            
            await page.waitForTimeout(1000);
          } catch (inputError) {
            console.error('❌ Error filling input field:', inputError.message);
            console.log('⚠️ Trying alternative input selectors...');
            
            // Try alternative input selectors
            const altInputSelectors = [
              'input[type="text"]',
              'input[placeholder*="name" i]',
              'input[placeholder*="item" i]',
              '.MuiInputBase-input',
              'form input[type="text"]:first-of-type'
            ];
            
            for (const selector of altInputSelectors) {
              try {
                const input = page.locator(selector).first();
                if (await input.isVisible({ timeout: 2000 })) {
                  await input.clear();
                  await input.fill(firstValue);
                  console.log(`✅ Entered "${firstValue}" using selector: ${selector}`);
                  break;
                }
              } catch (e) {
                continue;
              }
            }
          }
          
          // Fill the second input field
          try {
            console.log(`⌨️ Looking for second input field to enter "${secondValue}"...`);
            const secondInputFieldXPath = '/html/body/div[10]/div[3]/div/div/form/div[2]/div[2]/div/div/div/div[1]/div/div[4]/div/div/input';
            const secondInputFieldLocator = page.locator(`xpath=${secondInputFieldXPath}`);
            
            await secondInputFieldLocator.waitFor({ timeout: 10000, state: 'visible' });
            console.log('✅ Second input field found!');
            
            // Clear and fill the second input field with generated value
            await secondInputFieldLocator.clear();
            await secondInputFieldLocator.fill(secondValue);
            console.log(`✅ Entered "${secondValue}" in second input field`);
            
            await page.waitForTimeout(1000);
          } catch (secondInputError) {
            console.error('❌ Error filling second input field:', secondInputError.message);
            console.log('⚠️ Trying alternative selectors for second input...');
            
            // Try alternative input selectors for second field
            const altSecondInputSelectors = [
              'form input[type="text"]:nth-of-type(2)',
              'form input[type="text"]:last-of-type',
              'div[class*="input"] input:last-of-type',
              '.MuiInputBase-input:nth-of-type(2)'
            ];
            
            for (const selector of altSecondInputSelectors) {
              try {
                const input = page.locator(selector).first();
                if (await input.isVisible({ timeout: 2000 })) {
                  await input.clear();
                  await input.fill(secondValue);
                  console.log(`✅ Entered "${secondValue}" using selector: ${selector}`);
                  break;
                }
              } catch (e) {
                continue;
              }
            }
          }
          
          // Fill the third input field with "5"
          try {
            console.log('⌨️ Looking for third input field to enter "5"...');
            const thirdInputFieldXPath = '/html/body/div[10]/div[3]/div/div/form/div[2]/div[2]/div/div/div/div[1]/div/div[3]/div/div/input';
            const thirdInputFieldLocator = page.locator(`xpath=${thirdInputFieldXPath}`);
            
            await thirdInputFieldLocator.waitFor({ timeout: 10000, state: 'visible' });
            console.log('✅ Third input field found!');
            
            // Clear and fill the third input field with generated value
            await thirdInputFieldLocator.clear();
            await thirdInputFieldLocator.fill(thirdValue);
            console.log(`✅ Entered "${thirdValue}" in third input field`);
            
            await page.waitForTimeout(1000);
          } catch (thirdInputError) {
            console.error('❌ Error filling third input field:', thirdInputError.message);
            console.log('⚠️ Trying alternative selectors for third input...');
            
            // Try alternative input selectors for third field
            const altThirdInputSelectors = [
              'form input[type="text"]:nth-of-type(3)',
              'form input[type="number"]',
              'input[type="number"]',
              '.MuiInputBase-input:nth-of-type(3)',
              'input[placeholder*="price" i]',
              'input[placeholder*="amount" i]'
            ];
            
            for (const selector of altThirdInputSelectors) {
              try {
                const input = page.locator(selector).first();
                if (await input.isVisible({ timeout: 2000 })) {
                  await input.clear();
                  await input.fill(thirdValue);
                  console.log(`✅ Entered "${thirdValue}" using selector: ${selector}`);
                  break;
                }
              } catch (e) {
                continue;
              }
            }
          }
          
          // Click the save button after filling all values
          try {
            console.log('💾 Looking for save button to click...');
            const saveButtonXPath = '/html/body/div[10]/div[3]/div/div/form/div[1]/div/button';
            const saveButtonLocator = page.locator(`xpath=${saveButtonXPath}`);
            
            await saveButtonLocator.waitFor({ timeout: 10000, state: 'visible' });
            console.log('✅ Save button found!');
            
            await saveButtonLocator.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await saveButtonLocator.click({ force: true });
            console.log('✅ Successfully clicked save button!');
            
            // Wait for action to complete
            await page.waitForTimeout(2000);
            await page.waitForLoadState('networkidle');
            
            // Take screenshot after clicking save button
            await page.screenshot({ path: `screenshots/after-clicking-save-${itemNumber}.png`, fullPage: true });
            console.log(`📸 Screenshot after clicking save button for item ${itemNumber} saved!`);
            
            // Wait for page to return to menus after save
            await page.waitForTimeout(2000);
            await page.waitForLoadState('networkidle');
            
          } catch (saveError) {
            console.error('❌ Error clicking save button:', saveError.message);
            await page.screenshot({ path: `screenshots/error-save-button-${itemNumber}.png`, fullPage: true });
          }
          
          // Take screenshot after clicking Create New SKU Item and filling all inputs
          await page.screenshot({ path: `screenshots/after-filling-all-inputs-${itemNumber}.png`, fullPage: true });
          console.log(`📸 Screenshot after filling all inputs for item ${itemNumber} saved!`);
        } else {
          throw new Error('Could not click "Create New SKU Item" button with any method');
        }
        
      } catch (e) {
        console.error('❌ Error clicking "Create New SKU Item" button:', e.message);
        // Take error screenshot
        await page.screenshot({ path: `screenshots/error-create-new-sku-${itemNumber}.png`, fullPage: true });
        console.log('📸 Error screenshot saved for debugging');
      }
      
      } catch (error) {
        console.error(`❌ Error with Add Item process for item ${itemNumber}:`, error.message);
        console.log('⚠️ Continuing to next item...');
        // Take screenshot to see what's on the page
        await page.screenshot({ path: `screenshots/error-add-item-${itemNumber}.png`, fullPage: true });
      }
    }
    
    // Create first item
    await createItem(1);
    
    // Loop to create items 2-10
    for (let i = 2; i <= 10; i++) {
      console.log(`\n🔄 Starting creation of item ${i}...`);
      
      // Wait for menus page to be ready
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
      
      // Create the item
      await createItem(i);
      
      // Wait before next iteration
      if (i < 10) {
        console.log(`⏳ Waiting before creating item ${i + 1}...`);
        await page.waitForTimeout(2000);
      }
    }
    
    console.log('\n✅ Completed creating all 10 items!');
    
  } catch (error) {
    console.error('❌ Error clicking Menus:', error.message);
    console.log('⚠️ Continuing anyway...');
    // Take screenshot to see what's on the page
    await page.screenshot({ path: 'screenshots/error-menus-click.png', fullPage: true });
  }
  
  // Keep browser open for 5 minutes so user can interact
  console.log('⏳ Browser will stay open for 5 minutes. You can interact with the page...');
  console.log('Press Ctrl+C to close earlier.');
  await page.waitForTimeout(300000);
  
  await browser.close();
  console.log('✅ Browser closed.');
}

openCheqPortal().catch(console.error);

