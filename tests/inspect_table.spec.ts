import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { SelectShopPage } from '../src/pages/select-shop.page';
import { DashboardPage } from '../src/pages/dashboard.page';
import { ProductPage } from '../src/pages/product.page';
import { ENV } from '../src/utils/env.config';

test('inspect unit conversion row HTML scoped to dialog', async ({ page }) => {
  test.setTimeout(120000); // 120 seconds

  const loginPage = new LoginPage(page);
  const selectShopPage = new SelectShopPage(page);
  const dashboardPage = new DashboardPage(page);
  const productPage = new ProductPage(page);

  const timestamp = Date.now();
  const baseSku = `SP-002-${timestamp}`;
  const productName = `Bia Heineken ${timestamp}`;
  const categoryName = 'Nước giải khát';
  const accountantCode = 'KT-BEER';
  const vatRate = '8%';
  const unitName = 'lon';

  await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
  await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
  await dashboardPage.navigateToProducts();
  await productPage.clickAddNew();

  const dialog = page.locator('[role="dialog"]');

  // 1. Fill basic info
  await productPage.fill(productPage.nameInput, productName);
  await productPage.click(productPage.categorySelect);
  await productPage.categorySelect.fill(categoryName);
  await page.getByRole('treeitem', { name: categoryName }).first().click();

  await productPage.fill(productPage.skuInput, baseSku);
  await productPage.click(productPage.barcodeSettingBtn);
  await productPage.fill(productPage.accountantCodeInput, accountantCode);

  await productPage.click(productPage.vatSelect);
  await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

  await page.getByRole('radio', { name: 'Hàng hóa' }).click();
  await page.getByRole('radio', { name: 'Mua bán' }).click();

  await productPage.fill(productPage.unitInput, unitName);

  // 2. Add conversion units
  const addBtn = dialog.locator('button:has-text("Thêm đơn vị quy đổi")');
  await addBtn.click();
  await page.waitForTimeout(500);
  
  // Row 1 inputs (index 0 in table body)
  const row0 = dialog.locator('.ant-table-row').nth(0);
  await row0.locator('input[placeholder="Nhập tên đơn vị"]').fill('lốc');
  await row0.locator('input[placeholder="Nhập số lượng"]').fill('6');
  // SKU Row 1
  const row0Sku = `${baseSku}-lon`;
  await row0.locator('input[placeholder="Nhập SKU"]').fill(row0Sku);
  // Barcode Row 1 auto-gen
  await row0.getByRole('button', { name: 'setting' }).click();
  const barcode0Val = await row0.locator('input[placeholder="Nhập Barcode"]').inputValue();
  console.log('Row 0 auto-generated barcode:', barcode0Val);

  // Add Row 2
  await addBtn.click();
  await page.waitForTimeout(500);
  const row1 = dialog.locator('.ant-table-row').nth(1);
  await row1.locator('input[placeholder="Nhập tên đơn vị"]').fill('thùng');
  await row1.locator('input[placeholder="Nhập số lượng"]').fill('4');
  
  // Select "lốc" for row 1 unit ( Đơn vị quy đổi gốc )
  const selectUnitOrigin = row1.getByRole('combobox');
  await selectUnitOrigin.click();
  
  // Wait for option to be visible and click it
  const locOption = page.locator('.ant-select-item-option').filter({ hasText: 'lốc' }).first();
  await locOption.waitFor({ state: 'visible' });
  await locOption.click();

  // SKU Row 2
  const row1Sku = `${baseSku}-thung`;
  await row1.locator('input[placeholder="Nhập SKU"]').fill(row1Sku);
  // Barcode Row 2 auto-gen
  await row1.getByRole('button', { name: 'setting' }).click();
  const barcode1Val = await row1.locator('input[placeholder="Nhập Barcode"]').inputValue();
  console.log('Row 1 auto-generated barcode:', barcode1Val);

  // 3. Confirm creation
  await productPage.click(productPage.confirmButton);

  // Verify success message
  const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
  await expect(successMsg).toBeVisible();

  // Wait for the drawer to close
  await expect(dialog).not.toBeVisible();

  // 4. Search and open detail
  await productPage.searchBySku(baseSku);

  const productRow = page.locator('tr').filter({ hasText: baseSku }).first();
  await expect(productRow).toBeVisible();
  await expect(productRow).toContainText(productName);
  await expect(productRow).toContainText('Mua bán');
  await expect(productRow).toContainText(unitName);
  await expect(productRow).toContainText(categoryName);
  await expect(productRow).toContainText('Kích hoạt');

  // Open detail
  await productRow.locator('button').first().click();
  
  // Wait for detail drawer to open
  const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
  await expect(detailDrawer).toBeVisible();
  await page.waitForTimeout(3000); // Wait for animations

  // Dump detail drawer HTML to inspect the tables structure
  const tables = detailDrawer.locator('table');
  const tableCount = await tables.count();
  console.log(`Found ${tableCount} tables in detail drawer.`);
  for (let i = 0; i < tableCount; i++) {
    console.log(`--- TABLE ${i} ---`);
    console.log(await tables.nth(i).innerText());
  }

  await page.screenshot({ path: 'detail_view_success_screenshot.png' });
});
