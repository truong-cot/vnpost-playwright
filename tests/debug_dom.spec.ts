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
  
  // Định vị ô nhập barcode và nút cài đặt tạo mã tự động bên cạnh
  const barcodeInput = page.locator('input#form_barCode');
  const barcodeSettingBtn = page.locator('div:has(> input#form_barCode) + button, button:has(svg[data-icon="setting"]), button:has(.anticon-setting)').first();

  console.log('Barcode ban đầu:', await barcodeInput.inputValue());
  
  // Click vào nút setting để xem nó có tạo barcode tự động hay không
  // Dựa vào Page Snapshot:
  // - textbox "* Mã barcode (sử dụng máy quét)"
  // - button "setting" [cursor=pointer]
  const settingBtn = page.locator('button').filter({ has: page.locator('span[aria-label="setting"]') }).first();
  await settingBtn.click();
  await page.waitForTimeout(500);

  console.log('Barcode sau khi click nút setting:', await barcodeInput.inputValue());
});
