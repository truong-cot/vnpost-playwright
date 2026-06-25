import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object cho mục Quản lý Sản phẩm và drawer Thêm sản phẩm.
 */
export class ProductPage extends BasePage {
  // Các Locators
  public readonly addNewButton: Locator;
  public readonly skuInput: Locator;
  public readonly barcodeInput: Locator;
  public readonly addVariantButton: Locator;
  public readonly variantNameInput: Locator;
  public readonly variantValueInput: Locator;

  // Các Locators của các trường bắt buộc
  public readonly nameInput: Locator;
  public readonly categorySelect: Locator;
  public readonly barcodeSettingBtn: Locator;
  public readonly accountantCodeInput: Locator;
  public readonly vatSelect: Locator;
  public readonly unitInput: Locator;
  public readonly confirmButton: Locator;
  public readonly searchSkuInput: Locator;
  public readonly searchNameInput: Locator;
 
  constructor(page: Page) {
    super(page);
    this.addNewButton = this.page.getByRole('button', { name: 'Thêm mới' });
    this.skuInput = this.page.locator('input#form_sku');
    this.barcodeInput = this.page.locator('input#form_barCode');
    this.addVariantButton = this.page.locator('button:has-text("Thêm phân loại")').first();
    this.variantNameInput = this.page.getByPlaceholder('Tên', { exact: true }).first();
    const variantRow = this.page.locator('.ant-row', { has: this.variantNameInput }).first();
    this.variantValueInput = variantRow.locator('input.ant-select-input');
 
    // Khởi tạo các locators của trường bắt buộc
    this.nameInput = this.page.getByPlaceholder('Tên sản phẩm', { exact: true });
    this.categorySelect = this.page.getByRole('combobox', { name: '* Danh mục plus Thêm mới' });
    this.barcodeSettingBtn = this.page.locator('input#form_barCode').locator('..').locator('button');
    this.accountantCodeInput = this.page.getByPlaceholder('Nhập mã kế toán');
    this.vatSelect = this.page.getByRole('combobox', { name: '* VAT' });
    this.unitInput = this.page.getByPlaceholder('VD: ml, hộp, chai, thùng');
    this.confirmButton = this.page.getByRole('button', { name: 'Xác nhận' });
    this.searchSkuInput = this.page.getByPlaceholder('Tìm kiếm theo SKU');
    this.searchNameInput = this.page.getByPlaceholder('Tìm kiếm theo tên');
  }

  /**
   * Click vào nút "Thêm mới" để mở drawer form Thêm sản phẩm.
   */
  public async clickAddNew(): Promise<void> {
    await this.click(this.addNewButton);
  }

  /**
   * Thêm một phân loại/biến thể sản phẩm.
   * @param name Tên phân loại (ví dụ: 'size')
   * @param value Giá trị phân loại (ví dụ: 'S')
   */
  public async addVariant(name: string, value: string): Promise<void> {
    await this.click(this.addVariantButton);
    await this.fill(this.variantNameInput, name);
    
    // Tìm select container trong cùng hàng và click để kích hoạt
    const variantRow = this.page.locator('.ant-row', { has: this.variantNameInput }).first();
    const selectBox = variantRow.locator('.ant-select').first();
    await this.click(selectBox, { force: true });

    // Sau khi kích hoạt, điền giá trị và nhấn Enter
    await this.fill(this.variantValueInput, value);
    await this.variantValueInput.press('Enter');
  }

  /**
   * Điền thông tin và gửi form tạo sản phẩm với đầy đủ các trường bắt buộc.
   */
  public async createProduct(data: {
    name: string;
    category: string;
    sku: string;
    accountantCode: string;
    vat: string;
    unit: string;
    productType?: string;
    distributionType?: string;
  }): Promise<void> {
    await this.fill(this.nameInput, data.name);
    
    // Chọn danh mục (tìm kiếm combobox và click chọn)
    await this.click(this.categorySelect);
    await this.categorySelect.fill(data.category);
    
    // Sửa lỗi: Định vị và click chọn danh mục theo vai trò 'treeitem'
    await this.page.getByRole('treeitem', { name: data.category }).first().click();

    await this.fill(this.skuInput, data.sku);

    // Tự động tạo barcode bằng nút cài đặt bên cạnh
    await this.click(this.barcodeSettingBtn);

    await this.fill(this.accountantCodeInput, data.accountantCode);

    // Chọn VAT (click combobox và chọn)
    await this.click(this.vatSelect);
    await this.page.locator('.ant-select-item-option').filter({ hasText: data.vat }).first().click();

    // Chọn Loại sản phẩm nếu được chỉ định
    if (data.productType) {
      await this.page.getByRole('radio', { name: data.productType }).click();
    }

    // Chọn Hình thức phân phối nếu được chỉ định
    if (data.distributionType) {
      await this.page.getByRole('radio', { name: data.distributionType }).click();
    }

    // Điền đơn vị tính
    await this.fill(this.unitInput, data.unit);

    // Gửi form xác nhận
    await this.click(this.confirmButton);
  }

