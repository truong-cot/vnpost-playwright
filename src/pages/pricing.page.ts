import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object cho trang Quản lý Bảng giá (/product/pricing).
 */
export class PricingPage extends BasePage {
  public readonly tableHeaders: Locator;
  public readonly tableRows: Locator;
  public readonly pageSizeItem: Locator;
  public readonly paginationTotalText: Locator;
  public readonly searchInput: Locator;
  public readonly statusSelect: Locator;
  public readonly formSelect: Locator;
  public readonly startDateInput: Locator;
  public readonly emptyPlaceholder: Locator;

  constructor(page: Page) {
    super(page);
    // Định vị tất cả các cột tiêu đề trong phần head của bảng
    this.tableHeaders = this.page.locator('.ant-table-thead th');
    // Định vị tất cả các dòng dữ liệu trong phần body của bảng
    this.tableRows = this.page.locator('.ant-table-tbody tr.ant-table-row');
    // Định vị phần tử hiển thị kích thước trang hoạt động (ví dụ: "10 / trang") trong pagination
    this.pageSizeItem = this.page.locator('.ant-pagination .ant-select-content').first();
    // Định vị văn bản hiển thị tổng số bản ghi
    this.paginationTotalText = this.page.locator('.ant-pagination-total-text').first();
    // Định vị ô nhập tìm kiếm theo placeholder
    this.searchInput = this.page.getByPlaceholder('Nhập tên bảng giá');
    // Định vị dropdown bộ lọc Trạng thái và Hình thức
    this.statusSelect = this.page.locator('.ant-select.w-full.md\\:w-\\[180px\\]').nth(0);
    this.formSelect = this.page.locator('.ant-select.w-full.md\\:w-\\[180px\\]').nth(1);
    // Định vị ô nhập ngày bắt đầu của bộ lọc thời gian
    this.startDateInput = this.page.getByPlaceholder('Bắt đầu');
    // Định vị thông báo không có dữ liệu (Trống)
    this.emptyPlaceholder = this.page.locator('.ant-empty-description').first();
  }

  /**
   * Lấy toàn bộ tiêu đề các cột trong bảng.
   */
  public async getHeaders(): Promise<string[]> {
    const headers = await this.tableHeaders.allTextContents();
    return headers.map(h => h.trim());
  }

  /**
   * Lấy tổng số dòng dữ liệu hiện đang hiển thị trong bảng.
   */
  public async getRowsCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * Lấy danh sách các giá trị của cột "Hình thức" cho tất cả các hàng hiện tại.
   * Cột "Hình thức" là cột thứ 5 (index 4).
   */
  public async getFormColumnValues(): Promise<string[]> {
    const count = await this.getRowsCount();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i);
      // Index 4 tương ứng cột thứ 5 ("Hình thức")
      const cell = row.locator('td').nth(4);
      const text = await cell.innerText();
      values.push(text.trim());
    }
    return values;
  }

  /**
   * Lấy văn bản kích thước trang hoạt động (ví dụ: "10 / trang").
   */
  public async getPageSizeText(): Promise<string> {
    await this.pageSizeItem.waitFor({ state: 'visible' });
    return (await this.pageSizeItem.innerText()).trim();
  }

  /**
   * Thực hiện tìm kiếm bằng cách nhập tên vào ô tìm kiếm và nhấn Enter.
   */
  public async searchPricing(name: string): Promise<void> {
    await this.fill(this.searchInput, name);
    await this.searchInput.press('Enter');
    // Chờ một khoảng thời gian ngắn để bảng dữ liệu cập nhật
    await this.page.waitForTimeout(1000);
  }

  /**
   * Lấy danh sách tên bảng giá từ cột "Tên bảng giá" (index 1).
   */
  public async getPricingNames(): Promise<string[]> {
    const count = await this.getRowsCount();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i);
      // Index 1 tương ứng cột "Tên bảng giá"
      const cell = row.locator('td').nth(1);
      const text = await cell.innerText();
      names.push(text.trim());
    }
    return names;
  }

  /**
   * Chọn trạng thái trong bộ lọc Trạng thái.
   * @param status 'Kích hoạt' hoặc 'Ngừng kích hoạt'
   */
  public async filterByStatus(status: 'Kích hoạt' | 'Ngừng kích hoạt'): Promise<void> {
    await this.click(this.statusSelect);
    await this.page.waitForTimeout(500);

    const option = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').filter({ hasText: status }).first();
    await this.click(option);
    // Chờ bảng dữ liệu lọc xong
    await this.page.waitForTimeout(1500);
  }

  /**
   * Chọn hình thức trong bộ lọc Hình thức.
   * @param form 'Mua bán' hoặc 'Ký gửi'
   */
  public async filterByForm(form: 'Mua bán' | 'Ký gửi'): Promise<void> {
    await this.click(this.formSelect);
    await this.page.waitForTimeout(500);

    const option = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').filter({ hasText: form }).first();
    await this.click(option);
    // Chờ bảng dữ liệu lọc xong
    await this.page.waitForTimeout(1500);
  }

  /**
   * Lấy danh sách các giá trị của cột "Trạng thái" cho tất cả các hàng hiện tại.
   * Cột "Trạng thái" là cột thứ 7 (index 6).
   */
  public async getStatusColumnValues(): Promise<string[]> {
    const count = await this.getRowsCount();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i);
      // Index 6 tương ứng cột thứ 7 ("Trạng thái")
      const cell = row.locator('td').nth(6);
      const text = await cell.innerText();
      values.push(text.trim());
    }
    return values;
  }

  /**
   * Lọc danh sách bảng giá theo Ngày bắt đầu.
   * @param dateStr Ngày bắt đầu ở định dạng DD/MM/YYYY (ví dụ: '01/03/2026')
   */
  public async filterByStartDate(dateStr: string): Promise<void> {
    await this.click(this.startDateInput);
    await this.fill(this.startDateInput, dateStr);
    await this.startDateInput.press('Enter');
    // Chờ bảng dữ liệu lọc xong
    await this.page.waitForTimeout(1500);
  }

  /**
   * Lấy danh sách văn bản hiển thị trong cột "Thời gian hiệu lực" (index 2).
   */
  public async getValidityColumnValues(): Promise<string[]> {
    const count = await this.getRowsCount();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i);
      // Index 2 tương ứng cột thứ 3 ("Thời gian hiệu lực")
      const cell = row.locator('td').nth(2);
      const text = await cell.innerText();
      values.push(text.trim());
    }
    return values;
  }
}
