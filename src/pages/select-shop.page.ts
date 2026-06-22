import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for the Role and Shop Selection Page (post-login selection).
 */
export class SelectShopPage extends BasePage {
  // Locators
  public readonly pageHeader: Locator;
  public readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = this.page.getByText('Truy cập trang quản lý');
    this.logoutButton = this.page.getByRole('button', { name: 'Đăng xuất' });
  }

  /**
   * Selects a role or shop by name.
   * @param shopName The name of the shop/role card to select
   */
  public async selectShop(shopName: string): Promise<void> {
    const shopLocator = this.page.getByText(shopName).first();
    await this.click(shopLocator);
  }

  /**
   * Clicks the logout button on the page.
   */
  public async logout(): Promise<void> {
    await this.click(this.logoutButton);
  }
}
