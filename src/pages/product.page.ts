import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for Product management and Add Product drawer.
 */
export class ProductPage extends BasePage {
  // Locators
  public readonly addNewButton: Locator;
  public readonly skuInput: Locator;
  public readonly barcodeInput: Locator;
  public readonly addVariantButton: Locator;
  public readonly variantNameInput: Locator;
  public readonly variantValueInput: Locator;

  // Required fields locators
  public readonly nameInput: Locator;
  public readonly categorySelect: Locator;
  public readonly barcodeSettingBtn: Locator;
  public readonly accountantCodeInput: Locator;
  public readonly vatSelect: Locator;
  public readonly unitInput: Locator;
  public readonly confirmButton: Locator;
  public readonly searchSkuInput: Locator;

  constructor(page: Page) {
    super(page);
    this.addNewButton = this.page.getByRole('button', { name: 'Thêm mới' });
    this.skuInput = this.page.locator('input#form_sku');
    this.barcodeInput = this.page.locator('input#form_barCode');
    this.addVariantButton = this.page.locator('button:has-text("Thêm phân loại")').first();
    this.variantNameInput = this.page.getByPlaceholder('Tên', { exact: true }).first();
    const variantRow = this.page.locator('.ant-row', { has: this.variantNameInput }).first();
    this.variantValueInput = variantRow.locator('input.ant-select-input');

    // Initialize required fields locators
    this.nameInput = this.page.getByPlaceholder('Tên sản phẩm', { exact: true });
    this.categorySelect = this.page.getByRole('combobox', { name: '* Danh mục plus Thêm mới' });
    this.barcodeSettingBtn = this.page.locator('input#form_barCode').locator('..').locator('button');
    this.accountantCodeInput = this.page.getByPlaceholder('Nhập mã kế toán');
    this.vatSelect = this.page.getByRole('combobox', { name: '* VAT' });
    this.unitInput = this.page.getByPlaceholder('VD: ml, hộp, chai, thùng');
    this.confirmButton = this.page.getByRole('button', { name: 'Xác nhận' });
    this.searchSkuInput = this.page.getByPlaceholder('Tìm kiếm theo SKU');
  }

  /**
   * Clicks the "Thêm mới" button to open the Add Product drawer.
   */
  public async clickAddNew(): Promise<void> {
    await this.click(this.addNewButton);
  }

  /**
   * Adds a product classification/variant.
   * @param name The classification name (e.g. 'size')
   * @param value The classification value (e.g. 'S')
   */
  public async addVariant(name: string, value: string): Promise<void> {
    await this.click(this.addVariantButton);
    await this.fill(this.variantNameInput, name);
    
    // Locate the select container within the same row and click to activate it
    const variantRow = this.page.locator('.ant-row', { has: this.variantNameInput }).first();
    const selectBox = variantRow.locator('.ant-select').first();
    await this.click(selectBox, { force: true });

    // Now that it is active, fill the value and press Enter
    await this.fill(this.variantValueInput, value);
    await this.variantValueInput.press('Enter');
  }

  /**
   * Fills and submits the product creation form with all required fields.
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
    
    // Select category (combobox search and select)
    await this.click(this.categorySelect);
    await this.categorySelect.fill(data.category);
    
    // Fix: Locate and click the category using the 'treeitem' role
    await this.page.getByRole('treeitem', { name: data.category }).first().click();

    await this.fill(this.skuInput, data.sku);

    // Auto-generate barcode using the setting button
    await this.click(this.barcodeSettingBtn);

    await this.fill(this.accountantCodeInput, data.accountantCode);

    // Select VAT (combobox click and select)
    await this.click(this.vatSelect);
    await this.page.locator('.ant-select-item-option').filter({ hasText: data.vat }).first().click();

    // Select Product Type if specified
    if (data.productType) {
      await this.page.getByRole('radio', { name: data.productType }).click();
    }

    // Select Distribution Type if specified
    if (data.distributionType) {
      await this.page.getByRole('radio', { name: data.distributionType }).click();
    }

    // Fill unit input
    await this.fill(this.unitInput, data.unit);

    // Submit form
    await this.click(this.confirmButton);
  }

  /**
   * Clicks the "Thêm đơn vị quy đổi" button.
   */
  public async clickAddConversionUnit(): Promise<void> {
    const btn = this.page.locator('button:has-text("Thêm đơn vị quy đổi")');
    await this.click(btn);
    await this.page.waitForTimeout(500);
  }

  /**
   * Fills a conversion unit row at a specific index.
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

    // 5. Barcode (auto-generate)
    await this.click(row.locator('span.ant-input-affix-wrapper button').first());
    await this.page.waitForTimeout(200);
  }

  /**
   * Searches for a product by its SKU.
   */
  public async searchBySku(sku: string): Promise<void> {
    await this.fill(this.searchSkuInput, sku);
    await this.searchSkuInput.press('Enter');
    // Wait for list to reload
    await this.page.waitForTimeout(1000);
  }
}

