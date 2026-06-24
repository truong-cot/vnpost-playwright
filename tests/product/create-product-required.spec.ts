import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Product Creation Flows', () => {
  test('Thêm mới sản phẩm đầy đủ các thông tin bắt buộc', async ({ page }) => {
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

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới mục Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();

    // Bước 4: Tạo sản phẩm mới với các trường bắt buộc
    await productPage.createProduct({
      name: productName,
      category: categoryName,
      sku: uniqueSku,
      accountantCode: accountantCode,
      vat: vatRate,
      unit: unitName,
      productType: 'Hàng hóa',
      distributionType: 'Mua bán'
    });

    // Bước 5: Xác nhận thông báo thành công hiển thị
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible();

    // Chờ cho drawer đóng lại hoàn toàn
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Bước 6: Tìm kiếm sản phẩm vừa tạo theo SKU trong danh sách
    await productPage.searchBySku(uniqueSku);

    // Bước 7: Xác nhận chi tiết thông tin hiển thị trên bảng danh sách
    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productName);
    await expect(productRow).toContainText('Mua bán');
    await expect(productRow).toContainText(unitName);
    await expect(productRow).toContainText(categoryName);
    await expect(productRow).toContainText('Kích hoạt');
  });
});
