class LoginPage {
  constructor(page) {
    this.page = page;
    this.url = 'https://partner.uat.cheq.io/';
    
    // Locators
    this.emailInput = 'input[type="email"]';
    this.passwordInput = 'input[type="password"]';
    this.loginButton = 'button:has-text("Login")';
    this.forgotPasswordLink = 'text=Forgot password?';
    this.registerLink = 'text=REGISTER NOW';
    this.learnMoreLink = 'text=LEARN MORE';
  }

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async enterEmail(email) {
    await this.page.fill(this.emailInput, email);
  }

  async enterPassword(password) {
    await this.page.fill(this.passwordInput, password);
  }

  async clickLogin() {
    await this.page.click(this.loginButton);
  }

  async login(email, password) {
    await this.navigate();
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async clickForgotPassword() {
    await this.page.click(this.forgotPasswordLink);
  }

  async clickRegister() {
    await this.page.click(this.registerLink);
  }

  async clickLearnMore() {
    await this.page.click(this.learnMoreLink);
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async isLoginPageVisible() {
    return await this.page.isVisible(this.emailInput);
  }
}

module.exports = LoginPage;




