import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object cho mục Quản lý Khách hàng.
 */
export class CustomerPage extends BasePage {
  // Các Locators
  public readonly addNewButton: Locator;
  public readonly nameInput: Locator;
  public readonly phoneInput: Locator;
  public readonly confirmButton: Locator;
  public readonly cancelButton: Locator;
  public readonly searchInput: Locator;

  // Thông tin cơ bản
  public readonly emailInput: Locator;
  public readonly genderDropdown: Locator;
  public readonly dobInput: Locator;
  public readonly avatarInput: Locator;

  // Thông tin xuất hoá đơn
  public readonly taxCodeInput: Locator;
  public readonly invoiceCompanyInput: Locator;
  public readonly invoiceNameInput: Locator;
  public readonly idNumberInput: Locator;
  public readonly invoicePhoneInput: Locator;
  public readonly invoiceEmailInput: Locator;
  public readonly invoiceAddressInput: Locator;

  // Địa chỉ liên hệ
  public readonly addressInput: Locator;
  public readonly facebookInput: Locator;
  public readonly zaloInput: Locator;

  constructor(page: Page) {
    super(page);
    this.addNewButton = this.page.getByRole('button', { name: 'Thêm khách hàng' });
    this.nameInput = this.page.locator('input#customerName');
    this.phoneInput = this.page.locator('input#customerPhone');
    this.confirmButton = this.page.getByRole('button', { name: 'Hoàn thành' });
    this.cancelButton = this.page.getByRole('button', { name: 'Hủy' });
    this.searchInput = this.page.getByPlaceholder('Tên / số điện thoại khách hàng');

    // Thông tin cơ bản
    this.emailInput = this.page.locator('input#customerEmail');
    this.genderDropdown = this.page.locator('input#customerGender');
    this.dobInput = this.page.locator('input#customerDob');
    this.avatarInput = this.page.locator('input[type="file"]');

    // Thông tin xuất hoá đơn
    this.taxCodeInput = this.page.locator('input#taxCode');
    this.invoiceCompanyInput = this.page.locator('input#invoiceCompanyName');
    this.invoiceNameInput = this.page.locator('input#invoiceCustomerName');
    this.idNumberInput = this.page.locator('input#idNumber');
    this.invoicePhoneInput = this.page.locator('input#invoiceCustomerPhone');
    this.invoiceEmailInput = this.page.locator('input#invoiceCustomerEmail');
    this.invoiceAddressInput = this.page.locator('textarea#invoiceCustomerAddress');

    // Địa chỉ liên hệ
    this.addressInput = this.page.locator('input#customerAddress');
    this.facebookInput = this.page.locator('input#customerFacebook');
    this.zaloInput = this.page.locator('input#customerZalo');
  }

  /**
   * Click vào nút "Thêm khách hàng" để mở drawer form.
   * 1. Scroll lên top ngay lập tức (instant) — tránh smooth scroll gây hover lên header.
   * 2. Di chuyển chuột ra khỏi vùng header trước khi click.
   * 3. Click nút sau khi trang đã ổn định.
   */
  public async clickAddNew(): Promise<void> {
    // Scroll instant để tránh animation gây hover lên header dropdown
    await this.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await this.page.waitForFunction(() => window.scrollY === 0, { timeout: 5000 });
    // Di chuyển chuột xuống vùng an toàn (dưới header ~80px) trước khi click
    await this.page.mouse.move(200, 200);
    await this.click(this.addNewButton);
  }

  /**
   * Điền thông tin và gửi form tạo khách hàng mới (trường bắt buộc).
   */
  public async createCustomer(name: string, phone: string): Promise<void> {
    await this.fill(this.nameInput, name);
    await this.fill(this.phoneInput, phone);
    await this.click(this.confirmButton);
  }

  /**
   * Điền một số thông tin vào form rồi click Hủy (không lưu).
   */
  public async cancelCustomer(name: string, phone: string): Promise<void> {
    await this.fill(this.nameInput, name);
    await this.fill(this.phoneInput, phone);
    await this.click(this.cancelButton);
  }

