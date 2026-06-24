import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object cho Trang Đăng nhập.
 */
export class LoginPage extends BasePage {
  // Các Locators
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
   * Thực hiện thao tác đăng nhập.
   * @param username Tên đăng nhập/Số điện thoại tài khoản
   * @param password Mật khẩu tài khoản
   */
  public async login(username: string, password: string): Promise<void> {
    await this.navigate('/');
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
