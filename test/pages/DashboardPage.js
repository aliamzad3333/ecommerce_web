class DashboardPage {
  constructor(page) {
    this.page = page;
    
    // Locators - Menus button
    this.menusButtonXPath = '/html/body/div/div/div/div[1]/div[2]/div[2]/div[1]/a/button/span[1]/div/h6';
    this.menusButton = page.locator('xpath=' + this.menusButtonXPath);
    // Alternative: try to find by text "Menus"
    this.menusButtonByText = 'text=Menus';
  }

  async clickMenus() {
    try {
      // Wait for the element to be visible
      console.log('🔍 Looking for Menus button...');
      
      // Try multiple selectors for robustness
      const selectors = [
        { type: 'xpath', selector: this.menusButtonXPath },
        { type: 'text', selector: this.menusButtonByText },
        { type: 'role', selector: 'button:has-text("Menus")' }
      ];
      
      let clicked = false;
      
      for (const { type, selector } of selectors) {
        try {
      if (type === 'xpath') {
        await this.page.locator(`xpath=${selector}`).waitFor({ timeout: 5000 });
        await this.page.locator(`xpath=${selector}`).click();
          } else if (type === 'text') {
            await this.page.waitForSelector(selector, { timeout: 5000 });
            await this.page.click(selector);
          } else {
            await this.page.click(selector, { timeout: 5000 });
          }
          
          console.log(`✅ Successfully clicked Menus using ${type} selector`);
          clicked = true;
          break;
        } catch (error) {
          console.log(`⚠️ Failed to click using ${type} selector, trying next...`);
          continue;
        }
      }
      
      if (!clicked) {
        throw new Error('Could not find Menus button with any selector');
      }
      
      // Wait a bit for navigation/action to complete
      await this.page.waitForTimeout(2000);
      
    } catch (error) {
      console.error('❌ Error clicking Menus button:', error.message);
      throw error;
    }
  }

  async waitForDashboardLoad() {
    // Wait for dashboard to load after login
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async clickSKUTab() {
    try {
      console.log('🔍 Looking for SKU tab...');
      const skuTabXPath = '/html/body/div[1]/div/div[2]/div/div/div/div[1]/div/div[2]/div/button[6]/span[1]';
      
      // Wait for the SKU tab to be visible
      const skuTabLocator = this.page.locator(`xpath=${skuTabXPath}`);
      await skuTabLocator.waitFor({ timeout: 10000, state: 'visible' });
      console.log('✅ SKU tab found!');
      
      // Click on SKU tab
      await skuTabLocator.click();
      console.log('✅ Successfully clicked on SKU tab!');
      
      // Wait for tab content to load
      await this.page.waitForTimeout(3000);
      await this.page.waitForLoadState('networkidle');
      
    } catch (error) {
      console.error('❌ Error clicking SKU tab:', error.message);
      throw error;
    }
  }
}

module.exports = DashboardPage;

