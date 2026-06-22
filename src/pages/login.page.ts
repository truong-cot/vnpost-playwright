import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for the Login Page.
 */
export class LoginPage extends BasePage {
  // Locators
  public readonly usernameInput: Locator;
  public readonly passwordInput: Locator;
  public readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.locator('#username');
    this.passwordInput = this.page.locator('#password');
    this.loginButton = this.page.getByRole('button', { name: 'Tiếp tục' });
  }

  /**
   * Performs the login operation.
   * @param username The account login username/phone
   * @param password The account password
   */
  public async login(username: string, password: string): Promise<void> {
    await this.navigate('/');
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