  /**
   * Click vào nút "Thêm đơn vị quy đổi".
   */
  public async clickAddConversionUnit(): Promise<void> {
    const btn = this.page.locator('button:has-text("Thêm đơn vị quy đổi")');
    await this.click(btn);
    await this.page.waitForTimeout(500);
  }

  /**
   * Điền thông tin hàng quy đổi tại một chỉ mục hàng cụ thể.
   */
  public async fillConversionRow(index: number, data: {
    name: string;
    quantity: string;
    baseUnit?: string;
    sku: string;
  }): Promise<void> {
    const rows = this.page.locator('#config-units table tbody tr');
    const row = rows.nth(index);

    // 1. Tên đơn vị quy đổi
    await this.fill(row.locator('input[placeholder="Nhập tên đơn vị"]'), data.name);

    // 2. Số lượng quy đổi
    await this.fill(row.locator('input[placeholder="Nhập số lượng"]'), data.quantity);

    // 3. Đơn vị quy đổi gốc
    if (data.baseUnit) {
      await this.click(row.locator('.ant-select').first(), { force: true });
      await this.page.waitForTimeout(500);
      
      const dropdownOption = this.page.locator('.ant-select-dropdown').filter({ visible: true })
        .locator('.ant-select-item-option, .ant-select-item')
        .filter({ hasText: data.baseUnit }).first();
      await this.click(dropdownOption);
      await this.page.waitForTimeout(200);
    }

    // 4. SKU
    await this.fill(row.locator('input[placeholder="Nhập SKU"]'), data.sku);

    // 5. Barcode (tự động tạo)
    await this.click(row.locator('span.ant-input-affix-wrapper button').first());
    await this.page.waitForTimeout(200);
  }

  /**
   * Tìm kiếm sản phẩm theo SKU.
   */
  public async searchBySku(sku: string): Promise<void> {
    await this.fill(this.searchSkuInput, sku);
    await this.searchSkuInput.press('Enter');
    // Chờ danh sách tải lại dữ liệu lọc
    await this.page.waitForTimeout(1000);
  }

  /**
   * Tìm kiếm sản phẩm theo tên.
   */
  public async searchByName(name: string): Promise<void> {
    await this.fill(this.searchNameInput, name);
    await this.searchNameInput.press('Enter');
    // Chờ danh sách tải lại dữ liệu lọc
    await this.page.waitForTimeout(1000);
  }

  /**
   * Lọc danh sách sản phẩm theo Trạng thái.
   * @param status 'Kích hoạt' hoặc 'Ngừng kích hoạt'
   */
  public async filterByStatus(status: 'Kích hoạt' | 'Ngừng kích hoạt'): Promise<void> {
    const statusSelect = this.page.locator('.ant-select').filter({ hasText: 'Trạng thái' }).first();
    await this.click(statusSelect);
    await this.page.waitForTimeout(500);

    const option = this.page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: status }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    // Chờ bảng dữ liệu lọc xong
    await this.page.waitForTimeout(1500);
  }

  /**
   * Lọc danh sách sản phẩm theo Hình thức phân phối.
   * @param form 'Mua bán' hoặc 'Ký gửi'
   */
  public async filterByDistributionForm(form: 'Mua bán' | 'Ký gửi'): Promise<void> {
    const formSelect = this.page.locator('.ant-select').filter({ hasText: 'Chọn hình thức phân phối' }).first();
    await this.click(formSelect);
    await this.page.waitForTimeout(500);

    const option = this.page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: form }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    // Chờ bảng dữ liệu lọc xong
    await this.page.waitForTimeout(1500);
  }
}
