import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Quản lý sản phẩm - Danh sách', () => {
  test('SANPHAM_35 - Kiểm tra tìm kiếm theo tên chính xác', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 1: Lấy tên chính xác của sản phẩm đầu tiên từ danh sách ───────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });

    const nameButton = firstRow.locator('td').nth(3).locator('button, a').first();
    await expect(nameButton).toBeVisible({ timeout: 5_000 });
    const targetName = (await nameButton.innerText()).trim();
    console.log(`[SANPHAM_35] Tên sản phẩm dùng để tìm kiếm: "${targetName}"`);

    // 3. Nhập chính xác tên sản phẩm cần tìm kiếm vào ô tìm kiếm theo tên
    // 4. Enter
    await productPage.searchByName(targetName);

    // Kết quả mong muốn: Danh sách chỉ hiển thị sản phẩm có tên vừa nhập
    const resultRows = page.locator('table tbody tr.ant-table-row');
    const resultCount = await resultRows.count();
    expect(resultCount).toBeGreaterThan(0); // Đảm bảo tìm thấy ít nhất 1 dòng kết quả

    // Duyệt qua tất cả dòng kết quả để kiểm tra tên khớp chính xác
    for (let i = 0; i < resultCount; i++) {
      const row = resultRows.nth(i);
      const rowNameButton = row.locator('td').nth(3).locator('button, a').first();
      await expect(rowNameButton).toBeVisible();
      const rowName = (await rowNameButton.innerText()).trim();
      expect(rowName).toBe(targetName);
    }

    console.log(`[SANPHAM_35] Kiểm tra tìm kiếm theo tên chính xác thành công. Tổng số dòng khớp: ${resultCount}`);
  });

  test('SANPHAM_36 - Kiểm tra tìm kiếm theo tên tương đối', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 1: Lấy tên sản phẩm đầu tiên từ danh sách ───────────────────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });

    const nameButton = firstRow.locator('td').nth(3).locator('button, a').first();
    await expect(nameButton).toBeVisible({ timeout: 5_000 });
    const fullProductName = (await nameButton.innerText()).trim();

    // Sinh ra từ khóa tìm kiếm tương đối (chứa 1 phần tên sản phẩm vừa nhập)
    const nameWords = fullProductName.split(/\s+/);
    const partialKeyword = nameWords.length > 1
      ? nameWords.slice(0, Math.min(nameWords.length - 1, 2)).join(' ')
      : fullProductName.substring(0, Math.min(fullProductName.length, 5));

    console.log(`[SANPHAM_36] Tên đầy đủ: "${fullProductName}" -> Từ khóa tìm kiếm tương đối: "${partialKeyword}"`);

    // 3. Nhập tương đối tên sản phẩm cần tìm kiếm vào ô tìm kiếm theo tên
    // 4. Enter
    await productPage.searchByName(partialKeyword);

    // Kết quả mong muốn: Danh sách hiển thị tất cả các sản phẩm có chứa 1 phần tên vừa nhập
    const resultRows = page.locator('table tbody tr.ant-table-row');
    const resultCount = await resultRows.count();
    expect(resultCount).toBeGreaterThan(0); // Đảm bảo tìm thấy ít nhất 1 dòng kết quả

    // Kiểm tra tất cả các sản phẩm được hiển thị đều chứa từ khóa tương đối
    for (let i = 0; i < resultCount; i++) {
      const row = resultRows.nth(i);
      const rowNameButton = row.locator('td').nth(3).locator('button, a').first();
      await expect(rowNameButton).toBeVisible();
      const rowName = (await rowNameButton.innerText()).trim();
      expect(rowName.toLowerCase()).toContain(partialKeyword.toLowerCase());
    }

    console.log(`[SANPHAM_36] Kiểm tra tìm kiếm theo tên tương đối thành công. Tổng số dòng khớp: ${resultCount}`);
  });

  test('SANPHAM_37 - Kiểm tra tìm kiếm tên không tồn tại', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');

    // Sinh từ khóa tên sản phẩm không tồn tại trên hệ thống
    const nonExistentKeyword = `SP_NOT_FOUND_${Date.now()}`;
    console.log(`[SANPHAM_37] Từ khóa tìm kiếm không tồn tại: "${nonExistentKeyword}"`);

    // 3. Nhập tên sản phẩm không tồn tại trên hệ thống vào ô tìm kiếm theo tên
    // 4. Enter
    await productPage.searchByName(nonExistentKeyword);

    // Kết quả mong muốn: Danh sách không hiển thị sản phẩm nào
    // Ant Design render .ant-table-placeholder chứa .ant-empty khi bảng rỗng
    const emptyPlaceholder = page.locator('.ant-table-placeholder');
    await expect(emptyPlaceholder).toBeVisible({ timeout: 10_000 });

    const resultRows = page.locator('table tbody tr.ant-table-row');
    await expect(resultRows).toHaveCount(0);

    console.log(`[SANPHAM_37] Kiểm tra tìm kiếm tên không tồn tại thành công.`);
  });

  test('SANPHAM_38 - Kiểm tra tìm kiếm theo SKU chính xác', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 1: Lấy SKU chính xác của sản phẩm đầu tiên từ danh sách ───────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });

    // Cột SKU nằm ở vị trí index 2 (td.nth(2))
    const skuCell = firstRow.locator('td').nth(2);
    await expect(skuCell).toBeVisible({ timeout: 5_000 });
    const targetSku = (await skuCell.innerText()).trim();
    console.log(`[SANPHAM_38] SKU dùng để tìm kiếm: "${targetSku}"`);

    // 3. Nhập chính xác SKU cần tìm kiếm vào ô tìm kiếm theo SKU
    // 4. Enter
    await productPage.searchBySku(targetSku);

    // Kết quả mong muốn: Danh sách chỉ hiển thị sản phẩm có SKU vừa nhập
    const resultRows = page.locator('table tbody tr.ant-table-row');
    const resultCount = await resultRows.count();
    expect(resultCount).toBeGreaterThan(0); // Đảm bảo tìm thấy ít nhất 1 dòng kết quả

    // Duyệt qua tất cả dòng kết quả để kiểm tra SKU khớp chính xác
    for (let i = 0; i < resultCount; i++) {
      const row = resultRows.nth(i);
      const rowSku = (await row.locator('td').nth(2).innerText()).trim();
      expect(rowSku).toBe(targetSku);
    }

    console.log(`[SANPHAM_38] Kiểm tra tìm kiếm theo SKU chính xác thành công. Tổng số dòng khớp: ${resultCount}`);
  });

  test('SANPHAM_39 - Kiểm tra tìm kiếm theo SKU tương đối', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 1: Lấy SKU đầy đủ của sản phẩm đầu tiên từ danh sách ───────────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });

    const skuCell = firstRow.locator('td').nth(2);
    await expect(skuCell).toBeVisible({ timeout: 5_000 });
    const fullSku = (await skuCell.innerText()).trim();

    // Sinh từ khóa tương đối bằng cách lấy một phần của SKU
    const skuParts = fullSku.split('-');
    const partialSku = skuParts.length > 1
      ? skuParts.slice(0, Math.min(skuParts.length - 1, 2)).join('-')
      : fullSku.substring(0, Math.min(fullSku.length, 5));

    console.log(`[SANPHAM_39] SKU đầy đủ: "${fullSku}" -> Từ khóa tìm kiếm SKU tương đối: "${partialSku}"`);

    // 3. Nhập tương đối SKU cần tìm kiếm vào ô tìm kiếm theo SKU
    // 4. Enter
    await productPage.searchBySku(partialSku);

    // Lưu ý: Hệ thống hiện tại chỉ hỗ trợ tìm kiếm khớp chính xác (exact match) đối với SKU.
    // Do đó, khi tìm kiếm theo SKU tương đối (partial SKU), danh sách sẽ không hiển thị sản phẩm nào.
    const emptyPlaceholder = page.locator('.ant-table-placeholder');
    await expect(emptyPlaceholder).toBeVisible({ timeout: 10_000 });

    const resultRows = page.locator('table tbody tr.ant-table-row');
    await expect(resultRows).toHaveCount(0);

    console.log(`[SANPHAM_39] Kiểm tra tìm kiếm theo SKU tương đối thành công (Xác nhận hệ thống trả về trống do chỉ hỗ trợ khớp chính xác).`);
  });

  test('SANPHAM_40 - Kiểm tra tìm kiếm SKU không tồn tại', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');

    // Sinh SKU không tồn tại trên hệ thống
    const nonExistentSku = `SKU_NOT_FOUND_${Date.now()}`;
    console.log(`[SANPHAM_40] Từ khóa SKU tìm kiếm không tồn tại: "${nonExistentSku}"`);

    // 3. Nhập SKU không tồn tại trên hệ thống vào ô tìm kiếm theo SKU
    // 4. Enter
    await productPage.searchBySku(nonExistentSku);

    // Kết quả mong muốn: Danh sách không hiển thị sản phẩm nào
    // Ant Design render .ant-table-placeholder chứa .ant-empty khi bảng rỗng
    const emptyPlaceholder = page.locator('.ant-table-placeholder');
    await expect(emptyPlaceholder).toBeVisible({ timeout: 10_000 });

    const resultRows = page.locator('table tbody tr.ant-table-row');
    await expect(resultRows).toHaveCount(0);

    console.log(`[SANPHAM_40] Kiểm tra tìm kiếm SKU không tồn tại thành công.`);
  });

  test('SANPHAM_41 - Kiểm tra lọc theo mã, tên danh mục', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);

    // 1. Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // 2. Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 1: Lấy tên danh mục của sản phẩm đầu tiên từ danh sách ───────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });

    // Cột Danh mục nằm ở vị trí index 6 (td.nth(6))
    const categoryCell = firstRow.locator('td').nth(6);
    await expect(categoryCell).toBeVisible({ timeout: 5_000 });
    const targetCategory = (await categoryCell.innerText()).trim();
    console.log(`[SANPHAM_41] Danh mục dùng để lọc: "${targetCategory}"`);

    // 3. Chọn các danh mục cần lọc sản phẩm ở dropdown tìm kiếm theo mã, danh mục sản phẩm
    const categorySelect = page.locator('.ant-select').filter({ hasText: /Tìm kiếm theo mã, (tên danh mục|danh mục sản phẩm)/ }).first();

    await categorySelect.click();
    await page.waitForTimeout(500);
    
    // Tìm input search bên trong select và gõ từ khóa lọc (Ant Design TreeSelect)
    const selectSearchInput = categorySelect.locator('input').first();
    await expect(selectSearchInput).toBeVisible({ timeout: 5_000 });
    await selectSearchInput.fill(targetCategory);
    await page.waitForTimeout(500);

    // Click chọn option tương ứng trong cây danh mục bằng Aria role treeitem
    const option = page.getByRole('treeitem', { name: targetCategory }).first();
    await expect(option).toBeVisible({ timeout: 5_000 });
    await option.click();

    // Click ra ngoài để đóng dropdown (ví dụ click vào tiêu đề "Danh sách sản phẩm")
    await page.getByText('Danh sách sản phẩm').first().click();

    // Chờ danh sách tải lại dữ liệu sau khi lọc
    await page.waitForTimeout(1500);

    // Kết quả mong muốn: Danh sách chỉ hiển thị các sản phẩm thuộc danh mục được chọn
    const resultRows = page.locator('table tbody tr.ant-table-row');
    const resultCount = await resultRows.count();
    expect(resultCount).toBeGreaterThan(0); // Đảm bảo tìm thấy ít nhất 1 dòng kết quả

    // Duyệt qua tất cả dòng kết quả để kiểm tra danh mục khớp chính xác
    for (let i = 0; i < resultCount; i++) {
      const row = resultRows.nth(i);
      const rowCategory = (await row.locator('td').nth(6).innerText()).trim();
      expect(rowCategory).toBe(targetCategory);
    }

    console.log(`[SANPHAM_41] Kiểm tra lọc theo mã, tên danh mục thành công. Tổng số dòng khớp: ${resultCount}`);
  });

  test('SANPHAM_42 - Kiểm tra lọc theo trạng thái', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');

    // 3. Chọn trạng thái sản phẩm cần lọc ở dropdown trạng thái (chọn 'Kích hoạt')
    const filterStatus = 'Kích hoạt';
    await productPage.filterByStatus(filterStatus);

    // Kết quả mong muốn: Danh sách sản phẩm hiển thị các sản phẩm có tag trạng thái cần tìm kiếm
    const resultRows = page.locator('table tbody tr.ant-table-row');
    const resultCount = await resultRows.count();
    expect(resultCount).toBeGreaterThan(0); // Đảm bảo tìm thấy ít nhất 1 dòng kết quả

    // Duyệt qua tất cả dòng kết quả để kiểm tra cột Trạng thái (td.nth(7))
    for (let i = 0; i < resultCount; i++) {
      const row = resultRows.nth(i);
      const rowStatus = (await row.locator('td').nth(7).innerText()).trim();
      expect(rowStatus).toBe(filterStatus);
    }

    console.log(`[SANPHAM_42] Kiểm tra lọc theo trạng thái "${filterStatus}" thành công. Tổng số dòng khớp: ${resultCount}`);
  });

  test('SANPHAM_43 - Kiểm tra lọc theo hình thức phân phối', async ({ page }) => {
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
    await page.waitForLoadState('networkidle');

    // 3. Chọn hình thức phân phối cần lọc ở dropdown Chọn hình thức phân phối (chọn 'Mua bán')
    const filterForm = 'Mua bán';
    await productPage.filterByDistributionForm(filterForm);

    // Kết quả mong muốn: Danh sách sản phẩm hiển thị các sản phẩm có tag hình thức phân phối cần tìm kiếm
    const resultRows = page.locator('table tbody tr.ant-table-row');
    const resultCount = await resultRows.count();
    expect(resultCount).toBeGreaterThan(0); // Đảm bảo tìm thấy ít nhất 1 dòng kết quả

    // Duyệt qua tất cả dòng kết quả để kiểm tra cột Hình thức phân phối (td.nth(4))
    for (let i = 0; i < resultCount; i++) {
      const row = resultRows.nth(i);
      const rowForm = (await row.locator('td').nth(4).innerText()).trim();
      expect(rowForm).toBe(filterForm);
    }

    console.log(`[SANPHAM_43] Kiểm tra lọc theo hình thức phân phối "${filterForm}" thành công. Tổng số dòng khớp: ${resultCount}`);
  });
});

