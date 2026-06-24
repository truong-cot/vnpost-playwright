import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { CustomerPage } from '../../src/pages/customer.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Quản lý khách hàng - Chi tiết', () => {
  test('FUNC_KHACHHANG__15 - Xem chi tiết khách hàng - Tab Thông tin cá nhân hiển thị đầy đủ', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `KH Detail ${uniqueSuffix}`;
    const customerPhone = `098${Math.floor(1000000 + Math.random() * 9000000)}`;

    // ─── SETUP: Tạo KH mới để có dữ liệu kiểm tra chi tiết ──────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();
    await customerPage.clickAddNew();
    await customerPage.createCustomer(customerName, customerPhone);

    const successMsg = page.locator('.ant-message-success, .ant-notification-notice')
      .filter({ hasText: 'Thêm khách hàng thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });

    // ─── BƯỚC 1: Tìm KH vừa tạo trong danh sách và click vào tên ────────────
    await customerPage.searchCustomer(customerName);
    const nameLink = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: customerName })
      .first()
      .locator('td').nth(2)
      .locator('a');
    await expect(nameLink).toBeVisible({ timeout: 10_000 });
    await nameLink.click();

    // ─── BƯỚC 2: Xác nhận chuyển sang trang Chi tiết ─────────────────────────
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Tab "Thông tin cá nhân" active mặc định ────────────────────
    const activeTab = page.getByRole('tab', { name: 'Thông tin cá nhân', selected: true });
    await expect(activeTab).toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 4: Left card — Tên KH, SĐT, Mã KH hiển thị đúng ──────────────
    const tabPanel = page.getByRole('tabpanel', { name: 'Thông tin cá nhân' });

    // Tên KH (plain text ngay dưới avatar)
    await expect(tabPanel.getByText(customerName, { exact: true })).toBeVisible();

    // Số điện thoại (hiển thị có thể kèm mã vùng +84)
    await expect(tabPanel.getByText(customerPhone.replace(/^0/, ''), { exact: false }))
      .toBeVisible();

    // Mã khách hàng được sinh tự động (không rỗng)
    await expect(tabPanel.getByText('Mã khách hàng', { exact: false })).toBeVisible();

    // ─── BƯỚC 5: Nút hành động hiển thị đúng ────────────────────────────────
    await expect(page.getByRole('button', { name: /Sửa thông tin/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Xóa/i })).toBeVisible();

    // ─── BƯỚC 6: Các section thông tin hiển thị đầy đủ ──────────────────────
    const sections = [
      'Thông tin cá nhân',
      'Thông tin cửa hàng',
      'Thông tin khác',
      'Thông tin xuất hoá đơn',
    ];
    for (const section of sections) {
      await expect(tabPanel.getByText(section, { exact: true })).toBeVisible();
    }

    // ─── BƯỚC 7: Các trường dữ liệu tồn tại (có thể "Chưa khai báo") ────────
    // Dùng .first() vì một số label (Email, Địa chỉ) xuất hiện 2 lần:
    // trong "Thông tin cá nhân" VÀ trong "Thông tin xuất hoá đơn"
    const fields = ['Ngày sinh', 'Giới tính', 'Email', 'Địa chỉ'];
    for (const field of fields) {
      await expect(tabPanel.getByText(field, { exact: false }).first()).toBeVisible();
    }

    console.log(`[FUNC_KHACHHANG__15] Tab Thông tin cá nhân hiển thị đầy đủ cho KH: "${customerName}"`);
  });

  test('FUNC_KHACHHANG__33 - Xóa khách hàng thành công - xác nhận Đồng ý tại popup', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // Danh sách KH mẫu — tìm KH đầu tiên còn tồn tại để xóa
    const candidateNames = [
      'KH CrossList 938083',
      'KH Detail 523980',
    ];

    // ─── BƯỚC 1: Đăng nhập và vào danh sách KH ───────────────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Tìm KH mẫu còn tồn tại trong hệ thống ──────────────────────
    let targetName: string | null = null;

    for (const name of candidateNames) {
      await customerPage.searchCustomer(name);
      await page.waitForTimeout(1000); // chờ kết quả tìm kiếm
      const row = page.locator('table tbody tr.ant-table-row').filter({ hasText: name }).first();
      if (await row.isVisible()) {
        targetName = name;
        console.log(`[FUNC_KHACHHANG__33] Tìm thấy KH mẫu: "${targetName}"`);
        break;
      }
    }

    if (!targetName) {
      throw new Error('[FUNC_KHACHHANG__33] Không tìm thấy bất kỳ KH mẫu nào trong danh sách. Cần kiểm tra dữ liệu test.');
    }

    // ─── BƯỚC 3: Click vào tên KH để vào trang chi tiết ──────────────────────
    const nameLink = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: targetName }).first()
      .locator('td').nth(2).locator('a');
    await expect(nameLink).toBeVisible({ timeout: 5_000 });
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 4: Click nút Xóa ────────────────────────────────────────────────
    const deleteButton = page.getByRole('button', { name: /Xóa/i });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // ─── BƯỚC 5: Xác nhận Popconfirm hiển thị đúng nội dung ─────────────────
    // Nút Xóa dùng Ant Design Popconfirm (role="tooltip"), không phải Modal
    const popconfirm = page.getByRole('tooltip');
    await expect(popconfirm).toBeVisible({ timeout: 5_000 });

    const confirmText = popconfirm.getByText(
      /không thể hoàn tác|chắc chắn muốn xóa/i
    );
    await expect(confirmText).toBeVisible();
    console.log(`[FUNC_KHACHHANG__33] Popconfirm xóa hiển thị đúng nội dung ✓`);

    // ─── BƯỚC 6: Click "Đồng ý" trong Popconfirm ─────────────────────────────
    const confirmBtn = popconfirm.getByRole('button', { name: 'Đồng ý' });
    await confirmBtn.click();

    // ─── BƯỚC 7: Xác nhận xóa thành công (redirect hoặc toast) ───────────────
    await Promise.race([
      page.waitForURL(/\/customer$/, { timeout: 10_000 }),
      page.locator('.ant-message-success, .ant-notification-notice')
        .filter({ hasText: /xóa|thành công/i })
        .waitFor({ state: 'visible', timeout: 10_000 }),
    ]);

    // ─── BƯỚC 8: Tìm kiếm lại — KH không còn tồn tại trong danh sách ─────────
    await dashboardPage.navigateToCustomers();
    await customerPage.searchCustomer(targetName);
    await page.waitForTimeout(1500);

    const deletedRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: targetName });
    await expect(deletedRow).toHaveCount(0);

    console.log(`[FUNC_KHACHHANG__33] Đã xóa thành công KH: "${targetName}" ✓`);
  });

  test('FUNC_KHACHHANG__34 - Hủy xóa khách hàng - chọn Hủy tại popup confirm', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào danh sách KH ───────────────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Lấy KH đầu tiên trong danh sách ─────────────────────────────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 10_000 });

    const nameLink = firstRow.locator('td').nth(2).locator('a');
    const customerName = (await nameLink.textContent())?.trim() ?? '';
    console.log(`[FUNC_KHACHHANG__34] KH dùng để test: "${customerName}"`);

    // ─── BƯỚC 3: Vào trang chi tiết ──────────────────────────────────────────
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 4: Click nút Xóa ────────────────────────────────────────────────
    const deleteButton = page.getByRole('button', { name: /Xóa/i });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // ─── BƯỚC 5: Xác nhận Popconfirm hiển thị ────────────────────────────────
    const popconfirm = page.getByRole('tooltip');
    await expect(popconfirm).toBeVisible({ timeout: 5_000 });
    await expect(popconfirm.getByText(/không thể hoàn tác|chắc chắn muốn xóa/i)).toBeVisible();

    // ─── BƯỚC 6: Click "Hủy" — không xóa ────────────────────────────────────
    await popconfirm.getByRole('button', { name: 'Hủy' }).click();

    // ─── BƯỚC 7: Popconfirm đóng lại ─────────────────────────────────────────
    await expect(popconfirm).not.toBeVisible({ timeout: 3_000 });

    // ─── BƯỚC 8: Vẫn còn ở trang chi tiết, tên KH vẫn hiển thị ──────────────
    expect(page.url()).toMatch(/\/customer\/detail\/\d+/);
    await expect(page.locator('main').getByText(customerName, { exact: true }).first())
      .toBeVisible();

    // ─── BƯỚC 9: Quay lại danh sách — KH vẫn còn trong bảng ─────────────────
    await dashboardPage.navigateToCustomers();
    await customerPage.searchCustomer(customerName);

    const customerRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: customerName }).first();
    await expect(customerRow).toBeVisible({ timeout: 10_000 });

    console.log(`[FUNC_KHACHHANG__34] KH "${customerName}" vẫn tồn tại sau khi Hủy xóa ✓`);
  });

  test('FUNC_KHACHHANG__35 - Nội dung popup confirm xóa hiển thị đúng văn bản theo SRS', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // Văn bản chính xác theo SRS
    const EXPECTED_MESSAGE = 'Hành động này sẽ không thể hoàn tác, bạn có chắc chắn muốn xóa?';

    // ─── SETUP: Vào chi tiết KH đầu tiên trong danh sách ─────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    const firstNameLink = page.locator('table tbody tr.ant-table-row').first()
      .locator('td').nth(2).locator('a');
    await firstNameLink.waitFor({ state: 'visible', timeout: 10_000 });
    await firstNameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 1: Click nút Xóa ────────────────────────────────────────────────
    await page.getByRole('button', { name: /Xóa/i }).click();

    // ─── BƯỚC 2: Xác nhận Popconfirm hiển thị ────────────────────────────────
    const popconfirm = page.getByRole('tooltip');
    await expect(popconfirm).toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 3: Kiểm tra văn bản chính xác theo SRS ─────────────────────────
    await expect(popconfirm.getByText(EXPECTED_MESSAGE, { exact: true })).toBeVisible();

    // ─── BƯỚC 4: Kiểm tra đúng 2 nút: "Đồng ý" và "Hủy" ─────────────────────
    const dongYBtn = popconfirm.getByRole('button', { name: 'Đồng ý' });
    const huyBtn = popconfirm.getByRole('button', { name: 'Hủy' });
    await expect(dongYBtn).toBeVisible();
    await expect(huyBtn).toBeVisible();

    // Đảm bảo không có nút nào khác trong popconfirm
    await expect(popconfirm.getByRole('button')).toHaveCount(2);
    console.log(`[FUNC_KHACHHANG__35] Nội dung popup đúng SRS: "${EXPECTED_MESSAGE}" ✓`);
    console.log(`[FUNC_KHACHHANG__35] Đủ 2 nút: "Đồng ý" và "Hủy" ✓`);

    // ─── CLEANUP: Click Hủy, không xóa dữ liệu ────────────────────────────────
    await huyBtn.click();
    await expect(popconfirm).not.toBeVisible({ timeout: 3_000 });
  });

  test('FUNC_KHACHHANG__38 - Xóa khách hàng tại cửa hàng - kiểm tra đồng bộ xóa toàn Tổng công ty', async ({ page }) => {
    test.setTimeout(90_000); // cần thời gian tạo KH + chuyển shop + verify

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `KH Del Sync ${uniqueSuffix}`;
    const customerPhone = `093${Math.floor(1000000 + Math.random() * 9000000)}`;

    // ─── SETUP: Tạo KH tại TCT ───────────────────────────────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();
    await customerPage.clickAddNew();
    await customerPage.createCustomer(customerName, customerPhone);
    await expect(
      page.locator('.ant-message-success, .ant-notification-notice')
        .filter({ hasText: 'Thêm khách hàng thành công' })
    ).toBeVisible({ timeout: 10_000 });
    console.log(`[FUNC_KHACHHANG__38] Đã tạo KH: "${customerName}"`);

    // ─── BƯỚC 1: Chuyển sang cửa hàng con để thực hiện xóa ──────────────────
    await dashboardPage.goToSelectShop();
    await page.waitForLoadState('networkidle');
    const shopA = await selectShopPage.selectShopWithFallback(
      ['Giám đốc xã', 'Cửa hàng trưởng']
    );
    console.log(`[FUNC_KHACHHANG__38] Đang ở shop: "${shopA}" — chuẩn bị xóa KH`);

    // ─── BƯỚC 2: Tìm KH trong danh sách tại shop con và vào chi tiết ─────────
    await dashboardPage.navigateToCustomers();
    await page.waitForLoadState('networkidle');
    await customerPage.searchCustomer(customerName);

    const nameLink = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: customerName }).first()
      .locator('td').nth(2).locator('a');
    await expect(nameLink).toBeVisible({ timeout: 10_000 });
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Xóa KH tại shop con ─────────────────────────────────────────
    await page.getByRole('button', { name: /Xóa/i }).click();
    const popconfirm = page.getByRole('tooltip');
    await expect(popconfirm).toBeVisible({ timeout: 5_000 });
    await popconfirm.getByRole('button', { name: 'Đồng ý' }).click();

    // Chờ xóa xong (redirect hoặc toast)
    await Promise.race([
      page.waitForURL(/\/customer$/, { timeout: 10_000 }),
      page.locator('.ant-message-success, .ant-notification-notice')
        .filter({ hasText: /xóa|thành công/i })
        .waitFor({ state: 'visible', timeout: 10_000 }),
    ]);
    console.log(`[FUNC_KHACHHANG__38] Đã xóa tại shop "${shopA}" ✓`);

    // ─── BƯỚC 4: Kiểm tra tại cấp TCT — KH không còn tồn tại ────────────────
    await dashboardPage.goToSelectShop();
    await page.waitForLoadState('networkidle');
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();
    await customerPage.searchCustomer(customerName);
    await page.waitForTimeout(1500);

    await expect(
      page.locator('table tbody tr.ant-table-row').filter({ hasText: customerName })
    ).toHaveCount(0);
    console.log(`[FUNC_KHACHHANG__38] KH không còn tại TCT ✓`);

    // ─── BƯỚC 5: Kiểm tra tại shop con khác — KH không còn tồn tại ───────────
    await dashboardPage.goToSelectShop();
    await page.waitForLoadState('networkidle');
    const shopB = await selectShopPage.selectShopWithFallback(
      ['Quản lý tỉnh', 'Giám đốc xã', 'Cửa hàng trưởng']
    );
    console.log(`[FUNC_KHACHHANG__38] Kiểm tra tại shop khác: "${shopB}"`);

    await dashboardPage.navigateToCustomers();
    await page.waitForLoadState('networkidle');
    await customerPage.searchCustomer(customerName);
    await page.waitForTimeout(1500);

    await expect(
      page.locator('table tbody tr.ant-table-row').filter({ hasText: customerName })
    ).toHaveCount(0);
    console.log(`[FUNC_KHACHHANG__38] KH không còn tại shop "${shopB}" ✓`);
    console.log(`[FUNC_KHACHHANG__38] Đồng bộ xóa toàn TCT thành công ✓`);
  });

  test('FUNC_KHACHHANG__25 - Kiểm tra chức năng: Truy cập trực tiếp link chi tiết của khách hàng đã bị xóa', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `KH Temp ${uniqueSuffix}`;
    const customerPhone = `097${Math.floor(1000000 + Math.random() * 9000000)}`;

    // ─── BƯỚC 1: Đăng nhập và vào màn hình khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Tạo một khách hàng mới để chuẩn bị xóa ─────────────────────
    await customerPage.clickAddNew();
    await customerPage.createCustomer(customerName, customerPhone);
    await expect(
      page.locator('.ant-message-success, .ant-notification-notice')
        .filter({ hasText: 'Thêm khách hàng thành công' })
    ).toBeVisible({ timeout: 10_000 });

    // ─── BƯỚC 3: Đi vào chi tiết khách hàng và lấy URL chi tiết ───────────────
    await customerPage.searchCustomer(customerName);
    const nameLink = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: customerName })
      .first()
      .locator('td').nth(2)
      .locator('a');
    await expect(nameLink).toBeVisible({ timeout: 10_000 });
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    const detailUrl = page.url();
    console.log(`[FUNC_KHACHHANG__25] URL chi tiết khách hàng: ${detailUrl}`);

    // ─── BƯỚC 4: Thực hiện xóa khách hàng này ─────────────────────────────────
    const deleteButton = page.getByRole('button', { name: /Xóa/i });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const popconfirm = page.getByRole('tooltip');
    await expect(popconfirm).toBeVisible({ timeout: 5_000 });
    await popconfirm.getByRole('button', { name: 'Đồng ý' }).click();

    // Chờ redirect về màn danh sách /customer sau khi xóa thành công
    await page.waitForURL(/\/customer$/, { timeout: 10_000 });
    console.log(`[FUNC_KHACHHANG__25] Đã xóa khách hàng và quay lại trang danh sách.`);

    // ─── BƯỚC 5: Truy cập trực tiếp lại URL chi tiết của khách hàng đã xóa ───
    await page.goto(detailUrl);
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 6: Kiểm tra kết quả mong muốn ──────────────────────────────────
    // Đảm bảo không phát sinh lỗi hệ thống (500, crash...)
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('500 Internal Server Error');
    expect(bodyText).not.toContain('error 500');

    // Kiểm tra xem hệ thống hiển thị thông báo 'Khách hàng không tồn tại'
    // hoặc tự động chuyển về màn danh sách (URL kết thúc bằng /customer hoặc không còn chứa /detail/)
    const currentUrl = page.url();
    const isRedirectedToList = currentUrl.endsWith('/customer') || !currentUrl.includes('/detail/');

    if (isRedirectedToList) {
      console.log(`[FUNC_KHACHHANG__25] Hệ thống tự động chuyển hướng về màn danh sách khách hàng: ${currentUrl}`);
    } else {
      // Nếu không tự động chuyển hướng thì phải hiển thị thông báo/text lỗi "không tồn tại"
      const errorIndicator = page.locator('body').filter({
        hasText: /không tồn tại|không tìm thấy/i
      });
      await expect(errorIndicator.first()).toBeVisible({ timeout: 5_000 });
      console.log(`[FUNC_KHACHHANG__25] Hệ thống hiển thị thông báo/nội dung lỗi không tồn tại.`);
    }
  });

  test('FUNC_KHACHHANG__16 - Xem chi tiết khách hàng - Tab 2 Đơn hàng hiển thị danh sách đơn đã mua', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào danh sách khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Tìm kiếm khách hàng tên "a Thành" và click mở chi tiết ───────
    await customerPage.searchCustomer('a Thành');
    const nameLink = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: 'a Thành' })
      .first()
      .locator('td').nth(2)
      .locator('a');
    await expect(nameLink).toBeVisible({ timeout: 10_000 });
    await nameLink.click();

    // Chờ chuyển sang trang Chi tiết
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Click Tab 2 'Đơn hàng' ────────────────────────────────────────
    const ordersTab = page.getByRole('tab', { name: 'Đơn hàng' });
    await expect(ordersTab).toBeVisible({ timeout: 5_000 });
    await ordersTab.click();

    // ─── BƯỚC 4: Kiểm tra kết quả mong muốn ──────────────────────────────────
    // 1. Tab Đơn hàng được chọn
    const activeTab = page.getByRole('tab', { name: 'Đơn hàng', selected: true });
    await expect(activeTab).toBeVisible({ timeout: 5_000 });

    // 2. Hiển thị danh sách đơn hàng đã mua
    const ordersTable = page.locator('.ant-table-body, .ant-table-content').first();
    await expect(ordersTable).toBeVisible({ timeout: 5_000 });

    // Lấy tất cả các hàng đơn hàng
    const orderRows = ordersTable.locator('tr.ant-table-row');
    const rowCount = await orderRows.count();
    console.log(`[FUNC_KHACHHANG__16] Tìm thấy ${rowCount} đơn hàng trong danh sách.`);
    
    // Đảm bảo có ít nhất 1 đơn hàng hiển thị
    expect(rowCount).toBeGreaterThan(0);

    // 3. Đúng thông tin từng đơn (mã đơn, ngày, giá trị, trạng thái)
    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      const row = orderRows.nth(i);
      
      // Mã đơn (Cột 2 - nth(1)): Phải chứa link dẫn tới trang chi tiết đơn hàng
      const orderCodeLink = row.locator('td').nth(1).locator('a');
      await expect(orderCodeLink).toBeVisible();
      const orderCodeText = await orderCodeLink.textContent();
      expect(orderCodeText?.trim()).not.toBe('');

      // Ngày (Cột 3 - nth(2)): Phải hiển thị định dạng ngày giờ dd/mm/yyyy hh:mm
      const orderDateCell = row.locator('td').nth(2);
      const orderDateText = await orderDateCell.textContent();
      expect(orderDateText?.trim()).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);

      // Trạng thái thanh toán (Cột 4 - nth(3))
      const paymentStatusCell = row.locator('td').nth(3);
      const paymentStatusText = await paymentStatusCell.textContent();
      expect(paymentStatusText?.trim()).not.toBe('');

      // Tổng tiền / Giá trị đơn hàng (Cột 5 - nth(4))
      const totalAmountCell = row.locator('td').nth(4);
      const totalAmountText = await totalAmountCell.textContent();
      expect(totalAmountText?.trim()).not.toBe('');

      console.log(`[FUNC_KHACHHANG__16] Đơn hàng #${i + 1}: Mã=${orderCodeText?.trim()}, Ngày=${orderDateText?.trim()}, Trạng thái=${paymentStatusText?.trim()}, Giá trị=${totalAmountText?.trim()}`);
    }
  });

  test('FUNC_KHACHHANG__17 - Xem Tab 2 Đơn hàng khi khách hàng chưa có đơn hàng nào', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const customerName = 'Khách Hàng 293035669';

    // ─── BƯỚC 1: Đăng nhập và vào danh sách khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Tìm kiếm khách hàng "Khách Hàng 293035669" ─────────────────
    await customerPage.searchCustomer(customerName);
    const candidateRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: customerName })
      .first();

    // Nếu không tìm thấy khách hàng này, tiến hành tạo mới
    if (!(await candidateRow.isVisible())) {
      console.log(`[FUNC_KHACHHANG__17] Khách hàng "${customerName}" chưa tồn tại. Tiến hành tạo mới.`);
      const randomPhone = `096${Math.floor(1000000 + Math.random() * 9000000)}`;
      await customerPage.clickAddNew();
      await customerPage.createCustomer(customerName, randomPhone);

      const successMsg = page.locator('.ant-message-success, .ant-notification-notice')
        .filter({ hasText: 'Thêm khách hàng thành công' });
      await expect(successMsg).toBeVisible({ timeout: 10_000 });

      // Tìm kiếm lại khách hàng vừa tạo
      await customerPage.searchCustomer(customerName);
    }

    // ─── BƯỚC 3: Mở chi tiết khách hàng ───────────────────────────────────────
    const nameLink = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: customerName })
      .first()
      .locator('td').nth(2)
      .locator('a');
    await expect(nameLink).toBeVisible({ timeout: 10_000 });
    await nameLink.click();

    // Chờ chuyển sang trang Chi tiết
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 4: Click Tab 2 'Đơn hàng' ────────────────────────────────────────
    const ordersTab = page.getByRole('tab', { name: 'Đơn hàng' });
    await expect(ordersTab).toBeVisible({ timeout: 5_000 });
    await ordersTab.click();

    // ─── BƯỚC 5: Kiểm tra kết quả mong muốn ──────────────────────────────────
    // 1. Tab Đơn hàng được chọn
    const activeTab = page.getByRole('tab', { name: 'Đơn hàng', selected: true });
    await expect(activeTab).toBeVisible({ timeout: 5_000 });

    // 2. Hiển thị trạng thái rỗng (chưa có đơn hàng nào)
    const emptyState = page.locator('.ant-empty, .ant-table-empty').first();
    await expect(emptyState).toBeVisible({ timeout: 5_000 });
    await expect(emptyState).toContainText(/Không có dữ liệu|No Data|Trống/i);

    // 3. Đảm bảo không bị lỗi giao diện (kiểm tra không hiển thị text báo lỗi hệ thống/crash)
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('500 Internal Server Error');
    expect(bodyText).not.toContain('error 500');

    console.log(`[FUNC_KHACHHANG__17] Xác nhận Tab Đơn hàng hiển thị trạng thái rỗng "Không có dữ liệu" chính xác.`);
  });

  test('FUNC_KHACHHANG__18 - Xem chi tiết khách hàng - Tab 3 Sản phẩm đã mua hiển thị đúng dữ liệu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào danh sách khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Tìm kiếm khách hàng tên "a Thành" và click mở chi tiết ───────
    await customerPage.searchCustomer('a Thành');
    const nameLink = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: 'a Thành' })
      .first()
      .locator('td').nth(2)
      .locator('a');
    await expect(nameLink).toBeVisible({ timeout: 10_000 });
    await nameLink.click();

    // Chờ chuyển sang trang Chi tiết
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Click Tab 3 'Sản phẩm đã mua' ───────────────────────────────
    const productsTab = page.getByRole('tab', { name: 'Sản phẩm đã mua' });
    await expect(productsTab).toBeVisible({ timeout: 5_000 });
    await productsTab.click();

    // ─── BƯỚC 4: Kiểm tra kết quả mong muốn ──────────────────────────────────
    // 1. Tab Sản phẩm đã mua được chọn
    const activeTab = page.getByRole('tab', { name: 'Sản phẩm đã mua', selected: true });
    await expect(activeTab).toBeVisible({ timeout: 5_000 });

    // 2. Kiểm tra hiển thị bảng sản phẩm
    const productsTable = page.locator('.ant-table-body, .ant-table-content').first();
    await expect(productsTable).toBeVisible({ timeout: 5_000 });

    // 3. Kiểm tra các tiêu đề cột hiển thị đúng
    const tableHeader = page.locator('.ant-table-thead');
    await expect(tableHeader).toContainText('Ngày mua');
    await expect(tableHeader).toContainText('Tên sản phẩm');
    await expect(tableHeader).toContainText('Đơn hàng');
    await expect(tableHeader).toContainText('Loại');
    await expect(tableHeader).toContainText('Số lượng');
    await expect(tableHeader).toContainText('Tổng tiền');

    // 4. Kiểm tra dòng dữ liệu (nếu có)
    const rows = productsTable.locator('tr.ant-table-row');
    const rowCount = await rows.count();
    console.log(`[FUNC_KHACHHANG__18] Tìm thấy ${rowCount} dòng sản phẩm đã mua.`);

    if (rowCount > 0) {
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const row = rows.nth(i);
        
        // Tên sản phẩm
        const productNameCell = row.locator('td').nth(2);
        await expect(productNameCell).toBeVisible();
        expect(await productNameCell.textContent()).not.toBe('');

        // Đơn hàng (liên kết mã đơn)
        const orderLink = row.locator('td').nth(3).locator('a');
        await expect(orderLink).toBeVisible();
        expect(await orderLink.textContent()).not.toBe('');

        // Số lượng
        const qtyCell = row.locator('td').nth(5);
        expect(await qtyCell.textContent()).not.toBe('');

        // Tổng tiền
        const totalCell = row.locator('td').nth(6);
        expect(await totalCell.textContent()).not.toBe('');
      }
    } else {
      // Nếu rỗng/lỗi, hiển thị trạng thái trống hợp lệ
      const emptyState = page.locator('.ant-empty, .ant-table-empty').first();
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText(/Trống|Không có dữ liệu/i);
    }

    // Đảm bảo không lỗi giao diện
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('500 Internal Server Error');
    expect(bodyText).not.toContain('error 500');

    console.log(`[FUNC_KHACHHANG__18] Xác nhận cấu trúc danh sách Sản phẩm đã mua hiển thị đúng.`);
  });
});