  /**
   * Tạo khách hàng với đầy đủ thông tin: thông tin cơ bản, thông tin xuất hóa đơn và địa chỉ liên hệ.
   */
  public async createCustomerFull(details: {
    name: string;
    phone: string;
    email?: string;
    gender?: string; // Nam / Nữ / Khác
    dob?: string; // DD/MM/YYYY
    avatarPath?: string;
    taxCode?: string;
    invoiceCompany?: string;
    invoiceName?: string;
    idNumber?: string;
    invoicePhone?: string;
    invoiceEmail?: string;
    invoiceAddress?: string;
    address?: string;
    facebook?: string;
    zalo?: string;
  }): Promise<void> {
    // 1. Nhập Thông tin cơ bản
    await this.fill(this.nameInput, details.name);
    await this.fill(this.phoneInput, details.phone);
    if (details.email) await this.fill(this.emailInput, details.email);
    if (details.gender) {
      await this.click(this.genderDropdown);
      const option = this.page.locator('.ant-select-item-option-content').filter({ hasText: details.gender }).first();
      await this.click(option);
    }
    if (details.dob) {
      await this.fill(this.dobInput, details.dob);
      await this.dobInput.press('Escape');
    }
    if (details.avatarPath) {
      await this.avatarInput.setInputFiles(details.avatarPath);
      // Xử lý modal "Chỉnh sửa ảnh" xuất hiện sau khi upload
      const cropModal = this.page.getByRole('dialog', { name: 'Chỉnh sửa ảnh' });
      await cropModal.waitFor({ state: 'visible', timeout: 5000 });
      await cropModal.getByRole('button', { name: 'Đồng ý' }).click();
      await cropModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    // 2. Nhập Thông tin xuất hóa đơn
    if (details.taxCode) await this.fill(this.taxCodeInput, details.taxCode);
    if (details.invoiceCompany) await this.fill(this.invoiceCompanyInput, details.invoiceCompany);
    if (details.invoiceName) await this.fill(this.invoiceNameInput, details.invoiceName);
    if (details.idNumber) await this.fill(this.idNumberInput, details.idNumber);
    if (details.invoicePhone) await this.fill(this.invoicePhoneInput, details.invoicePhone);
    if (details.invoiceEmail) await this.fill(this.invoiceEmailInput, details.invoiceEmail);
    if (details.invoiceAddress) await this.fill(this.invoiceAddressInput, details.invoiceAddress);

    // 3. Nhập Địa chỉ liên hệ và mạng xã hội
    if (details.address) await this.fill(this.addressInput, details.address);
    if (details.facebook) await this.fill(this.facebookInput, details.facebook);
    if (details.zalo) await this.fill(this.zaloInput, details.zalo);

    // 4. Click Hoàn thành
    await this.click(this.confirmButton);
  }

  /**
   * Tìm kiếm khách hàng theo từ khóa (Tên hoặc Số điện thoại).
   */
  public async searchCustomer(query: string): Promise<void> {
    await this.fill(this.searchInput, query);
    await this.searchInput.press('Enter');
    // Chờ danh sách tải lại dữ liệu lọc
    await this.page.waitForTimeout(1000);
  }

  /**
   * Lấy số điện thoại của khách hàng đầu tiên trong bảng danh sách.
   * Cột SĐT là cột thứ 4 (index 3, sau #, Mã KH, Tên KH).
   * @returns Chuỗi số điện thoại (đã trim khoảng trắng)
   */
  public async getFirstCustomerPhone(): Promise<string> {
    // Chờ bảng có ít nhất 1 dòng dữ liệu
    const firstRow = this.page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 10_000 });
    // SĐT nằm ở cột thứ 4 (td:nth-child(4))
    const phoneCell = firstRow.locator('td').nth(3);
    const phone = (await phoneCell.textContent()) || '';
    return phone.trim();
  }
}

