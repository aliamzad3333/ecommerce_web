const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

test.describe('Cheq Partner Portal - Login Page', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('should open Cheq partner portal login page', async ({ page }) => {
    await loginPage.navigate();
    
    // Verify page is loaded
    const title = await loginPage.getPageTitle();
    console.log('Page Title:', title);
    
    // Verify login elements are visible
    await expect(page.locator(loginPage.emailInput)).toBeVisible();
    await expect(page.locator(loginPage.passwordInput)).toBeVisible();
    await expect(page.locator(loginPage.loginButton)).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });
  });

  test('should display all login page elements', async ({ page }) => {
    await loginPage.navigate();
    
    // Check for email field
    await expect(page.locator(loginPage.emailInput)).toBeVisible();
    
    // Check for password field
    await expect(page.locator(loginPage.passwordInput)).toBeVisible();
    
    // Check for login button
    await expect(page.locator(loginPage.loginButton)).toBeVisible();
    
    // Check for forgot password link
    await expect(page.locator(loginPage.forgotPasswordLink)).toBeVisible();
    
    // Check for register link
    await expect(page.locator(loginPage.registerLink)).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.clickRegister();
    
    // Wait for navigation or verify URL change
    await page.waitForTimeout(2000);
    console.log('Current URL:', page.url());
  });

  test('should login with valid credentials', async ({ page }) => {
    await loginPage.navigate();
    
    // Login with credentials
    const email = 'cheqlogin+12261@cheq.io';
    const password = 'Foodieland1!';
    
    await loginPage.login(email, password);
    
    // Wait for login to process
    await page.waitForTimeout(3000);
    
    // Verify URL changed (login successful)
    const currentUrl = page.url();
    console.log('URL after login:', currentUrl);
    
    // Take screenshot after login
    await page.screenshot({ path: 'screenshots/after-login.png', fullPage: true });
    
    // Assert that we're not on login page anymore (or check for dashboard elements)
    expect(currentUrl).not.toContain('/login');
  });

  test('should login and click on Menus', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.navigate();
    
    // Login with credentials
    const email = 'cheqlogin+12261@cheq.io';
    const password = 'Foodieland1!';
    
    await loginPage.login(email, password);
    
    // Wait for login to process
    await page.waitForTimeout(5000);
    await dashboardPage.waitForDashboardLoad();
    
    // Click on Menus
    await dashboardPage.clickMenus();
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/test-after-clicking-menus.png', fullPage: true });
    
    console.log('URL after clicking Menus:', page.url());
  });
});

