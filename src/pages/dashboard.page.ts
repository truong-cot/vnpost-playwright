import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for the Main Dashboard / Work calendar page.
 */
export class DashboardPage extends BasePage {
  // Locators
  public readonly shopSelectorButton: Locator;

  constructor(page: Page) {
    super(page);
    this.shopSelectorButton = this.page.locator('span:has-text("Chọn cửa hàng")');
  }

  /**
   * Returns the locator for the user profile name.
   * @param name The expected user profile name
   */
  public getUserProfileLocator(name: string): Locator {
    return this.page.getByText(name).first();
  }

  /**
   * Navigates back to the role and shop selection page (which contains the Logout button).
   */
  public async goToSelectShop(): Promise<void> {
    await this.navigate('/account?act=select-shop');
  }

  /**
   * Navigates to the Product management page.
   * Expands the 'Sản phẩm' category menu if hidden, then clicks the sub-menu item.
   */
  public async navigateToProducts(): Promise<void> {
    const subMenuItem = this.page.locator('li.ant-menu-item:has-text("Sản phẩm")').first();
    const isVisible = await subMenuItem.isVisible();
    if (!isVisible) {
      const categoryMenu = this.page.locator('li.ant-menu-submenu:has-text("Sản phẩm")').first();
      await this.click(categoryMenu);
    }
    await this.click(subMenuItem);
  }
}
