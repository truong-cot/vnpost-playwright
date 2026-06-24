import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { CustomerPage } from '../../src/pages/customer.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Quản lý khách hàng - Danh sách', () => {
  test('FUNC_KHACHHANG__11 - Xem danh sách khách hàng hiển thị đúng sau khi thêm mới thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `KH List Check ${uniqueSuffix}`;
    const customerPhone = `096${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Bước 1: Đăng nhập và vào trang Khách hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // Bước 2: Tạo khách hàng mới để có dữ liệu kiểm tra danh sách
    await customerPage.clickAddNew();
    await customerPage.createCustomer(customerName, customerPhone);

    // Bước 3: Xác nhận tạo thành công
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice')
      .filter({ hasText: 'Thêm khách hàng thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .not.toBeVisible({ timeout: 10_000 });

    // Bước 4: Tìm kiếm khách hàng vừa tạo theo tên
    await customerPage.searchCustomer(customerName);

    // Bước 5: Xác nhận danh sách hiển thị đúng thông tin
    const customerRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: customerName }).first();
    await expect(customerRow).toBeVisible({ timeout: 10_000 });

    // Xác nhận cột Tên khách hàng hiển thị đúng
    const nameCell = customerRow.locator('td').filter({ hasText: customerName });
    await expect(nameCell).toBeVisible();

    // Xác nhận cột Số điện thoại hiển thị đúng
    await expect(customerRow).toContainText(customerPhone);

    // Xác nhận Mã khách hàng được sinh tự động (không rỗng)
    const codeCell = customerRow.locator('td').nth(1);
    const customerCode = (await codeCell.textContent())?.trim() ?? '';
    expect(customerCode.length).toBeGreaterThan(0);
    console.log(`[FUNC_KHACHHANG__11] Mã KH được sinh: ${customerCode}`);
  });

  test('FUNC_KHACHHANG__12 - Xem danh sách khách hàng khi không có kết quả tìm kiếm', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // Từ khóa tìm kiếm chắc chắn không tồn tại trong hệ thống
    const nonExistentKeyword = 'XXXXXXXXX_NOTFOUND_99999';

    // Bước 1: Đăng nhập và vào trang Khách hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // Bước 2: Tìm kiếm với từ khóa không tồn tại
    await customerPage.searchCustomer(nonExistentKeyword);

    // Bước 3: Xác nhận hiển thị trạng thái rỗng (empty state)
    // Ant Design render .ant-table-placeholder chứa .ant-empty bên trong
    // Dùng .ant-table-placeholder (outer row) để tránh strict mode violation khi cả 2 cùng hiện
    const emptyState = page.locator('.ant-table-placeholder');
    await expect(emptyState).toBeVisible({ timeout: 10_000 });

    // Bước 4: Xác nhận không có dòng dữ liệu nào trong bảng
    const dataRows = page.locator('table tbody tr.ant-table-row');
    await expect(dataRows).toHaveCount(0);

    // Bước 5: Xác nhận không có lỗi giao diện (không có error toast)
    const errorToast = page.locator('.ant-message-error, .ant-notification-notice-error');
    await expect(errorToast).toHaveCount(0);

    console.log(`[FUNC_KHACHHANG__12] Trạng thái rỗng hiển thị đúng với từ khóa: "${nonExistentKeyword}"`);
  });

  test('FUNC_KHACHHANG__13 - Danh sách khách hàng đồng bộ hiển thị khách hàng được tạo từ cửa hàng khác', async ({ page }) => {
    test.setTimeout(60_000); // cần thời gian chuyển shop và chờ sync

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `KH CrossList ${uniqueSuffix}`;
    const customerPhone = `097${Math.floor(1000000 + Math.random() * 9000000)}`;

    // ─── BƯỚC 1: Tạo KH tại cấp TCT ─────────────────────────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();
    await customerPage.clickAddNew();
    await customerPage.createCustomer(customerName, customerPhone);

    const successMsg = page.locator('.ant-message-success, .ant-notification-notice')
      .filter({ hasText: 'Thêm khách hàng thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    console.log(`[FUNC_KHACHHANG__13] Đã tạo KH tại TCT: ${customerName} / ${customerPhone}`);

    // ─── BƯỚC 2: Chuyển sang cửa hàng con (shop B) ───────────────────────────
    await dashboardPage.goToSelectShop();
    await page.waitForLoadState('networkidle');
    const selectedShop = await selectShopPage.selectShopWithFallback(
      ['Quản lý tỉnh', 'Giám đốc xã', 'Cửa hàng trưởng']
      // fallback về TCT nếu không tìm thấy shop con (mặc định của method)
    );
    console.log(`[FUNC_KHACHHANG__13] Đã chuyển sang shop: ${selectedShop}`);

    // ─── BƯỚC 3: Vào danh sách KH tại shop B và tìm KH vừa tạo ──────────────
    await dashboardPage.navigateToCustomers();
    await page.waitForLoadState('networkidle');
    await customerPage.searchCustomer(customerName);

    // ─── BƯỚC 4: Xác nhận KH xuất hiện trong danh sách của shop B ────────────
    const customerRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: customerName }).first();
    await expect(customerRow).toBeVisible({ timeout: 15_000 });

    // Xác nhận SĐT hiển thị đúng trong cùng row
    await expect(customerRow).toContainText(customerPhone);

    console.log(`[FUNC_KHACHHANG__13] KH "${customerName}" đồng bộ thành công tại shop: ${selectedShop}`);
  });

  test('FUNC_KHACHHANG__14 - Click vào Tên khách hàng trong danh sách để chuyển sang màn chi tiết', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // Bước 1: Đăng nhập và vào trang Khách hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // Bước 2: Lấy tên và link của khách hàng đầu tiên trong danh sách
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 10_000 });

    // Link tên KH nằm trong cột thứ 3 (td index 2)
    const nameLink = firstRow.locator('td').nth(2).locator('a');
    const customerName = (await nameLink.textContent())?.trim() ?? '';
    const customerHref = await nameLink.getAttribute('href') ?? '';
    console.log(`[FUNC_KHACHHANG__14] Click vào KH: "${customerName}" → ${customerHref}`);

    // Bước 3: Click vào tên khách hàng
    await nameLink.click();

    // Bước 4: Xác nhận đã chuyển sang URL chi tiết /customer/detail/{id}
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/customer\/detail\/\d+/);

    // Bước 5: Xác nhận trang chi tiết hiển thị đúng tên khách hàng vừa click
    // Tên KH là text node trực tiếp trong tabpanel "Thông tin cá nhân", không có class riêng
    await page.waitForLoadState('networkidle');
    const detailName = page.locator('main').getByText(customerName, { exact: true }).first();
    await expect(detailName).toBeVisible({ timeout: 10_000 });

    console.log(`[FUNC_KHACHHANG__14] Màn chi tiết hiển thị đúng KH: "${customerName}"`);
  });
});
