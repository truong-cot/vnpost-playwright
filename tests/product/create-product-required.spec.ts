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

    // Step 1: Login and select shop
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Step 2: Navigate to Products page
    await dashboardPage.navigateToProducts();

    // Step 3: Open Add Product drawer
    await productPage.clickAddNew();

    // Step 4: Create product with required fields
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

    // Step 5: Verify success message
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible();

    // Wait for the drawer to close
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Step 6: Search for the created product in the list
    await productPage.searchBySku(uniqueSku);

    // Step 7: Verify row details in the list table
    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productName);
    await expect(productRow).toContainText('Mua bán');
    await expect(productRow).toContainText(unitName);
    await expect(productRow).toContainText(categoryName);
    await expect(productRow).toContainText('Kích hoạt');
  });
});
