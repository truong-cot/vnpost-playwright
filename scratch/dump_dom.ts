import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login
  await page.goto('https://vnpost.sfin.vn/login');
  await page.fill('input[placeholder="Tên đăng nhập"]', '0339940200');
  await page.fill('input[placeholder="Mật khẩu"]', '123456');
  await page.click('button:has-text("Đăng nhập")');

  // Select Shop
  await page.waitForSelector('text=Tổng công ty Bưu Điện Việt Nam');
  await page.click('text=Tổng công ty Bưu Điện Việt Nam');

  // Navigate to Products
  await page.waitForURL('**/home');
  await page.click('span:has-text("Sản phẩm")');
  await page.click('a:has-text("Sản phẩm")');
  await page.waitForURL('**/product/normal');

  // Open Drawer
  await page.click('button:has-text("Thêm mới")');
  await page.waitForSelector('text=Thêm sản phẩm');

  // Add Variant
  await page.click('button:has-text("Thêm phân loại")');
  
  // Fill variant name
  const nameInput = page.getByPlaceholder('Tên', { exact: true }).first();
  await nameInput.fill('size');
  
  // Wait for react state update
  await page.waitForTimeout(500);

  // Print the HTML of the variant inputs container
  const container = page.locator('div:has-text("Phân loại")').locator('..').first();
  const html = await container.innerHTML();
  console.log('HTML STRUCTURE:');
  console.log(html);

  await browser.close();
})();
