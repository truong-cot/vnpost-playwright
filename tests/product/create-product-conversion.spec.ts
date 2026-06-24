import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Product Unit Conversion Flows', () => {
  test('Thêm sản phẩm có cấu hình Đơn vị quy đổi thành công', async ({ page }) => {
    // Môi trường VNPost chạy khá chậm, tăng timeout cho bài test này
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

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới trang danh sách Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();

    // Bước 4: Nhập thông tin sản phẩm cơ bản (các trường bắt buộc)
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

    // Điền đơn vị gốc
    await productPage.unitInput.fill(baseUnitName);
    await page.waitForTimeout(500);

    // Bước 5: Thêm và cấu hình các đơn vị quy đổi
    // Click "+ Thêm đơn vị quy đổi" để thêm dòng đầu tiên (lốc)
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(0, {
      name: 'lốc',
      quantity: '6',
      sku: `${uniqueSku}-lon`
    });

    // Click "+ Thêm đơn vị quy đổi" để thêm dòng thứ hai (thùng)
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(1, {
      name: 'thùng',
      quantity: '4',
      baseUnit: 'lốc',
      sku: `${uniqueSku}-thung`
    });

    // Bước 6: Click Xác nhận để gửi form
    await productPage.click(productPage.confirmButton);

    // Bước 7: Xác nhận thông báo thành công hiển thị và drawer đóng lại
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible();
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Bước 8: Tìm kiếm sản phẩm và kiểm tra chi tiết trong bảng danh sách
    await productPage.searchBySku(uniqueSku);
    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productName);
    await expect(productRow).toContainText('Kích hoạt');

    // Bước 9: Click vào tên sản phẩm để xem drawer chi tiết
    const nameButton = page.getByRole('button', { name: productName }).first();
    await nameButton.click();

    const detailDrawer = page.locator('.ant-drawer-body');
    await expect(detailDrawer).toBeVisible();
    await page.waitForTimeout(2000); // Chờ chi tiết tải xong

    // Xác nhận bảng "Quy đổi đơn vị" hiển thị tỷ lệ quy đổi chính xác
    const conversionTable = detailDrawer.locator('.text-lg:has-text("Quy đổi đơn vị") ~ .ant-table-wrapper');
    await expect(conversionTable).toBeVisible();
    
    const conversionRows = conversionTable.locator('tbody tr.ant-table-row');
    await expect(conversionRows.nth(0)).toContainText('lốc');
    await expect(conversionRows.nth(0)).toContainText('6 (lon)');
    await expect(conversionRows.nth(1)).toContainText('thùng');
    await expect(conversionRows.nth(1)).toContainText('24 (lon)'); // 4 * 6 = 24

    // Xác nhận bảng "Cấu hình" hiển thị đủ cả 3 cấu hình đơn vị dưới hàng Mặc định được mở rộng
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
  });
});
