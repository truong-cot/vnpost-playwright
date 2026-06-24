import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object cho trang Dashboard chính / Lịch làm việc.
 */
export class DashboardPage extends BasePage {
  // Các Locators
  public readonly shopSelectorButton: Locator;
  // Combobox trong header để switch shop (khác với SelectShopPage)
  public readonly headerShopCombobox: Locator;

  constructor(page: Page) {
    super(page);
    this.shopSelectorButton = this.page.locator('span:has-text("Chọn cửa hàng")');
    // Combobox chọn cửa hàng nằm trong banner header
    this.headerShopCombobox = this.page.locator('banner').locator('combobox').first();
  }

  /**
   * Trả về locator cho tên hồ sơ người dùng.
   * @param name Tên hồ sơ người dùng mong đợi
   */
  public getUserProfileLocator(name: string): Locator {
    return this.page.getByText(name).first();
  }

  /**
   * Điều hướng quay lại trang chọn vai trò và cửa hàng (nơi chứa nút Đăng xuất).
   */
  public async goToSelectShop(): Promise<void> {
    await this.navigate('/account?act=select-shop');
  }

  /**
   * Chuyển đổi cửa hàng ngay trong header (không cần đăng xuất).
   * Click vào combobox shop selector trong banner, gõ tìm và chọn tên cửa hàng.
   * @param shopName Tên cửa hàng cần chuyển sang
   */
  public async switchShop(shopName: string): Promise<void> {
    // Click vào vùng combobox chọn cửa hàng trong header
    const shopSelectorWrapper = this.page.locator('banner').filter({ hasText: 'Chọn cửa hàng' }).first();
    await shopSelectorWrapper.click();
    // Gõ tên cửa hàng để lọc
    await this.page.keyboard.type(shopName);
    // Chờ option xuất hiện trong dropdown và click
    const option = this.page.locator('.ant-select-dropdown').getByText(shopName, { exact: false }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    // Chờ trang tải lại sau khi switch shop
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Điều hướng tới trang Quản lý Sản phẩm.
   * Mở rộng menu danh mục 'Sản phẩm' nếu đang ẩn, sau đó click vào sub-menu.
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

  /**
   * Điều hướng tới trang Quản lý Khách hàng.
   * Click vào mục menu 'Khách hàng' trên thanh sidebar.
   */
  public async navigateToCustomers(): Promise<void> {
    const menuItem = this.page.locator('li.ant-menu-item:has-text("Khách hàng")').first();
    await this.click(menuItem);
  }

  /**
   * Điều hướng tới trang Quản lý Bảng giá.
   * Mở rộng menu danh mục 'Sản phẩm' nếu đang ẩn, sau đó click vào sub-menu 'Bảng giá'.
   */
  public async navigateToPricing(): Promise<void> {
    const subMenuItem = this.page.locator('li.ant-menu-item:has-text("Bảng giá")').first();
    const isVisible = await subMenuItem.isVisible();
    if (!isVisible) {
      const categoryMenu = this.page.locator('li.ant-menu-submenu:has-text("Sản phẩm")').first();
      await this.click(categoryMenu);
    }
    await this.click(subMenuItem);
  }
}
