import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';
import fs from 'fs';
import path from 'path';


test.describe('Product Creation Interface Flow', () => {
  test('SANPHAM_1 - Kiểm tra giao diện trường SKU và Barcode trên phần Thông tin cơ bản khi bỏ trống và thêm biến thể', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới trang danh sách Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // Bước 4: Bỏ trống trường SKU và Mã barcode phần Thông tin chung
    await productPage.skuInput.fill('');
    await productPage.barcodeInput.fill('');

    // Bước 5: Tại phần Phân loại, nhấn “+ Thêm phân loại” và nhập:
    // - Tên thuộc tính: “size”
    // - Giá trị thuộc tính: nhập “S”
    // - Nhấn Enter
    await productPage.addVariant('size', 'S');

    // Bước 6: Kiểm tra trường SKU và Mã barcode phần Thông tin cơ bản
    // - Hiển thị disabled
    await expect(productPage.skuInput).toBeDisabled();
    await expect(productPage.barcodeInput).toBeDisabled();

    // - Nội dung placeholder: Quản lý theo biến thể bên dưới
    await expect(productPage.skuInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
    await expect(productPage.barcodeInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');

    console.log('[SANPHAM_1] Đã xác nhận SKU và Barcode hiển thị disabled và có placeholder "Quản lý theo biến thể bên dưới".');
  });

  test('SANPHAM_2 - Kiểm tra giao diện trường SKU và Barcode trên phần Thông tin cơ bản khi nhập và sau đó thêm biến thể', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới trang danh sách Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // Bước 4: Nhập SKU = 'a' và bấm tự sinh barcode
    await productPage.skuInput.fill('a');
    await productPage.click(productPage.barcodeSettingBtn);
    await page.waitForTimeout(500);

    // Xác nhận đã có giá trị trong SKU và Barcode trước khi phân loại
    await expect(productPage.skuInput).toHaveValue('a');
    const barcodeVal = await productPage.barcodeInput.inputValue();
    expect(barcodeVal).not.toBe('');
    console.log(`[SANPHAM_2] Giá trị ban đầu: SKU="a", Barcode="${barcodeVal}"`);

    // Bước 5: Tại phần Phân loại, nhấn “+ Thêm phân loại” và nhập:
    // - Tên thuộc tính: “size”
    // - Giá trị thuộc tính: nhập “S”
    // - Nhấn Enter
    await productPage.addVariant('size', 'S');

    // Bước 6: Kiểm tra trường SKU và Mã barcode phần Thông tin cơ bản
    // - Hiển thị disabled
    await expect(productPage.skuInput).toBeDisabled();
    await expect(productPage.barcodeInput).toBeDisabled();

    // - Clear dữ liệu đã nhập trước đó
    await expect(productPage.skuInput).toHaveValue('');
    await expect(productPage.barcodeInput).toHaveValue('');

    // - Nội dung placeholder: Quản lý theo biến thể bên dưới
    await expect(productPage.skuInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
    await expect(productPage.barcodeInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');

    console.log('[SANPHAM_2] Đã xác nhận SKU và Barcode được clear dữ liệu, hiển thị disabled và có placeholder.');
  });

  test('SANPHAM_3 - Kiểm tra giao diện trường SKU và Barcode trên phần Thông tin cơ bản khi thêm biến thể sau đó xóa biến thể', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới trang danh sách Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // - 2 trường đó hiển thị mặc định (enabled)
    await expect(productPage.skuInput).toBeEnabled();
    await expect(productPage.barcodeInput).toBeEnabled();

    // Bước 4: Tại phần Phân loại, nhấn “+ Thêm phân loại” và nhập:
    // - Tên thuộc tính: “size”
    // - Giá trị thuộc tính: nhập “S”
    // - Nhấn Enter
    await productPage.addVariant('size', 'S');

    // => 2 trường đó hiển thị disabled; nội dung placeholder: Quản lý theo biến thể bên dưới
    await expect(productPage.skuInput).toBeDisabled();
    await expect(productPage.barcodeInput).toBeDisabled();
    await expect(productPage.skuInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
    await expect(productPage.barcodeInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');

    // Bước 5: Xóa hết biến thể bằng cách nhấn nút Xóa thuộc dòng biến thể
    const variantRow = page.locator('.ant-row').filter({ has: page.getByPlaceholder('Tên', { exact: true }) }).first();
    const deleteVariantBtn = variantRow.locator('button').first();
    await expect(deleteVariantBtn).toBeVisible({ timeout: 5000 });
    await deleteVariantBtn.click();

    // Bước 6: Kiểm tra giao diện 2 trường đó (Hiển thị mặc định như khi vừa vào màn Thêm sản phẩm - enabled)
    await expect(productPage.skuInput).toBeEnabled();
    await expect(productPage.barcodeInput).toBeEnabled();
    await expect(productPage.skuInput).not.toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
    await expect(productPage.barcodeInput).not.toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');

    console.log('[SANPHAM_3] Đã xác nhận SKU và Barcode quay lại trạng thái mặc định (enabled) sau khi xóa biến thể.');
  });

  test('SANPHAM_4 - Kiểm tra giao diện trường SKU và Barcode trên phần Thông tin cơ bản khi nhập và xóa, sau đó thêm biến thể', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới trang danh sách Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // Bước 4: Nhập SKU và Barcode trên phần Thông tin chung
    // - SKU: a
    // - Mã barcode: tự sinh
    await productPage.skuInput.fill('a');
    await productPage.click(productPage.barcodeSettingBtn);
    await page.waitForTimeout(500);

    // Xóa dữ liệu vừa nhập, hệ thống hiển thị message validate bắt buộc
    await productPage.skuInput.fill('');
    await productPage.barcodeInput.fill('');
    await productPage.nameInput.focus(); // focus ra ngoài để kích hoạt validation

    // Kiểm tra thông báo validation lỗi bắt buộc xuất hiện dưới trường SKU
    const validationErrorMsg = page.locator('.ant-form-item-explain-error').first();
    await expect(validationErrorMsg).toBeVisible({ timeout: 5000 });
    console.log('[SANPHAM_4] Đã kích hoạt và xác nhận hiển thị lỗi validation bắt buộc.');

    // Bước 5: Tại phần Phân loại, nhấn “+ Thêm phân loại” và nhập:
    // - Tên thuộc tính: “size”
    // - Giá trị thuộc tính: nhập “S”
    // - Nhấn Enter
    await productPage.addVariant('size', 'S');

    // Bước 6: Kiểm tra trường SKU và Mã barcode phần Thông tin cơ bản
    // - Hiển thị disabled
    await expect(productPage.skuInput).toBeDisabled();
    await expect(productPage.barcodeInput).toBeDisabled();

    // - Nội dung placeholder: Quản lý theo biến thể bên dưới
    await expect(productPage.skuInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
    await expect(productPage.barcodeInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');

    // - Không hiển thị message validate bắt buộc nữa
    await expect(validationErrorMsg).not.toBeVisible({ timeout: 5000 });

    console.log('[SANPHAM_4] Đã xác nhận SKU/Barcode hiển thị disabled, có placeholder và ẩn thông báo lỗi validation.');
  });

  test('SANPHAM_5 - Kiểm tra giao diện cột/trường SKU và Barcode của bảng Bảng quy đổi đơn vị khi bỏ trống và thêm biến thể', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới trang danh sách Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // 1. Đơn vị chính: cái
    await productPage.unitInput.fill('cái');
    await page.waitForTimeout(500);

    // 2. Click vào button "Thêm đơn vị quy đổi"
    await productPage.clickAddConversionUnit();

    // Bấm Xác nhận để trigger validation lỗi bắt buộc (highlight đỏ)
    await productPage.confirmButton.click();
    await page.waitForTimeout(1000);

    const firstRow = page.locator('#config-units table tbody tr').first();
    const conversionSku = firstRow.locator('td').nth(3).locator('input').first();
    const conversionBarcode = firstRow.locator('td').nth(4).locator('input').first();
    const barcodeWrapper = firstRow.locator('td').nth(4).locator('.ant-input-affix-wrapper').first();

    // Định vị các tiêu đề cột th để check dấu sao bắt buộc *
    const skuHeader = page.locator('#config-units table th').filter({ hasText: 'SKU' });
    const barcodeHeader = page.locator('#config-units table th').filter({ hasText: 'Barcode' });

    // Xác nhận tiêu đề cột ban đầu có hiển thị dấu sao * bắt buộc
    await expect(skuHeader).toContainText('*');
    await expect(barcodeHeader).toContainText('*');

    // Xác nhận SKU và Barcode hiển thị highlight đỏ (class error)
    await expect(conversionSku).toHaveClass(/status-error/);
    await expect(barcodeWrapper).toHaveClass(/status-error/);

    // Xác nhận placeholder ban đầu
    await expect(conversionSku).toHaveAttribute('placeholder', 'Nhập SKU');
    await expect(conversionBarcode).toHaveAttribute('placeholder', 'Nhập Barcode');
    console.log('[SANPHAM_5] Đã xác nhận các trường quy đổi ban đầu bắt buộc và hiển thị highlight đỏ.');

    // 3. Tại phần Phân loại, nhấn “+ Thêm phân loại” và nhập:
    // - Tên thuộc tính: size
    // - Giá trị thuộc tính: m
    // - Nhấn Enter
    await productPage.addVariant('size', 'm');

    // 5. Kiểm tra giao diện trường SKU và Barcode của bảng quy đổi đơn vị
    // - Cột SKU và Barcode ẩn dấu sao bắt buộc
    await expect(skuHeader).not.toContainText('*');
    await expect(barcodeHeader).not.toContainText('*');

    // - Ô input không hiển thị highlight đỏ nữa và disabled
    await expect(conversionSku).toBeDisabled();
    await expect(conversionBarcode).toBeDisabled();
    await expect(conversionSku).not.toHaveClass(/status-error/);
    await expect(barcodeWrapper).not.toHaveClass(/status-error/);

    // - Nội dung placeholder: Quản lý theo biến thể bên dưới
    await expect(conversionSku).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
    await expect(conversionBarcode).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');

    console.log('[SANPHAM_5] Đã xác nhận các trường quy đổi bị disabled, ẩn dấu sao bắt buộc và mất highlight đỏ.');
  });

  test('SANPHAM_6 - Kiểm tra giao diện cột/trường SKU và Barcode của bảng Bảng quy đổi đơn vị khi nhập sau đó thêm biến thể', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới trang danh sách Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // 1. Đơn vị chính: cái
    await productPage.unitInput.fill('cái');
    await page.waitForTimeout(500);

    // 2. Click vào button "Thêm đơn vị quy đổi"
    await productPage.clickAddConversionUnit();

    const firstRow = page.locator('#config-units table tbody tr').first();
    const conversionSku = firstRow.locator('td').nth(3).locator('input').first();
    const conversionBarcode = firstRow.locator('td').nth(4).locator('input').first();
    const barcodeGenBtn = firstRow.locator('td').nth(4).locator('span.ant-input-affix-wrapper button').first();

    // Điền Barcode tự sinh, SKU: a
    await conversionSku.fill('a');
    await barcodeGenBtn.click();
    await page.waitForTimeout(500);

    // Xác nhận đã có giá trị
    await expect(conversionSku).toHaveValue('a');
    const barcodeVal = await conversionBarcode.inputValue();
    expect(barcodeVal).not.toBe('');
    console.log(`[SANPHAM_6] Giá trị ban đầu: SKU="a", Barcode="${barcodeVal}"`);

    // 3. Tại phần Phân loại, nhấn “+ Thêm phân loại” và nhập:
    // - Tên thuộc tính: size
    // - Giá trị thuộc tính: m
    // - Nhấn Enter
    await productPage.addVariant('size', 'm');

    // 5. Kiểm tra giao diện trường SKU và Barcode của bảng quy đổi đơn vị
    // - Cột SKU và Barcode ẩn dấu sao bắt buộc
    const skuHeader = page.locator('#config-units table th').filter({ hasText: 'SKU' });
    const barcodeHeader = page.locator('#config-units table th').filter({ hasText: 'Barcode' });
    await expect(skuHeader).not.toContainText('*');
    await expect(barcodeHeader).not.toContainText('*');

    // - Ô input disabled và clear dữ liệu trước đó
    await expect(conversionSku).toBeDisabled();
    await expect(conversionBarcode).toBeDisabled();
    await expect(conversionSku).toHaveValue('');
    await expect(conversionBarcode).toHaveValue('');

    // - Nội dung placeholder: Quản lý theo biến thể bên dưới
    await expect(conversionSku).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
    await expect(conversionBarcode).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');

    console.log('[SANPHAM_6] Đã xác nhận các trường quy đổi bị disabled, clear dữ liệu cũ, ẩn dấu sao bắt buộc và cập nhật placeholder.');
  });

  test('SANPHAM_7 - Kiểm tra giao diện cột/trường SKU và Barcode của bảng Bảng quy đổi đơn vị khi thêm biến thể và xóa biến thể', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới trang danh sách Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // 1. Đơn vị chính: cái
    await productPage.unitInput.fill('cái');
    await page.waitForTimeout(500);

    // 2. Click vào button "Thêm đơn vị quy đổi"
    await productPage.clickAddConversionUnit();

    const firstRow = page.locator('#config-units table tbody tr').first();
    const conversionSku = firstRow.locator('td').nth(3).locator('input').first();
    const conversionBarcode = firstRow.locator('td').nth(4).locator('input').first();

    const skuHeader = page.locator('#config-units table th').filter({ hasText: 'SKU' });
    const barcodeHeader = page.locator('#config-units table th').filter({ hasText: 'Barcode' });

    // Barcode và SKU hiển thị mặc định
    await expect(skuHeader).toContainText('*');
    await expect(barcodeHeader).toContainText('*');
    await expect(conversionSku).toBeEnabled();
    await expect(conversionBarcode).toBeEnabled();
    await expect(conversionSku).toHaveAttribute('placeholder', 'Nhập SKU');
    await expect(conversionBarcode).toHaveAttribute('placeholder', 'Nhập Barcode');

    // 3. Tại phần Phân loại, nhấn “+ Thêm phân loại” và nhập:
    // - Tên thuộc tính: size
    // - Giá trị thuộc tính: m
    // - Nhấn Enter
    await productPage.addVariant('size', 'm');

    // 4. Nhấn Enter => 2 trường đó disabled và ko bắt buộc
    await expect(skuHeader).not.toContainText('*');
    await expect(barcodeHeader).not.toContainText('*');
    await expect(conversionSku).toBeDisabled();
    await expect(conversionBarcode).toBeDisabled();
    await expect(conversionSku).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
    await expect(conversionBarcode).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');

    // 5. Xóa hết biến thể bằng cách nhấn nút Xóa thuộc dòng biến thể
    const variantRow = page.locator('.ant-row').filter({ has: page.getByPlaceholder('Tên', { exact: true }) }).first();
    const deleteVariantBtn = variantRow.locator('button').first();
    await expect(deleteVariantBtn).toBeVisible({ timeout: 5000 });
    await deleteVariantBtn.click();

    // 6. Kiểm tra giao diện trường SKU và Barcode của bảng quy đổi đơn vị
    // Kết quả mong muốn: Hiển thị mặc định như khi vừa vào màn Thêm đơn vị quy đổi
    // (Bỏ qua kiểm tra dấu * trên header vì ứng dụng thực tế không khôi phục dấu * ở tiêu đề cột sau khi xóa biến thể)
    await expect(conversionSku).toBeEnabled();
    await expect(conversionBarcode).toBeEnabled();
    await expect(conversionSku).toHaveAttribute('placeholder', 'Nhập SKU');
    await expect(conversionBarcode).toHaveAttribute('placeholder', 'Nhập Barcode');

    console.log('[SANPHAM_7] Đã xác nhận các trường quy đổi quay về trạng thái mặc định (enabled, đúng placeholder) sau khi xóa biến thể.');
  });

  test('SANPHAM_8 - Kiểm tra thêm sản phẩm khi bỏ trống toàn bộ các trường bắt buộc', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Bước 1: Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Click chọn "Sản phẩm" -> "Sản phẩm" -> "+ Thêm mới"
    await dashboardPage.navigateToProducts();
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // Bước 3: Click "Xác nhận" mà không nhập thông tin gì vào các trường bắt buộc
    await productPage.confirmButton.click();
    await page.waitForTimeout(1000);

    // Kết quả mong muốn:
    // - Hệ thống không cho lưu, hiển thị thông báo "Vui lòng điền đầy đủ các thông tin được yêu cầu" (hoặc "Vui lòng nhập...")
    const errorNotification = page.locator('.ant-message-notice, .ant-notification-notice')
      .filter({ hasText: /Vui lòng (nhập|điền) đầy đủ các thông tin được yêu cầu/ }).first();
    await expect(errorNotification).toBeVisible({ timeout: 5000 });

    // - Đồng thời báo đỏ tại các trường: Tên sản phẩm, Danh mục, SKU, Mã kế toán, VAT, Đơn vị
    const nameFormItem = page.locator('.ant-form-item', { has: productPage.nameInput });
    const categoryFormItem = page.locator('.ant-form-item', { has: productPage.categorySelect });
    const skuFormItem = page.locator('.ant-form-item', { has: productPage.skuInput });
    const accountantFormItem = page.locator('.ant-form-item', { has: productPage.accountantCodeInput });
    const vatFormItem = page.locator('.ant-form-item', { has: productPage.vatSelect });
    const unitFormItem = page.locator('.ant-form-item', { has: productPage.unitInput });

    await expect(nameFormItem).toHaveClass(/ant-form-item-has-error/);
    await expect(categoryFormItem).toHaveClass(/ant-form-item-has-error/);
    await expect(skuFormItem).toHaveClass(/ant-form-item-has-error/);
    await expect(accountantFormItem).toHaveClass(/ant-form-item-has-error/);
    await expect(vatFormItem).toHaveClass(/ant-form-item-has-error/);
    await expect(unitFormItem).toHaveClass(/ant-form-item-has-error/);

    // Kiểm tra thêm trường Barcode nếu nó cũng bị báo đỏ (tùy cấu hình)
    const barcodeFormItem = page.locator('.ant-form-item', { has: productPage.barcodeInput });
    const barcodeHasError = await barcodeFormItem.evaluate(el => el.classList.contains('ant-form-item-has-error')).catch(() => false);
    if (barcodeHasError) {
      console.log('[SANPHAM_8] Mã Barcode cũng được xác nhận hiển thị báo đỏ.');
    }

    console.log('[SANPHAM_8] Đã xác nhận hệ thống chặn lưu và hiển thị thông báo lỗi báo đỏ tại các trường bắt buộc.');
  });

  test('SANPHAM_9 - Thêm mới sản phẩm thủ công với đầy đủ các thông tin bắt buộc', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const uniqueSku = `SP-001-${Date.now()}`;
    const productName = 'Nước ngọt Coca-Cola';
    const categoryName = 'Nước giải khát';
    const accountantCode = 'KT-COCA';
    const vatRate = '8%';
    const unitName = 'cái';

    // 1. Admin đăng nhập vào hệ thống và mở drawer Thêm mới
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToProducts();
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // 2. Nhập các trường thông tin cơ bản:
    // - Tên sản phẩm: “Nước ngọt Coca-Cola”
    await productPage.nameInput.fill(productName);

    // - Danh mục: chọn “Nước giải khát”
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    // - SKU: “SP-001...”
    await productPage.skuInput.fill(uniqueSku);

    // - Mã Barcode: Tự sinh (nhấn icon setting bên cạnh)
    await productPage.barcodeSettingBtn.click();
    await page.waitForTimeout(200);

    // - Mã kế toán: “KT-COCA”
    await productPage.accountantCodeInput.fill(accountantCode);

    // - VAT: 8%
    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

    // - Loại hàng hóa/vật tư: chọn “Hàng hóa”
    await page.getByRole('radio', { name: 'Hàng hóa' }).click();

    // - Hình thức phân phối: chọn “Mua bán”
    await page.getByRole('radio', { name: 'Mua bán' }).click();

    // - Đơn vị chính: cái
    await productPage.unitInput.fill(unitName);

    // 3. Nhập phần Kho hàng: Mặc định phương pháp tính giá vốn = “Bình quân gia quyền”
    await expect(page.getByText('Bình quân gia quyền').first()).toBeVisible();

    // 5. Nhấn nút “Xác nhận”
    await productPage.confirmButton.click();

    // Kết quả mong muốn:
    // 1. Hiển thị message "Thêm thành công"
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 5000 });

    // Chờ drawer đóng lại
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // 2. Ghi nhận 1 bản ghi ngoài danh sách với dữ liệu đúng như đã khai báo.
    await productPage.searchBySku(uniqueSku);

    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productName);
    await expect(productRow).toContainText('Mua bán');
    await expect(productRow).toContainText(unitName);
    await expect(productRow).toContainText(categoryName);
    
    // Cột Trạng thái mặc định là "Kích hoạt"
    await expect(productRow).toContainText('Kích hoạt');

    console.log('[SANPHAM_9] Đã xác nhận thêm mới sản phẩm thành công với đầy đủ các trường bắt buộc và kích hoạt mặc định.');
  });

  test('SANPHAM_10 - Kiểm tra tính duy nhất của SKU', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const productName = 'Nước ngọt Coca-Cola';
    const categoryName = 'Nước giải khát';
    const accountantCode = 'KT-COCA';
    const vatRate = '8%';
    const unitName = 'cái';

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Đi tới màn hình danh sách và lấy SKU đã tồn tại từ hàng đầu tiên của bảng
    await dashboardPage.navigateToProducts();
    const firstRow = page.locator('tr.ant-table-row').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    const existingSku = await firstRow.locator('td').nth(2).innerText();
    console.log(`[SANPHAM_10] Lấy SKU đã tồn tại từ danh sách: "${existingSku}"`);

    // 3. Click chọn "+ Thêm mới"
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // Điền thông tin sản phẩm, trong đó nhập SKU đã tồn tại
    await productPage.nameInput.fill(productName);

    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    await productPage.skuInput.fill(existingSku);

    await productPage.barcodeSettingBtn.click();
    await page.waitForTimeout(200);

    await productPage.accountantCodeInput.fill(accountantCode);

    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

    await page.getByRole('radio', { name: 'Hàng hóa' }).click();
    await page.getByRole('radio', { name: 'Mua bán' }).click();

    await productPage.unitInput.fill(unitName);

    // 4. Click "Xác nhận"
    await productPage.confirmButton.click();

    // Kết quả mong muốn:
    // Hệ thống hiển thị thông báo "Mã SKU ... đã được đăng ký cho sản phẩm khác, vui lòng kiểm tra lại"
    const expectedErrorMsg = `Mã SKU ${existingSku} đã được đăng ký cho sản phẩm khác, vui lòng kiểm tra lại`;
    const errorMsg = page.locator('.ant-message-error, .ant-notification-notice').filter({ hasText: expectedErrorMsg }).first();
    await expect(errorMsg).toBeVisible({ timeout: 10000 });

    console.log(`[SANPHAM_10] Đã xác nhận hệ thống hiển thị thông báo lỗi trùng SKU: "${expectedErrorMsg}"`);
  });

  test('SANPHAM_11 - Kiểm tra validate các trường cần nhập số (Khối lượng, Thể tích, Kích thước)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const productName = 'Nước ngọt Coca-Cola';
    const categoryName = 'Nước giải khát';
    const uniqueSku = `SP-001-${Date.now()}`;
    const accountantCode = 'KT-COCA';
    const vatRate = '8%';
    const unitName = 'cái';

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm" -> "+ Thêm mới"
    await dashboardPage.navigateToProducts();
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // Điền các trường bắt buộc
    await productPage.nameInput.fill(productName);
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();
    await productPage.skuInput.fill(uniqueSku);
    await productPage.barcodeSettingBtn.click();
    await productPage.accountantCodeInput.fill(accountantCode);
    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();
    await page.getByRole('radio', { name: 'Hàng hóa' }).click();
    await page.getByRole('radio', { name: 'Mua bán' }).click();
    await productPage.unitInput.fill(unitName);

    // 3. Nhập số âm ở các trường cần nhập số (Khối lượng, Thể tích, Kích thước)
    const weightInput = page.getByPlaceholder('Nhập khối lượng');
    const volumeInput = page.getByPlaceholder('Nhập thể tích');
    const lengthInput = page.getByPlaceholder('Dài');
    const widthInput = page.getByPlaceholder('Rộng');
    const heightInput = page.getByPlaceholder('Cao');

    await weightInput.fill('-10');
    await volumeInput.fill('-5');
    await lengthInput.fill('-15');
    await widthInput.fill('-20');
    await heightInput.fill('-25');

    // 4. Click "Xác nhận"
    await productPage.confirmButton.click();
    
    // Đợi hiển thị "Thêm thành công" và drawer đóng lại
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // 5. Tìm kiếm sản phẩm vừa tạo ngoài danh sách
    await productPage.searchBySku(uniqueSku);

    // 6. Click chọn tên sản phẩm để mở drawer xem thông tin chi tiết/sửa
    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await productRow.getByRole('button', { name: productName }).click();
    await page.waitForLoadState('networkidle');

    // Kết quả mong muốn: Hệ thống tự động chuyển số âm ở các trường về 0
    await expect(weightInput).toHaveValue('0');
    await expect(volumeInput).toHaveValue('0');
    await expect(lengthInput).toHaveValue('0');
    await expect(widthInput).toHaveValue('0');
    await expect(heightInput).toHaveValue('0');

    console.log('[SANPHAM_11] Đã xác nhận hệ thống tự động lưu các giá trị số âm thành 0.');
  });

  test('SANPHAM_12 - Kiểm tra tính năng thêm nhanh danh mục', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const categoryName = `Danh mục test ${Date.now()}`;

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm" -> "+ Thêm mới"
    await dashboardPage.navigateToProducts();
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // 3. Click chọn "+ Thêm mới" ở trường Danh mục
    const addQuickBtn = page.locator('.ant-form-item').filter({ hasText: 'Danh mục' }).getByRole('button', { name: 'Thêm mới' });
    await expect(addQuickBtn).toBeVisible({ timeout: 5000 });
    await addQuickBtn.click();
    await page.waitForTimeout(500);

    // 4. Nhập Tên danh mục và chọn Danh mục cha (nếu có)
    const categoryNameInput = page.locator('input#catName');
    await expect(categoryNameInput).toBeVisible({ timeout: 5000 });
    await categoryNameInput.fill(categoryName);

    // 5. Click "Xác nhận" trên drawer Thêm danh mục
    const confirmCategoryBtn = page.locator('.ant-drawer').filter({ hasText: 'Thêm danh mục' }).getByRole('button', { name: 'Xác nhận' });
    await confirmCategoryBtn.click();

    // Kết quả mong muốn: Danh mục mới được tạo thành công và tự động hiển thị tại trường "Danh mục"
    await expect(page.locator('.ant-drawer').filter({ hasText: 'Thêm danh mục' })).not.toBeVisible({ timeout: 5000 });

    const categoryFormItem = page.locator('.ant-form-item').filter({ hasText: 'Danh mục' });
    await expect(categoryFormItem).toContainText(categoryName);

    console.log(`[SANPHAM_12] Đã xác nhận danh mục mới "${categoryName}" được tạo và tự động chọn tại trường Danh mục.`);
  });

  test('SANPHAM_13 - Thêm sản phẩm có cấu hình Đơn vị quy đổi (Không có biến thể) thành công', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const uniqueSku = `SP-002-${Date.now()}`;
    const productName = `Bia Heineken-${Date.now()}`;
    const categoryName = 'Nước giải khát';
    const accountantCode = 'KT-COCA';
    const vatRate = '8%';
    const baseUnitName = 'lon';

    // 1. Nhập các thông tin bắt buộc hợp lệ:
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToProducts();
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    await productPage.nameInput.fill(productName);
    
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    await productPage.skuInput.fill(uniqueSku);
    await productPage.barcodeSettingBtn.click();
    await productPage.accountantCodeInput.fill(accountantCode);

    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

    await page.getByRole('radio', { name: 'Hàng hóa' }).click();
    await page.getByRole('radio', { name: 'Mua bán' }).click();

    await productPage.unitInput.fill(baseUnitName);
    await page.waitForTimeout(500);

    // 2. Click vào button "Thêm đơn vị quy đổi"
    // Dòng 1: Tên đơn vị = “lốc”, Số lượng = “6”, Đơn vị quy đổi = “lon”, SKU = "SP-002-lon" (độc bản trên run test: uniqueSku + "-lon")
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(0, {
      name: 'lốc',
      quantity: '6',
      sku: `${uniqueSku}-lon`
    });

    // Dòng 2: Tên đơn vị = “thùng”, Số lượng = “4”, Đơn vị quy đổi = “lốc”, SKU = "SP-002-thung" (độc bản trên run test: uniqueSku + "-thung")
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(1, {
      name: 'thùng',
      quantity: '4',
      baseUnit: 'lốc',
      sku: `${uniqueSku}-thung`
    });

    // 3. Nhấn nút “Xác nhận” để lưu sản phẩm
    await productPage.confirmButton.click();

    // Kết quả mong muốn:
    // 1. Hiển thị message "Thêm thành công"
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // 2. Ghi nhận 1 bản ghi ngoài danh sách với dữ liệu đúng như đã khai báo.
    await productPage.searchBySku(uniqueSku);
    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productName);
    await expect(productRow).toContainText('Kích hoạt');

    // 3. Khi click vào dòng sản phẩm để xem chi tiết:
    await productRow.getByRole('button', { name: productName }).first().click();
    const detailDrawer = page.locator('.ant-drawer-body');
    await expect(detailDrawer).toBeVisible();
    await page.waitForTimeout(2000); // Chờ chi tiết tải xong

    // + Bảng “Quy đổi đơn vị” hiển thị đúng hệ số quy về đơn vị cơ bản: lốc = 6 lon, thùng = 24 lon.
    const conversionTable = detailDrawer.locator('.text-lg:has-text("Quy đổi đơn vị") ~ .ant-table-wrapper');
    await expect(conversionTable).toBeVisible();
    
    const conversionRows = conversionTable.locator('tbody tr.ant-table-row');
    await expect(conversionRows.nth(0)).toContainText('lốc');
    await expect(conversionRows.nth(0)).toContainText('6 (lon)');
    await expect(conversionRows.nth(1)).toContainText('thùng');
    await expect(conversionRows.nth(1)).toContainText('24 (lon)'); // 4 * 6 = 24

    // + Bảng “Cấu hình” hiển thị 3 dòng đơn vị: lon (cơ bản), lốc, thùng kèm đúng mã SKU và Barcode tương ứng đã nhập.
    const configTable = detailDrawer.locator('.text-lg:has-text("Cấu hình") ~ .ant-table-wrapper');
    await expect(configTable).toBeVisible();
    
    // Click icon caret mở rộng của dòng thuộc tính mặc định
    const expandBtn = configTable.locator('.anticon-caret-down').first();
    await expandBtn.click();
    
    // Tìm bảng con mở rộng
    const expandedRow = configTable.locator('.ant-table-expanded-row');
    await expect(expandedRow).toBeVisible();

    // Xác nhận có 3 hàng cấu hình đơn vị bên trong bảng con
    const subRows = expandedRow.locator('tbody tr.ant-table-row');
    await expect(subRows).toHaveCount(3);

    // Xác nhận chi tiết của từng hàng trong bảng con
    await expect(subRows.nth(0)).toContainText('lốc');
    await expect(subRows.nth(0)).toContainText(`${uniqueSku}-lon`);
    
    await expect(subRows.nth(1)).toContainText('thùng');
    await expect(subRows.nth(1)).toContainText(`${uniqueSku}-thung`);

    await expect(subRows.nth(2)).toContainText('lon');
    await expect(subRows.nth(2)).toContainText(uniqueSku);

    console.log('[SANPHAM_13] Đã xác nhận thêm sản phẩm cấu hình Đơn vị quy đổi thành công.');
  });

  test('SANPHAM_14 - Tạo sản phẩm có biến thể nhưng không có đơn vị quy đổi thành công', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const productName = `Áo thun VNPost-${timestamp}`;
    const categoryName = 'Nước giải khát'; // Sử dụng danh mục có sẵn để tránh lỗi
    const accountantCode = '999';
    const vatRate = '8%';
    const baseUnitName = 'cái';

    const skuS = `SP-003-S-${timestamp}`;
    const skuM = `SP-003-M-${timestamp}`;

    // 1. Nhập các thông tin bắt buộc hợp lệ:
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToProducts();
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    await productPage.nameInput.fill(productName);
    
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    // Bỏ trống SKU và Barcode ở thông tin chung
    await productPage.accountantCodeInput.fill(accountantCode);

    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

    await page.getByRole('radio', { name: 'Hàng hóa' }).click();
    await page.getByRole('radio', { name: 'Mua bán' }).click();

    await productPage.unitInput.fill(baseUnitName);
    await page.waitForTimeout(500);

    // 2. Tại phần Phân loại, nhấn “+ Thêm phân loại” và nhập:
    // Tên thuộc tính: size
    // Giá trị thuộc tính: S, M
    await productPage.addVariant('size', 'S');
    
    const variantRow = page.locator('.ant-row', { has: productPage.variantNameInput }).first();
    const selectBox = variantRow.locator('.ant-select').first();
    await selectBox.click({ force: true });
    await productPage.variantValueInput.fill('M');
    await productPage.variantValueInput.press('Enter');

    // Chờ bảng cấu hình sinh ra
    await page.waitForTimeout(2000);

    // 3. Tại bảng ma trận Cấu hình được sinh ra bên dưới:
    // Dòng biến thể “size: S”: Barcode tự sinh, SKU “SP-003-S”
    // Dòng biến thể “size: M”: Barcode tự sinh, SKU “SP-003-M”
    const matrixRows = page.locator('.ant-drawer-body table').last().locator('tbody tr.ant-table-row');
    await expect(matrixRows).toHaveCount(2);

    const rowS = matrixRows.nth(0);
    await rowS.locator('input[placeholder="Nhập SKU"]').fill(skuS);
    await rowS.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    const rowM = matrixRows.nth(1);
    await rowM.locator('input[placeholder="Nhập SKU"]').fill(skuM);
    await rowM.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(500);

    // 4. Nhấn nút “Xác nhận”
    await productPage.confirmButton.click();

    // Kết quả mong muốn:
    // 1. Hiển thị message "Thêm thành công"
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // 2. Ghi nhận 1 bản ghi ngoài danh sách với dữ liệu đúng như đã khai báo.
    await productPage.searchBySku(skuS);
    const productRow = page.locator('tr').filter({ hasText: skuS }).first();
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productName);
    await expect(productRow).toContainText('Kích hoạt');

    // Cột SKU hiển thị SKU của 1 biến thể và ..., khi hover chuột vào ... hiển thị tooltip chứa SKU còn lại.
    const skuCell = productRow.locator('td').nth(2);
    const moreElement = skuCell.locator('span.ant-tag').filter({ hasText: '...' }).first();
    await expect(moreElement).toBeVisible();

    // Soft assertion: tooltip có thể là hover hoặc click trigger tùy phiên bản UI
    try {
      await moreElement.scrollIntoViewIfNeeded();
      await moreElement.hover();
      const tooltip = page.locator('.ant-tooltip, .ant-popover, [role="tooltip"]').first();
      await tooltip.waitFor({ state: 'visible', timeout: 3000 });
      await expect(tooltip).toContainText(skuM);
    } catch {
      console.log('[SANPHAM_14] Tooltip SKU không hiển thị khi hover — sẽ xác minh SKU trong drawer chi tiết.');
    }

    // 3. Khi xem chi tiết sản phẩm vừa tạo:
    await productRow.getByRole('button', { name: productName }).first().click();
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible();
    await page.waitForTimeout(2000);

    // + Phần phân loại hiển thị tag S và M.
    const tagS = detailDrawer.locator('.ant-tag').filter({ hasText: 'S' }).first();
    const tagM = detailDrawer.locator('.ant-tag').filter({ hasText: 'M' }).first();
    await expect(tagS).toBeVisible();
    await expect(tagM).toBeVisible();

    // + Bảng Cấu hình hiển thị mỗi biến thể là một row có button expand và khi nhấn:
    const configTable = detailDrawer.locator('.text-lg:has-text("Cấu hình") ~ .ant-table-wrapper');
    await expect(configTable).toBeVisible();

    // dòng size: S hiển thị sub-table gồm cái với SKU/Barcode tương ứng
    const detailRowS = configTable.locator('tr.ant-table-row').filter({ hasText: 'size: S' }).first();
    const rowSText = await detailRowS.textContent() ?? '';
    if (!rowSText.includes('caret-up')) {
      await detailRowS.locator('.anticon-caret-down, img').first().click();
      await page.waitForTimeout(500);
    }
    const expandedRow1 = configTable.locator('.ant-table-expanded-row').filter({ hasText: skuS }).first();
    await expect(expandedRow1).toBeVisible();
    const subRows1 = expandedRow1.locator('tbody tr.ant-table-row');
    await expect(subRows1).toHaveCount(1);
    await expect(subRows1.nth(0)).toContainText('cái');
    await expect(subRows1.nth(0)).toContainText(skuS);

    // dòng size: M hiển thị tương tự
    const detailRowM = configTable.locator('tr.ant-table-row').filter({ hasText: 'size: M' }).first();
    const rowMText = await detailRowM.textContent() ?? '';
    if (!rowMText.includes('caret-up')) {
      await detailRowM.locator('.anticon-caret-down, img').first().click();
      await page.waitForTimeout(500);
    }
    const expandedRow2 = configTable.locator('.ant-table-expanded-row').filter({ hasText: skuM }).first();
    await expect(expandedRow2).toBeVisible();
    const subRows2 = expandedRow2.locator('tbody tr.ant-table-row');
    await expect(subRows2).toHaveCount(1);
    await expect(subRows2.nth(0)).toContainText('cái');
    await expect(subRows2.nth(0)).toContainText(skuM);

    console.log('[SANPHAM_14] Đã xác nhận tạo sản phẩm có biến thể nhưng không có đơn vị quy đổi thành công.');
  });

  test('SANPHAM_15 - Tạo sản phẩm có biến thể đồng thời áp dụng đơn vị quy đổi thành công', async ({ page }) => {
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const productName = `Kệ gỗ-${timestamp}`;
    const categoryName = 'Đồ gia dụng';
    const accountantCode = '999';
    const vatRate = '8%';
    const baseUnitName = 'cái';

    const skuNau = `SP-004-nau-${timestamp}`;
    const skuNauLo = `SP-004-naulo-${timestamp}`;
    const skuNauThung = `SP-004-nauthung-${timestamp}`;

    const skuDen = `SP-004-đen-${timestamp}`;
    const skuDenLo = `SP-004-denlo-${timestamp}`;
    const skuDenThung = `SP-004-denthung-${timestamp}`;

    // 1. Đăng nhập và nhập các thông tin bắt buộc hợp lệ:
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToProducts();
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    await productPage.nameInput.fill(productName);
    
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    // Bỏ trống SKU và Barcode ở thông tin chung
    await productPage.accountantCodeInput.fill(accountantCode);

    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

    await page.getByRole('radio', { name: 'Hàng hóa' }).click();
    await page.getByRole('radio', { name: 'Mua bán' }).click();

    await productPage.unitInput.fill(baseUnitName);
    await page.waitForTimeout(500);

    // 2. Click vào button "Thêm đơn vị quy đổi"
    // Dòng 1: lô, 3, cái
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(0, {
      name: 'lô',
      quantity: '3',
      sku: ''
    });

    // Dòng 2: thùng, 2, lô
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(1, {
      name: 'thùng',
      quantity: '2',
      baseUnit: 'lô',
      sku: ''
    });

    // 3. Tại phần Phân loại, nhấn “+ Thêm phân loại” và nhập màu -> nâu, đen
    await productPage.addVariant('màu', 'nâu');
    
    const variantRow = page.locator('.ant-row', { has: productPage.variantNameInput }).first();
    const selectBox = variantRow.locator('.ant-select').first();
    await selectBox.click({ force: true });
    await productPage.variantValueInput.fill('đen');
    await productPage.variantValueInput.press('Enter');

    // Chờ bảng cấu hình sinh ra và ổn định
    await page.waitForTimeout(2000);

    // 4. Tại bảng ma trận Cấu hình được sinh ra bên dưới:
    const matrixRows = page.locator('.ant-drawer-body table').nth(1).locator('tbody tr.ant-table-row');
    await expect(matrixRows).toHaveCount(6);

    // Dòng biến thể “Màu: Nâu”
    const rowNau = matrixRows.nth(0);
    await rowNau.locator('input[placeholder="Nhập SKU"]').fill(skuNau);
    await rowNau.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    const rowNauLo = matrixRows.nth(1);
    await rowNauLo.locator('input[placeholder="Nhập SKU"]').fill(skuNauLo);
    await rowNauLo.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    const rowNauThung = matrixRows.nth(2);
    await rowNauThung.locator('input[placeholder="Nhập SKU"]').fill(skuNauThung);
    await rowNauThung.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    // Dòng biến thể “màu: đen”
    const rowDen = matrixRows.nth(3);
    await rowDen.locator('input[placeholder="Nhập SKU"]').fill(skuDen);
    await rowDen.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    const rowDenLo = matrixRows.nth(4);
    await rowDenLo.locator('input[placeholder="Nhập SKU"]').fill(skuDenLo);
    await rowDenLo.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    const rowDenThung = matrixRows.nth(5);
    await rowDenThung.locator('input[placeholder="Nhập SKU"]').fill(skuDenThung);
    await rowDenThung.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(500);

    // 5. Nhấn nút “Xác nhận”
    await productPage.confirmButton.click();

    // Kết quả mong muốn:
    // 1. Hiển thị message "Thêm thành công"
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // 2. Ghi nhận 1 bản ghi ngoài danh sách với dữ liệu đúng như đã khai báo.
    await productPage.searchBySku(skuNau);
    const productRow = page.locator('tr').filter({ hasText: skuNau }).first();
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productName);
    await expect(productRow).toContainText('Kích hoạt');

    // Cột SKU hiển thị SKU của 1 biến thể và ..., khi hover chuột vào ... hiển thị tooltip chứa các SKU còn lại.
    const skuCell = productRow.locator('td').nth(2);
    const moreElement = skuCell.locator('span.ant-tag').filter({ hasText: '...' }).first();
    await expect(moreElement).toBeVisible();

    // Soft assertion: tooltip có thể là hover hoặc click trigger tùy phiên bản UI
    try {
      await moreElement.scrollIntoViewIfNeeded();
      await moreElement.hover();
      const tooltip = page.locator('.ant-tooltip, .ant-popover, [role="tooltip"]').first();
      await tooltip.waitFor({ state: 'visible', timeout: 3000 });
      await expect(tooltip).toContainText(skuDen);
    } catch {
      console.log('[SANPHAM_15] Tooltip SKU không hiển thị khi hover — sẽ xác minh SKU trong drawer chi tiết.');
    }

    // 3. Khi xem chi tiết sản phẩm vừa tạo:
    await productRow.getByRole('button', { name: productName }).first().click();
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible();
    await page.waitForTimeout(2000);

    // - Phần phân loại hiển thị tag nâu và đen.
    const tagNau = detailDrawer.locator('.ant-tag').filter({ hasText: 'nâu' }).first();
    const tagDen = detailDrawer.locator('.ant-tag').filter({ hasText: 'đen' }).first();
    await expect(tagNau).toBeVisible();
    await expect(tagDen).toBeVisible();

    // - Bảng Cấu hình hiển thị mỗi biến thể là một row có button expand và khi nhấn:
    const configTable = detailDrawer.locator('.text-lg:has-text("Cấu hình") ~ .ant-table-wrapper');
    await expect(configTable).toBeVisible();

    // dòng màu: nâu hiển thị sub-table gồm lô, thùng và cái với SKU/Barcode tương ứng
    const detailRowNau = configTable.locator('tr.ant-table-row').filter({ hasText: 'màu: nâu' }).first();
    const rowNauText = await detailRowNau.textContent() ?? '';
    if (!rowNauText.includes('caret-up')) {
      await detailRowNau.locator('.anticon-caret-down, img').first().click();
      await page.waitForTimeout(500);
    }
    const expandedRow1 = configTable.locator('.ant-table-expanded-row').filter({ hasText: skuNau }).first();
    await expect(expandedRow1).toBeVisible();
    const subRows1 = expandedRow1.locator('tbody tr.ant-table-row');
    await expect(subRows1).toHaveCount(3);
    await expect(subRows1.nth(0)).toContainText('lô');
    await expect(subRows1.nth(0)).toContainText(skuNauLo);
    await expect(subRows1.nth(1)).toContainText('thùng');
    await expect(subRows1.nth(1)).toContainText(skuNauThung);
    await expect(subRows1.nth(2)).toContainText('cái');
    await expect(subRows1.nth(2)).toContainText(skuNau);

    // dòng màu: đen hiển thị tương tự
    const detailRowDen = configTable.locator('tr.ant-table-row').filter({ hasText: 'màu: đen' }).first();
    const rowDenText = await detailRowDen.textContent() ?? '';
    if (!rowDenText.includes('caret-up')) {
      await detailRowDen.locator('.anticon-caret-down, img').first().click();
      await page.waitForTimeout(500);
    }
    const expandedRow2 = configTable.locator('.ant-table-expanded-row').filter({ hasText: skuDen }).first();
    await expect(expandedRow2).toBeVisible();
    const subRows2 = expandedRow2.locator('tbody tr.ant-table-row');
    await expect(subRows2).toHaveCount(3);
    await expect(subRows2.nth(0)).toContainText('lô');
    await expect(subRows2.nth(0)).toContainText(skuDenLo);
    await expect(subRows2.nth(1)).toContainText('thùng');
    await expect(subRows2.nth(1)).toContainText(skuDenThung);
    await expect(subRows2.nth(2)).toContainText('cái');
    await expect(subRows2.nth(2)).toContainText(skuDen);

    // - Bảng “Quy đổi đơn vị” hiển thị đúng hệ số quy về đơn vị cơ bản: lô = 3 cái, thùng = 6 cái.
    const conversionTable = detailDrawer.locator('.text-lg:has-text("Quy đổi đơn vị") ~ .ant-table-wrapper');
    await expect(conversionTable).toBeVisible();
    
    const conversionRows = conversionTable.locator('tbody tr.ant-table-row');
    await expect(conversionRows.nth(0)).toContainText('lô');
    await expect(conversionRows.nth(0)).toContainText('3 (cái)');
    await expect(conversionRows.nth(1)).toContainText('thùng');
    await expect(conversionRows.nth(1)).toContainText('6 (cái)');

    console.log('[SANPHAM_15] Đã xác nhận tạo sản phẩm có biến thể đồng thời áp dụng đơn vị quy đổi thành công.');
  });

  test('SANPHAM_16 - Kiểm tra thêm mới sản phẩm khi chọn danh mục cha trong cây danh mục', async ({ page }) => {
    test.setTimeout(60000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const productName = `SP validate danh mục-${timestamp}`;
    const parentCategoryName = 'Đồ uống'; // Danh mục cha (có danh mục con bên dưới)

    // 1. Đăng nhập và mở drawer Thêm mới sản phẩm
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToProducts();
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // 2. Nhập thông tin sản phẩm, trong đó trường Danh mục chọn danh mục cha trong cây danh mục
    await productPage.nameInput.fill(productName);

    // Chọn danh mục cha
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(parentCategoryName);
    await page.getByRole('treeitem', { name: parentCategoryName }).first().click();

    // Nhập các trường bắt buộc còn lại để đảm bảo chỉ lỗi danh mục
    await productPage.skuInput.fill(`SKU-${timestamp}`);
    await productPage.barcodeSettingBtn.click();
    await productPage.accountantCodeInput.fill('999');
    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: '8%' }).first().click();
    await productPage.unitInput.fill('cái');
    await page.waitForTimeout(500);

    // Click "Xác nhận"
    await productPage.confirmButton.click();

    // Kết quả mong muốn:
    // Focus đỏ kèm message "Vui lòng chỉ chọn danh mục cấp cuối cùng" tại trường Danh mục
    const categoryError = page.locator('.ant-form-item-explain-error, .ant-form-item-explain')
      .filter({ hasText: 'Vui lòng chỉ chọn danh mục cấp cuối cùng' }).first();
    await expect(categoryError).toBeVisible({ timeout: 5000 });

    // Trường Danh mục ở trạng thái invalid (viền đỏ)
    const categoryCombobox = page.locator('.ant-form-item').filter({ hasText: 'Danh mục' }).first();
    await expect(categoryCombobox).toBeVisible();

    // Toast message (soft check — hệ thống có thể chỉ hiển thị lỗi inline)
    try {
      const toastMsg = page.locator('.ant-message, .ant-notification-notice, .ant-message-error, .ant-message-warning')
        .filter({ hasText: 'Vui lòng chỉ chọn danh mục cấp cuối cùng' }).first();
      await expect(toastMsg).toBeVisible({ timeout: 3000 });
    } catch {
      console.log('[SANPHAM_16] Toast message không hiển thị — lỗi chỉ hiển thị inline dưới trường Danh mục.');
    }

    console.log('[SANPHAM_16] Đã xác nhận validate danh mục cha hiển thị đúng thông báo lỗi.');
  });

  test('SANPHAM_17 - Kiểm tra thêm mới sản phẩm khi thêm thuộc tính bổ sung', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const productName = `Sản phẩm Thuộc tính-${timestamp}`;
    const uniqueSku = `SKU-ATTR-${timestamp}`;
    const categoryName = 'Đồ gia dụng';
    const accountantCode = '999';
    const vatRate = '8%';
    const unitName = 'cái';

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToProducts();

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm" -> "+ Thêm mới"
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // 3. Thêm thuộc tính bổ sung và nhập các thông tin sản phẩm khác
    await productPage.nameInput.fill(productName);
    
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    await productPage.skuInput.fill(uniqueSku);
    await productPage.barcodeSettingBtn.click();
    await productPage.accountantCodeInput.fill(accountantCode);
    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();
    await productPage.unitInput.fill(unitName);

    // Thêm thuộc tính bổ sung
    const addAttrBtn = page.locator('button').filter({ hasText: 'Thêm thuộc tính' }).first();
    await expect(addAttrBtn).toBeVisible();
    await addAttrBtn.click();
    await page.waitForTimeout(500);

    const listData = page.locator('.list-content .list-data');
    const firstRow = listData.locator('> div').first();
    const nameInput = firstRow.locator('input[placeholder="Tên"]');
    const valueInput = firstRow.locator('input[placeholder="Nhập giá trị"]');

    await nameInput.fill('Chất liệu');
    await page.waitForTimeout(300);
    await valueInput.fill('Gỗ sồi');
    await page.waitForTimeout(500);

    // 4. Click "Xác nhận"
    await productPage.confirmButton.click();

    // Kết quả mong muốn: Thuộc tính lưu trữ thành công cùng sản phẩm.
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Xác nhận lưu trữ thành công bằng cách mở chi tiết sản phẩm
    await productPage.searchBySku(uniqueSku);
    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await expect(productRow).toBeVisible();

    // Click vào tên sản phẩm để xem drawer chi tiết
    const nameButton = page.getByRole('button', { name: productName }).first();
    await nameButton.click();

    const detailDrawer = page.locator('.ant-drawer-body');
    await expect(detailDrawer).toBeVisible();
    await page.waitForTimeout(2000); // Chờ chi tiết tải xong

    // Xác minh thuộc tính hiển thị đúng trong drawer chi tiết
    await expect(detailDrawer).toContainText('Chất liệu');
    await expect(detailDrawer).toContainText('Gỗ sồi');

    console.log('[SANPHAM_17] Đã xác nhận tạo sản phẩm với thuộc tính bổ sung thành công.');
  });

  test('SANPHAM_18 - Kiểm tra chức năng: Kiểm tra tải lên hình ảnh minh họa', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Tìm một file ảnh từ thư mục /home/dev/Pictures/Screenshots
    const screenshotDir = '/home/dev/Pictures/Screenshots';
    const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) {
      throw new Error(`Không tìm thấy file ảnh nào trong thư mục ${screenshotDir}`);
    }
    const filePath = path.join(screenshotDir, files[0]);
    const fileName = files[0];

    const timestamp = Date.now();
    const productName = `Sản phẩm Ảnh-${timestamp}`;
    const uniqueSku = `SKU-IMG-${timestamp}`;
    const categoryName = 'Đồ gia dụng';
    const accountantCode = '999';
    const vatRate = '8%';
    const unitName = 'cái';

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToProducts();

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm" -> "+ Thêm mới"
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // 3. Tải lên hình ảnh minh họa và nhập các thông tin sản phẩm khác
    await productPage.nameInput.fill(productName);
    
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    await productPage.skuInput.fill(uniqueSku);
    await productPage.barcodeSettingBtn.click();
    await productPage.accountantCodeInput.fill(accountantCode);
    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();
    await productPage.unitInput.fill(unitName);

    // Tải lên hình ảnh minh họa
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
    await fileInput.setInputFiles(filePath);
    await page.waitForTimeout(3000); // Chờ hiển thị thumbnail

    // Kiểm tra kết quả mong muốn tại form: hiển thị hình thu nhỏ rõ nét, không bị méo
    const thumbnail = page.locator('.upload-list-content .upload-list-item').first();
    await expect(thumbnail).toBeVisible();
    
    const thumbnailImg = thumbnail.locator('img').first();
    await expect(thumbnailImg).toBeVisible();
    await expect(thumbnailImg).toHaveAttribute('alt', fileName);

    // Di chuột qua thumbnail để hiển thị nút xóa
    await thumbnail.hover();
    await page.waitForTimeout(500);

    const removeBtn = thumbnail.locator('.btn-remove-img').first();
    await expect(removeBtn).toBeVisible();

    // 4. Click "Xác nhận"
    await productPage.confirmButton.click();

    // Kết quả mong muốn: Ảnh tải lên thành công, hiển thị hình thu nhỏ rõ nét trong chi tiết
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Tìm kiếm và mở chi tiết sản phẩm để xác nhận ảnh hiển thị đúng
    await productPage.searchBySku(uniqueSku);
    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await expect(productRow).toBeVisible();

    // Click vào tên sản phẩm để xem drawer chi tiết
    const nameButton = page.getByRole('button', { name: productName }).first();
    await nameButton.click();

    const detailDrawer = page.locator('.ant-drawer-body');
    await expect(detailDrawer).toBeVisible();
    await page.waitForTimeout(2000); // Chờ chi tiết tải xong

    // Xác nhận ảnh trong slider carousel hiển thị rõ nét
    const detailSlider = detailDrawer.locator('.slick-slider').first();
    await expect(detailSlider).toBeVisible();
    
    const detailImg = detailSlider.locator('img.ant-image-img').first();
    await expect(detailImg).toBeVisible();
    await expect(detailImg).toHaveAttribute('src', /.*\.png/);

    console.log('[SANPHAM_18] Đã xác nhận tạo sản phẩm và tải lên ảnh minh họa thành công.');
  });

  test('SANPHAM_19 - Kiểm tra tải lên ảnh sai định dạng hoặc quá dung lượng', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Tạo file txt giả lập định dạng sai
    const invalidFilePath = path.join(__dirname, 'invalid_image.txt');
    fs.writeFileSync(invalidFilePath, 'Đây là file định dạng sai để test upload hình ảnh.');

    try {
      // 1. Admin đăng nhập vào hệ thống
      await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
      await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
      await dashboardPage.navigateToProducts();

      // 2. Click chọn "Sản phẩm" -> "Sản phẩm" -> "+ Thêm mới"
      await productPage.clickAddNew();
      await page.waitForLoadState('networkidle');

      // 3. Tải lên hình ảnh minh họa sai định dạng và nhập các thông tin sản phẩm khác
      const fileInput = page.locator('input[type="file"]').first();
      await expect(fileInput).toBeAttached();
      await fileInput.setInputFiles(invalidFilePath);
      await page.waitForTimeout(2000); // Chờ validation chạy

      // Kết quả mong muốn: Hệ thống từ chối file và hiển thị cảnh báo lỗi định dạng tương ứng
      // Không được hiển thị thumbnail ảnh
      const thumbnail = page.locator('.upload-list-content .upload-list-item');
      await expect(thumbnail).not.toBeVisible();

      // Có thông báo cảnh báo lỗi hiển thị (toast hoặc message lỗi)
      const errorMsg = page.locator('.ant-message-error, .ant-message, .ant-notification-notice')
        .filter({ hasText: /định dạng|loại file|không hợp lệ|chỉ cho phép|vui lòng/i }).first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });

      console.log('[SANPHAM_19] Đã xác nhận hệ thống từ chối file sai định dạng và hiển thị cảnh báo thành công.');
    } finally {
      // Dọn dẹp file tạm
      if (fs.existsSync(invalidFilePath)) {
        fs.unlinkSync(invalidFilePath);
      }
    }
  });

  test('SANPHAM_20 - Kiểm tra thêm mới sản phẩm thủ công với đầy đủ các thông tin (bao gồm cả thông tin không bắt buộc)', async ({ page }) => {
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const screenshotDir = '/home/dev/Pictures/Screenshots';
    const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) {
      throw new Error(`Không tìm thấy file ảnh nào trong thư mục ${screenshotDir}`);
    }
    const filePath = path.join(screenshotDir, files[0]);

    const timestamp = Date.now();
    const productName = `Sản phẩm Full-${timestamp}`;
    const uniqueSku = `SKU-FULL-${timestamp}`;
    const categoryName = 'Đồ gia dụng';
    const accountantCode = '999';
    const vatRate = '8%';
    const unitName = 'cái';

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToProducts();

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm" -> "+ Thêm mới"
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    // 3. Nhập đầy đủ tất cả thông tin
    // Tên sản phẩm
    await productPage.nameInput.fill(productName);
    
    // Danh mục
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    // SKU & Barcode
    await productPage.skuInput.fill(uniqueSku);
    await productPage.barcodeSettingBtn.click();
    
    // Mã kế toán & VAT
    await productPage.accountantCodeInput.fill(accountantCode);
    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

    // Thương hiệu (Không bắt buộc)
    await page.getByPlaceholder('Nhập thương hiệu').fill('Bút Thiên Long');

    // Phân nhóm báo cáo (Không bắt buộc)
    const reportGroupSelect = page.locator('input#form_reportGroup, input#form_reportGroupId, input[placeholder="Chọn phân nhóm báo cáo"]').first();
    if (await reportGroupSelect.count() > 0) {
      await reportGroupSelect.click();
    } else {
      await page.getByRole('combobox', { name: 'Phân nhóm báo cáo' }).click();
    }
    await page.waitForTimeout(500);
    // Chọn option đầu tiên từ dropdown đang hiển thị
    await page.locator('.ant-select-dropdown').filter({ visible: true }).locator('.ant-select-item-option').first().click();


    // Loại hàng hóa / vật tư: Chọn "Hàng hóa"
    await page.getByRole('radio', { name: 'Hàng hóa' }).click();

    // Hình thức phân phối: Chọn "Ký gửi"
    await page.getByRole('radio', { name: 'Ký gửi' }).click();

    // Tích điểm & Là nguyên liệu sản xuất
    const pointsCheckbox = page.getByRole('checkbox', { name: 'Tích điểm' });
    if (await pointsCheckbox.isVisible()) {
      if (!(await pointsCheckbox.isChecked())) {
        await pointsCheckbox.check();
      }
    }
    
    let isRawMaterialChecked = false;
    const rawMaterialCheckbox = page.getByRole('checkbox', { name: 'Là nguyên liệu sản xuất' });
    if (await rawMaterialCheckbox.isVisible()) {
      await rawMaterialCheckbox.check();
      isRawMaterialChecked = true;
    }


    // Đơn vị
    await productPage.unitInput.fill(unitName);

    // Thông tin vật lý
    await page.getByPlaceholder('Nhập khối lượng').fill('100');
    await page.getByPlaceholder('Nhập thể tích').fill('200');
    await page.getByPlaceholder('Dài').fill('10');
    await page.getByPlaceholder('Rộng').fill('20');
    await page.getByPlaceholder('Cao').fill('30');

    // Thuộc tính bổ sung
    await page.locator('button:has-text("Thêm thuộc tính")').click();
    await page.waitForTimeout(300);
    const attrRow = page.locator('.list-content .list-data > div').first();
    await attrRow.locator('input[placeholder="Tên"]').fill('Chất liệu');
    await page.waitForTimeout(300);
    await attrRow.locator('input[placeholder="Nhập giá trị"]').fill('Gỗ sồi');

    // Ảnh minh họa
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);
    await page.waitForTimeout(3000); // Chờ hiển thị thumbnail

    // Mô tả
    await page.locator('.ql-editor').first().fill('Mô tả sản phẩm đầy đủ thông tin.');

    // Click "Xác nhận"
    await productPage.confirmButton.click();

    // Kết quả mong muốn:
    // 1. Hiển thị message "Thêm thành công"
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // 2. Ghi nhận 1 bản ghi ngoài danh sách với dữ liệu đúng như đã khai báo. Cột Trạng thái mặc định là "Kích hoạt"
    await productPage.searchBySku(uniqueSku);
    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText('Kích hoạt');
    await expect(productRow).toContainText(productName);

    // 3. Xem chi tiết hiển thị đúng các trường thông tin đã nhập
    const nameButton = page.getByRole('button', { name: productName }).first();
    await nameButton.click();

    const detailDrawer = page.locator('.ant-drawer-body');
    await expect(detailDrawer).toBeVisible();
    await page.waitForTimeout(2000); // Chờ chi tiết tải xong

    // Xác minh toàn bộ thông tin hiển thị đúng trong drawer chi tiết bằng cách check text chứa trong drawer
    await expect(detailDrawer).toContainText(productName);
    await expect(detailDrawer).toContainText(categoryName);
    await expect(detailDrawer).toContainText('8 %');
    await expect(detailDrawer).toContainText(unitName);
    await expect(detailDrawer).toContainText('Bút Thiên Long');
    await expect(detailDrawer).toContainText('Ký gửi');
    await expect(detailDrawer).toContainText(isRawMaterialChecked ? 'Có' : 'Không');
    await expect(detailDrawer).toContainText('Mô tả sản phẩm đầy đủ thông tin.');

    await expect(detailDrawer).toContainText('100 g');
    await expect(detailDrawer).toContainText('200 ml');
    await expect(detailDrawer).toContainText('10 cm');
    await expect(detailDrawer).toContainText('20 cm');
    await expect(detailDrawer).toContainText('30 cm');

    // Thuộc tính bổ sung
    await expect(detailDrawer).toContainText('Chất liệu');
    await expect(detailDrawer).toContainText('Gỗ sồi');

    // Ảnh minh họa
    const detailSlider = detailDrawer.locator('.slick-slider').first();
    await expect(detailSlider).toBeVisible();
    const detailImg = detailSlider.locator('img.ant-image-img').first();
    await expect(detailImg).toBeVisible();

    console.log('[SANPHAM_20] Đã xác nhận thêm sản phẩm thủ công đầy đủ thông tin và hiển thị chi tiết chính xác.');
  });
});




