import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object cho Trang Chọn Vai trò và Cửa hàng (sau khi đăng nhập).
 */
export class SelectShopPage extends BasePage {
  // Các Locators
  public readonly pageHeader: Locator;
  public readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = this.page.getByText('Truy cập trang quản lý');
    this.logoutButton = this.page.getByRole('button', { name: 'Đăng xuất' });
  }

  /**
   * Chờ trang select-shop tải xong (networkidle).
   */
  public async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Chọn một vai trò hoặc cửa hàng theo tên chính xác.
   * @param shopName Tên của cửa hàng/vai trò cần chọn
   */
  public async selectShop(shopName: string): Promise<void> {
    await this.waitForReady();
    const shopLocator = this.page.getByText(shopName).first();
    await this.click(shopLocator);
  }

  /**
   * Chọn cửa hàng theo danh sách ưu tiên (fallback theo thứ tự).
   *
   * Thứ tự thử: candidates[0] → candidates[1] → ... → fallbackShop (Admin/TCT).
   * Dùng cho các test cross-shop cần linh hoạt theo môi trường:
   *   - 'Quản lý tỉnh' → 'Giám đốc xã' → 'Cửa hàng trưởng' → fallback Admin
   *
   * @param candidates Danh sách tên shop theo thứ tự ưu tiên
   * @param fallbackShop Shop dự phòng nếu không tìm thấy bất kỳ candidate nào
   * @returns Tên shop đã được chọn
   */
  public async selectShopWithFallback(
    candidates: string[],
    fallbackShop = 'Tổng công ty Bưu Điện Việt Nam'
  ): Promise<string> {
    await this.waitForReady();
    for (const shopName of candidates) {
      const shopLocator = this.page.getByText(shopName, { exact: false }).first();
      const isVisible = await shopLocator.isVisible();
      if (isVisible) {
        await shopLocator.click();
        return shopName;
      }
    }
    // Không tìm thấy bất kỳ candidate nào → vào lại Admin (TCT)
    console.warn(
      `[SelectShopPage] Không tìm thấy shop nào trong [${candidates.join(', ')}]. Quay lại: ${fallbackShop}`
    );
    const fallbackLocator = this.page.getByText(fallbackShop, { exact: false }).first();
    await this.click(fallbackLocator);
    return fallbackShop;
  }

  /**
   * Click vào nút Đăng xuất trên trang.
   */
  public async logout(): Promise<void> {
    await this.click(this.logoutButton);
  }
}
