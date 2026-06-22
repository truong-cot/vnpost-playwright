import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { SelectShopPage } from '../src/pages/select-shop.page';
import { DashboardPage } from '../src/pages/dashboard.page';
import { ProductPage } from '../src/pages/product.page';
import { ENV } from '../src/utils/env.config';

test('debug barcode auto generation', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const selectShopPage = new SelectShopPage(page);
  const dashboardPage = new DashboardPage(page);
  const productPage = new ProductPage(page);

  await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
  await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
  await dashboardPage.navigateToProducts();
  await productPage.clickAddNew();
  
  // Locate barcode input and the setting button next to it
  const barcodeInput = page.locator('input#form_barCode');
  const barcodeSettingBtn = page.locator('div:has(> input#form_barCode) + button, button:has(svg[data-icon="setting"]), button:has(.anticon-setting)').first();

  console.log('Initial Barcode:', await barcodeInput.inputValue());
  
  // Click setting button to see if it generates barcode
  // Wait, let's find the exact locator from Page Snapshot:
  // - textbox "* Mã barcode (sử dụng máy quét)"
  // - button "setting" [cursor=pointer]
  const settingBtn = page.locator('button').filter({ has: page.locator('span[aria-label="setting"]') }).first();
  await settingBtn.click();
  await page.waitForTimeout(500);

  console.log('Barcode after clicking setting button:', await barcodeInput.inputValue());
});
