import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object cho trang Phiếu đề xuất đặt hàng (/inventory/purchase-request).
 */
export class PurchaseRequestPage extends BasePage {
  // Các Locators
  public readonly shopIdsInput: Locator;
  public readonly searchButton: Locator;
  public readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.shopIdsInput = this.page.locator('input#shopIds');
    this.searchButton = this.page.getByRole('button', { name: 'Tìm kiếm' });
    this.tableRows = this.page.locator('table tbody tr.ant-table-row');
  }

  /**
   * Chọn Điểm bán / kho thông qua modal chọn.
   * @param cityOrProvince Tên Tỉnh/TCT ở cột 1 (ví dụ: 'Bưu điện Tỉnh Sóc Trăng')
   * @param districtOrCommune Tên Huyện/Xã/Phường ở cột 2 (ví dụ: 'Bưu điện Thành phố Sóc Trăng')
   * @param pointOfSale Tên Điểm bán / kho ở cột 3 (ví dụ: 'Pos mini bưu điện thành phố Sóc Trăng')
   */
  public async selectShopAndWarehouse(
    cityOrProvince: string,
    districtOrCommune: string,
    pointOfSale: string
  ): Promise<void> {
    // Click vào selectbox Điểm bán / kho (click wrapper .ant-select thay vì input ẩn)
    const formSelect = this.page.locator('.ant-select').filter({ hasText: /Tất cả điểm bán|Điểm bán \/ kho/ }).first();
    await this.click(formSelect);
    await this.page.waitForTimeout(1000);

    // --- CỘT 1: Cấp Tổng công ty / Cấp Tỉnh ---
    const col1 = this.page.getByText('Cấp Tổng công ty / Cấp Tỉnh').locator('xpath=../..');
    const cityLocator = col1.getByText(cityOrProvince, { exact: true }).first();
    await cityLocator.waitFor({ state: 'visible', timeout: 5000 });
    await cityLocator.click();
    await this.page.waitForTimeout(500);

    // Kiểm tra cột 2 đã hiển thị đúng lựa chọn chưa, nếu chưa click lại cột 1
    const col2 = this.page.getByText('Cấp Xã / Phường').locator('xpath=../..');
    const districtLocator = col2.getByText(districtOrCommune, { exact: true }).first();
    const isDistrictVisible = await districtLocator.isVisible().catch(() => false);
    if (!isDistrictVisible) {
      console.log(`[selectShopAndWarehouse] District "${districtOrCommune}" not visible. Retrying click on city...`);
      await cityLocator.click();
      await this.page.waitForTimeout(500);
    }

    // --- CỘT 2: Cấp Xã / Phường ---
    await districtLocator.waitFor({ state: 'visible', timeout: 5000 });
    await districtLocator.click();
    await this.page.waitForTimeout(500);

    // Kiểm tra cột 3 đã hiển thị đúng lựa chọn chưa, nếu chưa click lại cột 2
    const col3 = this.page.getByText('Điểm bán / kho', { exact: false }).locator('xpath=../..');
    const posLocator = col3.getByText(pointOfSale, { exact: true }).first();
    const isPosVisible = await posLocator.isVisible().catch(() => false);
    if (!isPosVisible) {
      console.log(`[selectShopAndWarehouse] Point of sale "${pointOfSale}" not visible. Retrying click on district...`);
      await districtLocator.click();
      await this.page.waitForTimeout(500);
    }

    // --- CỘT 3: Điểm bán / kho ---
    await posLocator.waitFor({ state: 'visible', timeout: 5000 });
    await posLocator.click();
    await this.page.waitForTimeout(500);

    // Kiểm tra xem trạng thái "Đã chọn" đã tăng lên chưa, nếu chưa click lại cột 3
    const selectedCount = this.page.getByText(/Đã chọn/i).locator('..').locator('span, p, div').filter({ hasText: /đến bán|điểm bán/i }).first();
    const selectedText = await selectedCount.innerText().catch(() => '');
    if (!selectedText.includes('1')) {
      console.log(`[selectShopAndWarehouse] Selection text "${selectedText}" does not contain "1". Retrying click on point of sale...`);
      await posLocator.click();
      await this.page.waitForTimeout(500);
    }

    // Click nút Xác nhận
    const confirmBtn = this.page.getByRole('button', { name: 'Xác nhận' });
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Nhấn nút Tìm kiếm.
   */
  public async search(): Promise<void> {
    await this.click(this.searchButton);
    // Chờ bảng dữ liệu tải xong
    await this.page.waitForTimeout(1500);
  }
}
