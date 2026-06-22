import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Product Creation Interface Flow', () => {
  test('Kiểm tra giao diện SKU và Barcode khi thêm biến thể', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    // Step 1: Login and select role
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Step 2: Navigate to Products page
    await dashboardPage.navigateToProducts();

    // Step 3: Open Add Product drawer
    await productPage.clickAddNew();

    // Step 4: Verify initial state of SKU and Barcode is enabled
    await expect(productPage.skuInput).toBeEnabled();
    await expect(productPage.barcodeInput).toBeEnabled();

    // Step 5: Add a new classification/variant (size -> S)
    await productPage.addVariant('size', 'S');

    // Step 6: Verify SKU and Barcode become disabled and display variant placeholder
    await expect(productPage.skuInput).toBeDisabled();
    await expect(productPage.barcodeInput).toBeDisabled();
    await expect(productPage.skuInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
    await expect(productPage.barcodeInput).toHaveAttribute('placeholder', 'Quản lý theo biến thể bên dưới');
  });
});
