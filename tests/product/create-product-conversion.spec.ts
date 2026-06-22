import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Product Unit Conversion Flows', () => {
  test('Thêm sản phẩm có cấu hình Đơn vị quy đổi thành công', async ({ page }) => {
    // VNPost environment can be slow, increase timeout for this test
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

    // Step 1: Login and select shop
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Step 2: Navigate to Products page
    await dashboardPage.navigateToProducts();

    // Step 3: Open Add Product drawer
    await productPage.clickAddNew();

    // Step 4: Fill basic product info (required fields)
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

    // Fill base unit
    await productPage.unitInput.fill(baseUnitName);
    await page.waitForTimeout(500);

    // Step 5: Add and configure conversion units
    // Click "+ Thêm đơn vị quy đổi" to add first row (lốc)
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(0, {
      name: 'lốc',
      quantity: '6',
      sku: `${uniqueSku}-lon`
    });

    // Click "+ Thêm đơn vị quy đổi" to add second row (thùng)
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(1, {
      name: 'thùng',
      quantity: '4',
      baseUnit: 'lốc',
      sku: `${uniqueSku}-thung`
    });

    // Step 6: Click Xác nhận to submit
    await productPage.click(productPage.confirmButton);

    // Step 7: Verify success message and wait for drawer to close
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible();
    await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

    // Step 8: Search for product and verify details in list
    await productPage.searchBySku(uniqueSku);
    const productRow = page.locator('tr').filter({ hasText: uniqueSku }).first();
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productName);
    await expect(productRow).toContainText('Kích hoạt');

    // Step 9: Click on product to view detail drawer
    const nameButton = page.getByRole('button', { name: productName }).first();
    await nameButton.click();

    const detailDrawer = page.locator('.ant-drawer-body');
    await expect(detailDrawer).toBeVisible();
    await page.waitForTimeout(2000); // Wait for details to finish loading

    // Verify "Quy đổi đơn vị" table displays correct conversion rates
    const conversionTable = detailDrawer.locator('.text-lg:has-text("Quy đổi đơn vị") ~ .ant-table-wrapper');
    await expect(conversionTable).toBeVisible();
    
    const conversionRows = conversionTable.locator('tbody tr.ant-table-row');
    await expect(conversionRows.nth(0)).toContainText('lốc');
    await expect(conversionRows.nth(0)).toContainText('6 (lon)');
    await expect(conversionRows.nth(1)).toContainText('thùng');
    await expect(conversionRows.nth(1)).toContainText('24 (lon)'); // 4 * 6 = 24

    // Verify "Cấu hình" table displays all 3 unit configurations under the expanded Mặc định row
    const configTable = detailDrawer.locator('.text-lg:has-text("Cấu hình") ~ .ant-table-wrapper');
    await expect(configTable).toBeVisible();
    
    // Click the expand caret icon for the default variant row
    const expandBtn = configTable.locator('.anticon-caret-down').first();
    await expandBtn.click();
    
    // Locate the expanded child row table
    const expandedRow = configTable.locator('.ant-table-expanded-row');
    await expect(expandedRow).toBeVisible();

    // Assert there are 3 unit configuration rows inside the expanded sub-table
    const subRows = expandedRow.locator('tbody tr.ant-table-row');
    await expect(subRows).toHaveCount(3);

    // Verify details of each row in the sub-table
    await expect(subRows.nth(0)).toContainText('lốc');
    await expect(subRows.nth(0)).toContainText(`${uniqueSku}-lon`);
    
    await expect(subRows.nth(1)).toContainText('thùng');
    await expect(subRows.nth(1)).toContainText(`${uniqueSku}-thung`);

    await expect(subRows.nth(2)).toContainText('lon');
    await expect(subRows.nth(2)).toContainText(uniqueSku);
  });
});
