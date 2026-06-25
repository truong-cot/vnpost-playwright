import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Product Detail Flow', () => {
  test('SANPHAM_21 - Kiểm tra chức năng xem chi tiết sản phẩm', async ({ page }) => {
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const productName = `Sản phẩm Test-${timestamp}`;
    const productSku = `SKU-TEST-${timestamp}`;
    const categoryName = 'Đồ gia dụng';
    const accountantCode = 'AC-TEST';
    const vatRate = '8%';
    const unitName = 'cái';

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // ─── SETUP: Tạo sản phẩm mới để có dữ liệu xem chi tiết ──────────────────
    console.log(`[SANPHAM_21] Tiến hành tạo sản phẩm mới: ${productName} (SKU: ${productSku})`);
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    await productPage.createProduct({
      name: productName,
      category: categoryName,
      sku: productSku,
      accountantCode: accountantCode,
      vat: vatRate,
      unit: unitName,
      productType: 'Hàng hóa',
      distributionType: 'Mua bán'
    });

    // Chờ thông báo tạo thành công
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Tìm kiếm sản phẩm vừa tạo
    await productPage.searchBySku(productSku);

    // 3. Tại dòng sản phẩm cần xem chi tiết: Click chọn "Thao tác" -> "Xem chi tiết"
    const productRow = page.locator('tr').filter({ hasText: productSku }).first();
    await expect(productRow).toBeVisible();
    await productRow.locator('button:has-text("Thao tác")').click();

    // Click chọn "Xem chi tiết" từ dropdown
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xem chi tiết' }).first().click();

    // 4. Kiểm tra thông tin sản phẩm
    // Chờ Detail drawer mở ra
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible({ timeout: 10_000 });

    // Kết quả mong muốn: Hệ thống hiển thị chính xác các thông tin của sản phẩm được chọn
    await expect(detailDrawer).toContainText(productName);
    await expect(detailDrawer).toContainText(productSku);
    await expect(detailDrawer).toContainText(categoryName);
    await expect(detailDrawer).toContainText(unitName);
    await expect(detailDrawer).toContainText('8 %');
    await expect(detailDrawer).toContainText('Hàng hóa');
    await expect(detailDrawer).toContainText('Mua bán');

    console.log(`[SANPHAM_21] Đã xác nhận thông tin chi tiết sản phẩm hiển thị chính xác.`);
  });

  test('SANPHAM_21_CLOSE - Kiểm tra chức năng: Kiểm tra đóng pop up chi tiết sản phẩm', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // ─── BƯỚC 1: Click vào sản phẩm đầu tiên của bảng để mở chi tiết ─────────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });

    // Lấy link/button tên sản phẩm ở cột thứ 4 (index 3)
    const nameButton = firstRow.locator('td').nth(3).locator('button, a').first();
    await expect(nameButton).toBeVisible({ timeout: 5_000 });
    await nameButton.click();

    // Chờ drawer chi tiết hiển thị
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible({ timeout: 10_000 });

    // ─── BƯỚC 2: Click "X" tại pop up xem chi tiết sản phẩm ─────────────────
    const closeButton = detailDrawer.locator('.ant-drawer-close, button.ant-drawer-close, [aria-label="Close"]').first();
    await expect(closeButton).toBeVisible({ timeout: 5_000 });
    await closeButton.click();

    // ─── BƯỚC 3: Quan sát sự thay đổi của màn hình ──────────────────────────
    // Kết quả mong muốn: Pop up xem chi tiết sản phẩm được đóng lại, hiển thị màn hình danh sách sản phẩm
    await expect(detailDrawer).not.toBeVisible({ timeout: 10_000 });
    await expect(firstRow).toBeVisible({ timeout: 5_000 });

    console.log('[SANPHAM_21_CLOSE] Đã đóng drawer chi tiết sản phẩm bằng nút X thành công.');
  });

  test('SANPHAM_23 - Kiểm tra chỉnh sửa sản phẩm khi xóa các trường bắt buộc', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // ─── BƯỚC 1: Chọn sản phẩm đầu tiên của bảng để sửa ──────────────────────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });

    // Click "Thao tác" trên dòng sản phẩm đầu tiên
    await firstRow.locator('button:has-text("Thao tác")').click();

    // Click "Xem chi tiết" từ dropdown
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xem chi tiết' }).first().click();

    // Chờ Detail drawer mở ra
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible({ timeout: 10_000 });

    // Click "Sửa thông tin"
    await detailDrawer.locator('button:has-text("Sửa thông tin")').click();

    // Chờ Form Sửa thông tin hiển thị (nameInput hiển thị)
    await expect(productPage.nameInput).toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 2: Xóa thông tin các trường bắt buộc ────────────────────────────
    await productPage.nameInput.fill('');
    await productPage.skuInput.fill('');
    await productPage.unitInput.fill('');

    // ─── BƯỚC 3: Click "Cập nhật" ─────────────────────────────────────────────
    const updateButton = page.locator('button:has-text("Cập nhật"), button:has-text("Xác nhận")').first();
    await updateButton.click();

    // ─── BƯỚC 4: Kiểm tra kết quả mong muốn ──────────────────────────────────
    // 1. Hệ thống không lưu thông tin mới (Form chỉnh sửa vẫn hiển thị)
    await expect(productPage.nameInput).toBeVisible();

    // 2. Báo đỏ các trường bắt buộc bị bỏ trống
    const errorFields = page.locator('.ant-form-item-has-error');
    await expect(errorFields.first()).toBeVisible({ timeout: 5_000 });

    // 3. Hiển thị thông báo "Vui lòng nhập đầy đủ các thông tin được yêu cầu"
    const errorNotification = page.locator('.ant-message-notice, .ant-notification-notice')
      .filter({ hasText: 'Vui lòng nhập đầy đủ các thông tin được yêu cầu' })
      .first();
    await expect(errorNotification).toBeVisible({ timeout: 5_000 });

    console.log('[SANPHAM_23] Kiểm tra chỉnh sửa sản phẩm khi bỏ trống trường bắt buộc thành công.');
  });

  test('SANPHAM_24 - Kiểm tra chỉnh sửa sản phẩm khi sửa SKU trùng với SKU đã có trên hệ thống', async ({ page }) => {
    test.setTimeout(180000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const sku1 = `SKU-DUP1-${timestamp}`;
    const sku2 = `SKU-DUP2-${timestamp}`;
    const name1 = `Sản phẩm Trùng 1-${timestamp}`;
    const name2 = `Sản phẩm Trùng 2-${timestamp}`;

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // ─── SETUP: Tạo sản phẩm thứ nhất ────────────────────────────────────────
    console.log(`[SANPHAM_24] Tạo sản phẩm 1 với SKU: ${sku1}`);
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');
    await productPage.createProduct({
      name: name1,
      category: 'Đồ gia dụng',
      sku: sku1,
      accountantCode: 'AC-DUP1',
      vat: '8%',
      unit: 'cái',
      productType: 'Hàng hóa',
      distributionType: 'Mua bán'
    });
    let successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // ─── SETUP: Tạo sản phẩm thứ hai ────────────────────────────────────────
    console.log(`[SANPHAM_24] Tạo sản phẩm 2 với SKU: ${sku2}`);
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');
    await productPage.createProduct({
      name: name2,
      category: 'Đồ gia dụng',
      sku: sku2,
      accountantCode: 'AC-DUP2',
      vat: '8%',
      unit: 'cái',
      productType: 'Hàng hóa',
      distributionType: 'Mua bán'
    });
    successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // ─── BƯỚC 3: Tại dòng sản phẩm cần chỉnh sửa: Click chọn "Thao tác" -> "Xem chi tiết" -> "Sửa thông tin" ───
    await productPage.searchBySku(sku2);
    const productRow = page.locator('tr').filter({ hasText: sku2 }).first();
    await expect(productRow).toBeVisible();
    await productRow.locator('button:has-text("Thao tác")').click();

    // Click "Xem chi tiết" từ dropdown
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xem chi tiết' }).first().click();

    // Chờ Detail drawer mở ra
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible({ timeout: 10_000 });

    // Click "Sửa thông tin"
    await detailDrawer.locator('button:has-text("Sửa thông tin")').click();
    await expect(productPage.nameInput).toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 4: Sửa SKU sản phẩm trùng với SKU đã có trên hệ thống ───────────
    await productPage.skuInput.fill(sku1);

    // ─── BƯỚC 5: Click "Cập nhật" ─────────────────────────────────────────────
    const updateButton = page.locator('button:has-text("Cập nhật"), button:has-text("Xác nhận")').first();
    await updateButton.click();

    // ─── BƯỚC 6: Kiểm tra kết quả mong muốn ──────────────────────────────────
    // Hệ thống không lưu thông tin mới đồng thời hiển thị thông báo "Mã SKU ... đã được đăng ký cho sản phẩm khác, vui lòng kiểm tra lại"
    await expect(productPage.nameInput).toBeVisible(); // Form vẫn hiển thị

    const dupNotification = page.locator('.ant-message-notice, .ant-notification-notice')
      .filter({ hasText: 'đã được đăng ký cho sản phẩm khác, vui lòng kiểm tra lại' })
      .first();
    await expect(dupNotification).toBeVisible({ timeout: 10_000 });
    
    const notificationText = await dupNotification.innerText();
    expect(notificationText).toContain(sku1);

    console.log('[SANPHAM_24] Kiểm tra sửa SKU trùng báo lỗi thành công.');
  });

  test('SANPHAM_25 - Kiểm tra chỉnh sửa sản phẩm khi sửa Barcode trùng với Barcode đã có trên hệ thống', async ({ page }) => {
    test.setTimeout(180000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const sku1 = `SKU-BC1-${timestamp}`;
    const sku2 = `SKU-BC2-${timestamp}`;
    const name1 = `Sản phẩm Barcode 1-${timestamp}`;
    const name2 = `Sản phẩm Barcode 2-${timestamp}`;

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // ─── SETUP: Tạo sản phẩm thứ nhất và lấy Barcode ────────────────────────
    console.log(`[SANPHAM_25] Tạo sản phẩm 1 với SKU: ${sku1}`);
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    await productPage.nameInput.fill(name1);
    await productPage.click(productPage.categorySelect);
    await productPage.categorySelect.fill('Đồ gia dụng');
    await page.getByRole('treeitem', { name: 'Đồ gia dụng' }).first().click();

    await productPage.fill(productPage.skuInput, sku1);
    // Tạo Barcode tự động và lấy giá trị của nó
    await productPage.click(productPage.barcodeSettingBtn);
    await page.waitForTimeout(500);
    const barcodeVal = await productPage.barcodeInput.inputValue();
    console.log(`[SANPHAM_25] Barcode của sản phẩm 1: ${barcodeVal}`);

    await productPage.fill(productPage.accountantCodeInput, 'AC-BC1');
    await productPage.click(productPage.vatSelect);
    await page.locator('.ant-select-item-option').filter({ hasText: '8%' }).first().click();
    await productPage.fill(productPage.unitInput, 'cái');
    await productPage.click(productPage.confirmButton);

    let successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // ─── SETUP: Tạo sản phẩm thứ hai ────────────────────────────────────────
    console.log(`[SANPHAM_25] Tạo sản phẩm 2 với SKU: ${sku2}`);
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');
    await productPage.createProduct({
      name: name2,
      category: 'Đồ gia dụng',
      sku: sku2,
      accountantCode: 'AC-BC2',
      vat: '8%',
      unit: 'cái',
      productType: 'Hàng hóa',
      distributionType: 'Mua bán'
    });
    successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // ─── BƯỚC 3: Mở chi tiết sản phẩm thứ hai để sửa ──────────────────────────
    await productPage.searchBySku(sku2);
    const productRow = page.locator('tr').filter({ hasText: sku2 }).first();
    await expect(productRow).toBeVisible();
    await productRow.locator('button:has-text("Thao tác")').click();

    // Click "Xem chi tiết" từ dropdown
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xem chi tiết' }).first().click();

    // Chờ Detail drawer mở ra
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible({ timeout: 10_000 });

    // Click "Sửa thông tin"
    await detailDrawer.locator('button:has-text("Sửa thông tin")').click();
    await expect(productPage.nameInput).toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 4: Sửa Barcode sản phẩm trùng với Barcode sản phẩm 1 ───────────
    await productPage.barcodeInput.fill(barcodeVal);

    // ─── BƯỚC 5: Click "Cập nhật" ─────────────────────────────────────────────
    const updateButton = page.locator('button:has-text("Cập nhật"), button:has-text("Xác nhận")').first();
    await updateButton.click();

    // ─── BƯỚC 6: Kiểm tra kết quả mong muốn ──────────────────────────────────
    // Hệ thống không lưu thông tin mới đồng thời hiển thị thông báo "Barcode đã tồn tại"
    await expect(productPage.nameInput).toBeVisible(); // Form vẫn hiển thị

    const errorNotification = page.locator('.ant-message-notice, .ant-notification-notice')
      .filter({ hasText: 'Barcode đã tồn tại' })
      .first();
    await expect(errorNotification).toBeVisible({ timeout: 10_000 });

    console.log('[SANPHAM_25] Kiểm tra sửa Barcode trùng báo lỗi thành công.');
  });

  test('SANPHAM_28 - Kiểm tra chỉnh sửa sản phẩm thành công', async ({ page }) => {
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const originalName = `Sản phẩm Edit Gốc-${timestamp}`;
    const updatedName = `Sản phẩm Edit Sửa-${timestamp}`;
    const productSku = `SKU-EDIT-${timestamp}`;

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // ─── SETUP: Tạo sản phẩm mới ────────────────────────────────────────────
    console.log(`[SANPHAM_28] Tạo sản phẩm mới: ${originalName}`);
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');
    await productPage.createProduct({
      name: originalName,
      category: 'Đồ gia dụng',
      sku: productSku,
      accountantCode: 'AC-EDIT',
      vat: '8%',
      unit: 'cái',
      productType: 'Hàng hóa',
      distributionType: 'Mua bán'
    });

    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Tìm kiếm sản phẩm vừa tạo
    await productPage.searchBySku(productSku);

    // 3. Tại dòng sản phẩm cần chỉnh sửa: Click chọn "Thao tác" -> "Xem chi tiết" -> "Sửa thông tin" ───
    const productRow = page.locator('tr').filter({ hasText: productSku }).first();
    await expect(productRow).toBeVisible();
    await productRow.locator('button:has-text("Thao tác")').click();

    // Click "Xem chi tiết" từ dropdown
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xem chi tiết' }).first().click();

    // Chờ Detail drawer mở ra
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible({ timeout: 10_000 });

    // Click "Sửa thông tin"
    await detailDrawer.locator('button:has-text("Sửa thông tin")').click();
    await expect(productPage.nameInput).toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 4: Nhập hợp lệ các thông tin cần chỉnh sửa ──────────────────────
    await productPage.nameInput.fill(updatedName);

    // ─── BƯỚC 5: Click "Cập nhật" ─────────────────────────────────────────────
    const updateButton = page.locator('button:has-text("Cập nhật"), button:has-text("Xác nhận")').first();
    await updateButton.click();

    // ─── BƯỚC 6: Kiểm tra kết quả mong muốn ──────────────────────────────────
    // 1. Hiển thị thông báo "Cập nhật thành công"
    const updateSuccessMsg = page.locator('.ant-message-success, .ant-notification-notice')
      .filter({ hasText: /thành công/i })
      .first();
    await expect(updateSuccessMsg).toBeVisible({ timeout: 10_000 });

    // 2. Màn xem chi tiết cập nhật đúng các thông tin đã sửa
    await expect(detailDrawer).toContainText(updatedName);
    await expect(detailDrawer).not.toContainText(originalName);

    console.log('[SANPHAM_28] Kiểm tra chỉnh sửa sản phẩm thành công.');
  });

  test('SANPHAM_29 - Kiểm tra chức năng: Kiểm tra hủy chỉnh sửa sản phẩm', async ({ page }) => {
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // ─── BƯỚC 1: Chọn sản phẩm đầu tiên của bảng để sửa ──────────────────────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });

    // Lấy tên sản phẩm gốc của hàng đầu tiên ở cột thứ 4 (index 3)
    const nameButton = firstRow.locator('td').nth(3).locator('button, a').first();
    await expect(nameButton).toBeVisible({ timeout: 5_000 });
    const originalName = (await nameButton.innerText()).trim();
    const updatedName = `${originalName}-EditTemp`;

    // Click "Thao tác" trên dòng sản phẩm đầu tiên
    await firstRow.locator('button:has-text("Thao tác")').click();

    // Click "Xem chi tiết" từ dropdown
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xem chi tiết' }).first().click();

    // Chờ Detail drawer mở ra
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible({ timeout: 10_000 });

    // Click "Sửa thông tin"
    await detailDrawer.locator('button:has-text("Sửa thông tin")').click();
    await expect(productPage.nameInput).toBeVisible({ timeout: 5_000 });

    // 4. Nhập các thông tin cần chỉnh sửa (Thay đổi tên sản phẩm)
    await productPage.nameInput.fill(updatedName);

    // 5. Click "Hủy" (Sử dụng exact: true để tránh khớp nhầm tên sản phẩm chứa chữ "Hủy")
    const cancelButton = page.getByRole('button', { name: 'Hủy', exact: true }).first();
    await cancelButton.click();

    // Kết quả mong muốn:
    // 1. Hệ thống thực hiện đóng màn hình chỉnh sửa sản phẩm (nameInput không còn hiển thị)
    await expect(productPage.nameInput).not.toBeVisible({ timeout: 5_000 });

    // 2. Không lưu thông tin đã chỉnh sửa (Detail drawer vẫn chứa tên gốc ban đầu, không có tên mới)
    await expect(detailDrawer).toContainText(originalName);
    await expect(detailDrawer).not.toContainText(updatedName);

    console.log('[SANPHAM_29] Kiểm tra hủy chỉnh sửa sản phẩm thành công.');
  });

  test('SANPHAM_26 - Kiểm tra chỉnh sửa sản phẩm khi xóa 1 vài biến thể', async ({ page }) => {
    test.setTimeout(180000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const productName = `Áo thun Biến thể-${timestamp}`;
    const categoryName = 'Nước giải khát';
    const accountantCode = 'VAR-DEL-AC';
    const vatRate = '8%';
    const baseUnitName = 'cái';

    const skuS = `SP-VAR-S-${timestamp}`;
    const skuM = `SP-VAR-M-${timestamp}`;
    const skuL = `SP-VAR-L-${timestamp}`;

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // ─── SETUP: Tạo sản phẩm mới có biến thể S, M, L ─────────────────────────────
    console.log(`[SANPHAM_26] Tạo sản phẩm mới có biến thể S, M, L: ${productName}`);
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    await productPage.nameInput.fill(productName);
    
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    await productPage.accountantCodeInput.fill(accountantCode);

    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

    await page.getByRole('radio', { name: 'Hàng hóa' }).click();
    await page.getByRole('radio', { name: 'Mua bán' }).click();

    await productPage.unitInput.fill(baseUnitName);
    await page.waitForTimeout(500);

    // Thêm các biến thể S, M, L
    await productPage.addVariant('size', 'S');
    
    const variantRow = page.locator('.ant-row', { has: productPage.variantNameInput }).first();
    const selectBox = variantRow.locator('.ant-select').first();
    await selectBox.click({ force: true });
    
    await productPage.variantValueInput.fill('M');
    await productPage.variantValueInput.press('Enter');
    await page.waitForTimeout(500);

    await productPage.variantValueInput.fill('L');
    await productPage.variantValueInput.press('Enter');
    await page.waitForTimeout(1000);

    // Chờ bảng cấu hình sinh ra và điền SKU
    const matrixRows = page.locator('.ant-drawer-body table').last().locator('tbody tr.ant-table-row');
    await expect(matrixRows).toHaveCount(3);

    const rowS = matrixRows.nth(0);
    await rowS.locator('input[placeholder="Nhập SKU"]').fill(skuS);
    await rowS.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    const rowM = matrixRows.nth(1);
    await rowM.locator('input[placeholder="Nhập SKU"]').fill(skuM);
    await rowM.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    const rowL = matrixRows.nth(2);
    await rowL.locator('input[placeholder="Nhập SKU"]').fill(skuL);
    await rowL.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(500);

    // Xác nhận lưu sản phẩm
    await productPage.confirmButton.click();

    // Chờ tạo thành công
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Tìm kiếm sản phẩm vừa tạo
    await productPage.searchBySku(skuS);

    // 3. Tại dòng sản phẩm cần chỉnh sửa: Click chọn "Thao tác" -> "Xem chi tiết" -> "Sửa thông tin" ───
    const productRow = page.locator('tr').filter({ hasText: skuS }).first();
    await expect(productRow).toBeVisible();
    await productRow.locator('button:has-text("Thao tác")').click();

    // Click "Xem chi tiết" từ dropdown
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xem chi tiết' }).first().click();

    // Chờ Detail drawer mở ra
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible({ timeout: 10_000 });

    // Click "Sửa thông tin"
    await detailDrawer.locator('button:has-text("Sửa thông tin")').click();
    await expect(productPage.nameInput).toBeVisible({ timeout: 5_000 });

    // 4. Xóa 1 vài biến thể của sản phẩm (Xóa biến thể L)
    const editVariantRow = page.locator('.ant-row', { has: productPage.variantNameInput }).first();
    const selectTagL = editVariantRow.locator('.ant-select-selection-item').filter({ hasText: 'L' }).first();
    await expect(selectTagL).toBeVisible({ timeout: 5000 });
    await selectTagL.locator('.ant-select-selection-item-remove, .anticon-close').first().click();

    // Chờ bảng cấu hình giảm số lượng dòng biến thể
    const editMatrixRows = page.locator('.ant-drawer-body table').last().locator('tbody tr.ant-table-row');
    await expect(editMatrixRows).toHaveCount(2);

    // 5. Click "Cập nhật"
    const updateButton = page.locator('button:has-text("Cập nhật"), button:has-text("Xác nhận")').first();
    await updateButton.click();

    // Kết quả mong muốn:
    // 1. Hiển thị toast message "Cập nhật sản phẩm thành công", đóng drawer và hệ thống lưu lại thông tin
    const updateSuccessMsg = page.locator('.ant-message, .ant-notification-notice').filter({ hasText: /thành công/i }).first();
    await expect(updateSuccessMsg).toBeVisible({ timeout: 15_000 });

    await expect(productPage.nameInput).not.toBeVisible({ timeout: 10_000 });

    // 2. Tại phần Cấu hình của màn Chi tiết sản phẩm:
    const configTable = detailDrawer.locator('.text-lg:has-text("Cấu hình") ~ .ant-table-wrapper');
    await expect(configTable).toBeVisible();

    // - Các biến thể đã được xóa không còn trong bảng
    await expect(configTable.locator('tr.ant-table-row').filter({ hasText: 'size: L' }).first()).not.toBeVisible();

    // - Các biến thể khác vẫn giữ nguyên
    await expect(configTable.locator('tr.ant-table-row').filter({ hasText: 'size: S' }).first()).toBeVisible();
    await expect(configTable.locator('tr.ant-table-row').filter({ hasText: 'size: M' }).first()).toBeVisible();

    console.log('[SANPHAM_26] Kiểm tra chỉnh sửa sản phẩm khi xóa biến thể thành công.');
  });

  test('SANPHAM_27 - Kiểm tra chỉnh sửa sản phẩm khi xóa tất cả biến thể', async ({ page }) => {
    test.setTimeout(180000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const productName = `Áo thun Xóa hết BT-${timestamp}`;
    const categoryName = 'Nước giải khát';
    const accountantCode = 'VAR-DEL-ALL-AC';
    const vatRate = '8%';
    const baseUnitName = 'cái';

    const skuS = `SP-VAR-S-${timestamp}`;
    const skuM = `SP-VAR-M-${timestamp}`;
    const skuL = `SP-VAR-L-${timestamp}`;
    const newSku = `SP-DEF-${timestamp}`;

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // ─── SETUP: Tạo sản phẩm mới có biến thể S, M, L ─────────────────────────────
    console.log(`[SANPHAM_27] Tạo sản phẩm mới có biến thể S, M, L: ${productName}`);
    await productPage.clickAddNew();
    await page.waitForLoadState('networkidle');

    await productPage.nameInput.fill(productName);
    
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    await productPage.accountantCodeInput.fill(accountantCode);

    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

    await page.getByRole('radio', { name: 'Hàng hóa' }).click();
    await page.getByRole('radio', { name: 'Mua bán' }).click();

    await productPage.unitInput.fill(baseUnitName);
    await page.waitForTimeout(500);

    // Thêm các biến thể S, M, L
    await productPage.addVariant('size', 'S');
    
    const variantRow = page.locator('.ant-row', { has: productPage.variantNameInput }).first();
    const selectBox = variantRow.locator('.ant-select').first();
    await selectBox.click({ force: true });
    
    await productPage.variantValueInput.fill('M');
    await productPage.variantValueInput.press('Enter');
    await page.waitForTimeout(500);

    await productPage.variantValueInput.fill('L');
    await productPage.variantValueInput.press('Enter');
    await page.waitForTimeout(1000);

    // Chờ bảng cấu hình sinh ra và điền SKU
    const matrixRows = page.locator('.ant-drawer-body table').last().locator('tbody tr.ant-table-row');
    await expect(matrixRows).toHaveCount(3);

    const rowS = matrixRows.nth(0);
    await rowS.locator('input[placeholder="Nhập SKU"]').fill(skuS);
    await rowS.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    const rowM = matrixRows.nth(1);
    await rowM.locator('input[placeholder="Nhập SKU"]').fill(skuM);
    await rowM.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    const rowL = matrixRows.nth(2);
    await rowL.locator('input[placeholder="Nhập SKU"]').fill(skuL);
    await rowL.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(500);

    // Xác nhận lưu sản phẩm
    await productPage.confirmButton.click();

    // Chờ tạo thành công
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Tìm kiếm sản phẩm vừa tạo
    await productPage.searchBySku(skuS);

    // 3. Tại dòng sản phẩm cần chỉnh sửa: Click chọn "Thao tác" -> "Xem chi tiết" -> "Sửa thông tin" ───
    const productRow = page.locator('tr').filter({ hasText: skuS }).first();
    await expect(productRow).toBeVisible();
    await productRow.locator('button:has-text("Thao tác")').click();

    // Click "Xem chi tiết" từ dropdown
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xem chi tiết' }).first().click();

    // Chờ Detail drawer mở ra
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible({ timeout: 10_000 });

    // Click "Sửa thông tin"
    await detailDrawer.locator('button:has-text("Sửa thông tin")').click();
    await expect(productPage.nameInput).toBeVisible({ timeout: 5_000 });

    // 4. Xóa tất cả biến thể
    const editVariantRow = page.locator('.ant-row').filter({ has: page.getByPlaceholder('Tên', { exact: true }) }).first();
    const deleteVariantBtn = editVariantRow.locator('button').first();
    await deleteVariantBtn.click();

    // Kiểm tra trường SKU và Barcode phần Thông tin cơ bản enabled
    await expect(productPage.skuInput).toBeEnabled({ timeout: 5000 });
    await expect(productPage.barcodeInput).toBeEnabled({ timeout: 5000 });

    // 5. Nhập SKU không trùng và barcode tự sinh
    await productPage.skuInput.fill(newSku);
    await productPage.barcodeSettingBtn.click();
    await page.waitForTimeout(500);
    const newBarcode = await productPage.barcodeInput.inputValue();

    // 6. Click "Cập nhật"
    const updateButton = page.locator('button:has-text("Cập nhật"), button:has-text("Xác nhận")').first();
    await updateButton.click();

    // Kết quả mong muốn:
    // 1. Hiển thị toast message "Cập nhật sản phẩm thành công", đóng drawer và hệ thống lưu lại thông tin
    const updateSuccessMsg = page.locator('.ant-message, .ant-notification-notice').filter({ hasText: /thành công/i }).first();
    await expect(updateSuccessMsg).toBeVisible({ timeout: 15_000 });

    await expect(productPage.nameInput).not.toBeVisible({ timeout: 10_000 });

    // 2. Tại phần Cấu hình của màn Chi tiết sản phẩm:
    const configTable = detailDrawer.locator('.text-lg:has-text("Cấu hình") ~ .ant-table-wrapper');
    await expect(configTable).toBeVisible();

    // - Tất cả các biến thể đã được xóa không còn trong bảng
    await expect(configTable).not.toContainText('size: S');
    await expect(configTable).not.toContainText('size: M');
    await expect(configTable).not.toContainText('size: L');

    // - Có 1 biến thể phân loại "Mặc định" với SKU và Barcode đã nhập ở phần Thông tin cơ bản
    await expect(configTable).toContainText('Mặc định');
    await expect(configTable).toContainText(newSku);
    await expect(configTable).toContainText(newBarcode);

    console.log('[SANPHAM_27] Kiểm tra chỉnh sửa sản phẩm khi xóa tất cả biến thể thành công.');
  });
});
