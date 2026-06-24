import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { CustomerPage } from '../../src/pages/customer.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Quản lý khách hàng', () => {
  test('FUNC_KHACHHANG__1 - Thêm mới khách hàng thành công với 2 trường bắt buộc (Tên + SĐT)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `Nguyễn Thị Lan ${uniqueSuffix}`;
    const customerPhone = `090${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới mục Khách hàng
    await dashboardPage.navigateToCustomers();

    // Bước 3: Mở drawer Thêm khách hàng
    await customerPage.clickAddNew();

    // Bước 4: Tạo khách hàng với các trường bắt buộc
    await customerPage.createCustomer(customerName, customerPhone);

    // Bước 5: Xác nhận thông báo thành công hiển thị
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm khách hàng thành công' });
    await expect(successMsg).toBeVisible();

    // Chờ cho drawer đóng lại hoàn toàn
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' })).not.toBeVisible();

    // Bước 6: Tìm kiếm khách hàng vừa tạo trong danh sách bằng tên
    await customerPage.searchCustomer(customerName);

    // Bước 7: Xác nhận chi tiết thông tin hiển thị trên bảng danh sách
    const customerRow = page.locator('tr').filter({ hasText: customerName }).first();
    await expect(customerRow).toBeVisible();
    await expect(customerRow).toContainText(customerPhone);
  });

  test('FUNC_KHACHHANG__2 - Thêm khách hàng với đầy đủ Thông tin cơ bản, Thông tin xuất hóa đơn và Địa chỉ liên hệ', async ({ page }) => {
    test.setTimeout(60_000); // Tăng timeout vì test này fill nhiều fields
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `Nguyễn Thị Lan Full ${uniqueSuffix}`;
    const customerPhone = `090${Math.floor(1000000 + Math.random() * 9000000)}`;
    const taxCode = `01${uniqueSuffix}0123`; // MST 10 chữ số hợp lệ

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới mục Khách hàng
    await dashboardPage.navigateToCustomers();

    // Bước 3: Mở drawer Thêm khách hàng
    await customerPage.clickAddNew();

    // Bước 4: Tạo khách hàng với đầy đủ thông tin
    await customerPage.createCustomerFull({
      name: customerName,
      phone: customerPhone,
      email: `lan.nguyen.${uniqueSuffix}@example.com`,
      gender: 'Nữ',
      dob: '15/10/1995',
      taxCode: taxCode,
      invoiceCompany: `Công Ty Lan Bưu Điện ${uniqueSuffix}`,
      invoiceName: 'Nguyễn Thị Lan',
      idNumber: '012345678901',
      invoicePhone: '0901234567',
      invoiceEmail: 'hoadon.lan@example.com',
      invoiceAddress: '123 Đường Bưu Điện, Quận 1, TP. HCM',
      address: '456 Đường Nguyễn Trãi, Quận 5, TP. HCM',
      facebook: `https://facebook.com/lan.nguyen.${uniqueSuffix}`,
      zalo: 'https://zalo.me/0901234567'
    });

    // Bước 5: Xác nhận thông báo thành công hiển thị
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm khách hàng thành công' });
    await expect(successMsg).toBeVisible();

    // Chờ cho drawer đóng lại hoàn toàn
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' })).not.toBeVisible();

    // Bước 6: Tìm kiếm khách hàng vừa tạo trong danh sách bằng tên
    await customerPage.searchCustomer(customerName);

    // Bước 7: Xác nhận chi tiết thông tin hiển thị trên bảng danh sách
    const customerRow = page.locator('tr').filter({ hasText: customerName }).first();
    await expect(customerRow).toBeVisible();
    await expect(customerRow).toContainText(customerPhone);
  });

  test('FUNC_KHACHHANG__3 - Tạo khách hàng tại cấp TCT - đồng bộ xuống tất cả điểm bán', async ({ page }) => {
    test.setTimeout(90_000); // Cross-shop test cần nhiều thời gian hơn

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `KH TCT Sync ${uniqueSuffix}`;
    const customerPhone = `090${Math.floor(1000000 + Math.random() * 9000000)}`;

    // ─── GIAI ĐOẠN 1: Tạo khách hàng tại cấp TCT ───────────────────────────
    // Bước 1: Đăng nhập và chọn cấp Tổng công ty
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Vào mục Khách hàng
    await dashboardPage.navigateToCustomers();

    // Bước 3: Mở drawer và tạo khách hàng
    await customerPage.clickAddNew();
    await customerPage.createCustomer(customerName, customerPhone);

    // Bước 4: Xác nhận thông báo thành công
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice')
      .filter({ hasText: 'Thêm khách hàng thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .not.toBeVisible({ timeout: 10_000 });

    // ─── GIAI ĐOẠN 2: Kiểm tra đồng bộ tại điểm bán con ────────────────────
    // Bước 5: Quay về trang chọn cửa hàng và chọn điểm bán con
    await dashboardPage.goToSelectShop();
    // Chọn điểm bán con theo thứ tự ưu tiên:
    // Quản lý tỉnh → Giám đốc xã → Cửa hàng trưởng → fallback Admin (TCT)
    const selectedShop = await selectShopPage.selectShopWithFallback(
      ['Quản lý tỉnh', 'Giám đốc xã', 'Cửa hàng trưởng'],
      'Tổng công ty Bưu Điện Việt Nam'
    );
    console.log(`[FUNC_KHACHHANG__3] Đang kiểm tra tại: ${selectedShop}`);

    // Bước 6: Vào mục Khách hàng tại điểm bán con
    await dashboardPage.navigateToCustomers();

    // Bước 7: Tìm kiếm khách hàng theo tên
    await customerPage.searchCustomer(customerName);

    // Bước 8: Xác nhận khách hàng xuất hiện trong danh sách điểm bán con
    const syncedRow = page.locator('tr').filter({ hasText: customerName }).first();
    await expect(syncedRow).toBeVisible({ timeout: 10_000 });
    await expect(syncedRow).toContainText(customerPhone);
  });

  test('FUNC_KHACHHANG__4 - Tạo khách hàng tại cửa hàng - đồng bộ đẩy lên cấp TCT và các cửa hàng khác', async ({ page }) => {
    test.setTimeout(120_000); // 3 giai đoạn: tạo + kiểm TCT + kiểm shop khác

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `KH Shop Sync ${uniqueSuffix}`;
    const customerPhone = `091${Math.floor(1000000 + Math.random() * 9000000)}`;

    // ─── GIAI ĐOẠN 1: Tạo khách hàng tại cửa hàng con ────────────────────
    // Bước 1: Đăng nhập và chọn một cửa hàng con (không phải TCT)
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    const createdAtShop = await selectShopPage.selectShopWithFallback(
      ['Quản lý tỉnh', 'Giám đốc xã', 'Cửa hàng trưởng'],
      'Tổng công ty Bưu Điện Việt Nam'
    );
    console.log(`[FUNC_KHACHHANG__4] Tạo khách hàng tại: ${createdAtShop}`);

    // Bước 2: Vào mục Khách hàng
    await dashboardPage.navigateToCustomers();

    // Bước 3: Mở drawer và tạo khách hàng
    await customerPage.clickAddNew();
    await customerPage.createCustomer(customerName, customerPhone);

    // Bước 4: Xác nhận thông báo thành công
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice')
      .filter({ hasText: 'Thêm khách hàng thành công' });
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .not.toBeVisible({ timeout: 10_000 });

    // ─── GIAI ĐOẠN 2: Kiểm tra đồng bộ lên cấp TCT ──────────────────────
    // Bước 5: Switch lên TCT
    await dashboardPage.goToSelectShop();
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 6: Vào mục Khách hàng tại TCT
    await dashboardPage.navigateToCustomers();
    await customerPage.searchCustomer(customerName);

    // Bước 7: Xác nhận khách hàng xuất hiện tại TCT
    const tctRow = page.locator('tr').filter({ hasText: customerName }).first();
    await expect(tctRow).toBeVisible({ timeout: 10_000 });
    await expect(tctRow).toContainText(customerPhone);

    // ─── GIAI ĐOẠN 3: Kiểm tra đồng bộ tại cửa hàng con khác ─────────────
    // Bước 8: Switch sang một cửa hàng con khác (bỏ qua shop vừa tạo nếu có thể)
    await dashboardPage.goToSelectShop();
    const secondShop = await selectShopPage.selectShopWithFallback(
      ['Giám đốc xã', 'Quản lý tỉnh', 'Cửa hàng trưởng'],
      'Tổng công ty Bưu Điện Việt Nam'
    );
    console.log(`[FUNC_KHACHHANG__4] Kiểm tra đồng bộ tại: ${secondShop}`);

    // Bước 9: Vào mục Khách hàng tại cửa hàng thứ 2
    await dashboardPage.navigateToCustomers();
    await customerPage.searchCustomer(customerName);

    // Bước 10: Xác nhận khách hàng được đồng bộ tại cửa hàng thứ 2
    const syncedRow2 = page.locator('tr').filter({ hasText: customerName }).first();
    await expect(syncedRow2).toBeVisible({ timeout: 10_000 });
    await expect(syncedRow2).toContainText(customerPhone);
  });

  test('FUNC_KHACHHANG__5 - Hủy thao tác thêm khách hàng giữa chừng - không tạo bản ghi mới', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `KH Cancel Test ${uniqueSuffix}`;
    const customerPhone = `092${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới mục Khách hàng
    await dashboardPage.navigateToCustomers();

    // Bước 3: Mở drawer Thêm khách hàng
    await customerPage.clickAddNew();
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .toBeVisible({ timeout: 5_000 });

    // Bước 4: Nhập Tên KH và SĐT rồi click Hủy (không submit)
    await customerPage.cancelCustomer(customerName, customerPhone);

    // Bước 5: Xác nhận drawer đã đóng lại
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .not.toBeVisible({ timeout: 5_000 });

    // Bước 6: Tìm kiếm theo tên vừa nhập trong danh sách
    await customerPage.searchCustomer(customerName);

    // Bước 7: Xác nhận KHÔNG có bản ghi nào được tạo
    const cancelledRow = page.locator('tr').filter({ hasText: customerName });
    await expect(cancelledRow).toHaveCount(0);
  });

  test('FUNC_KHACHHANG__6 - Bỏ trống Tên khách hàng (bắt buộc) khi thêm mới', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const customerPhone = `093${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới mục Khách hàng
    await dashboardPage.navigateToCustomers();

    // Bước 3: Mở drawer Thêm khách hàng
    await customerPage.clickAddNew();
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .toBeVisible({ timeout: 5_000 });

    // Bước 4: Bỏ trống Tên, chỉ nhập SĐT rồi click Hoàn thành
    await customerPage.fill(customerPage.phoneInput, customerPhone);
    await customerPage.click(customerPage.confirmButton);

    // Bước 5: Xác nhận thông báo lỗi validation hiển thị trên trường Tên khách hàng
    const nameErrorMsg = page.locator('.ant-form-item-explain-error').first();
    await expect(nameErrorMsg).toBeVisible({ timeout: 5_000 });

    // Bước 6: Xác nhận drawer vẫn còn mở (form chưa bị submit)
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .toBeVisible();
  });

  test('FUNC_KHACHHANG__7 - Bỏ trống Số điện thoại (bắt buộc) khi thêm mới', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const customerName = `KH No Phone ${uniqueSuffix}`;

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới mục Khách hàng
    await dashboardPage.navigateToCustomers();

    // Bước 3: Mở drawer Thêm khách hàng
    await customerPage.clickAddNew();
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .toBeVisible({ timeout: 5_000 });

    // Bước 4: Nhập Tên hợp lệ, bỏ trống SĐT rồi click Hoàn thành
    await customerPage.fill(customerPage.nameInput, customerName);
    await customerPage.click(customerPage.confirmButton);

    // Bước 5: Xác nhận thông báo lỗi validation hiển thị trên trường SĐT
    const phoneErrorMsg = page.locator('.ant-form-item-explain-error').first();
    await expect(phoneErrorMsg).toBeVisible({ timeout: 5_000 });

    // Bước 6: Xác nhận drawer vẫn còn mở (form không submit)
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .toBeVisible();
  });

  test('FUNC_KHACHHANG__8 - Thêm khách hàng với Số điện thoại đã tồn tại trong hệ thống', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // Bước 2: Lấy SĐT của khách hàng đầu tiên trong bảng (đảm bảo đã tồn tại)
    const existingPhone = await customerPage.getFirstCustomerPhone();
    console.log(`[FUNC_KHACHHANG__8] SĐT lấy từ bảng: ${existingPhone}`);

    // Bước 3: Mở form Thêm khách hàng
    await customerPage.clickAddNew();
    await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
      .toBeVisible({ timeout: 5_000 });

    // Bước 4: Nhập tên mới nhưng dùng SĐT đã tồn tại rồi click Hoàn thành
    await customerPage.fill(customerPage.nameInput, 'Trần Văn C');
    await customerPage.fill(customerPage.phoneInput, existingPhone);
    await customerPage.click(customerPage.confirmButton);

    // Bước 5: Xác nhận thông báo lỗi SĐT trùng hiển thị (toast hoặc inline error)
    const dupError = page.locator(
      '.ant-message-error, .ant-notification-notice-error, .ant-form-item-explain-error'
    ).filter({ hasText: /đã tồn tại|trùng|duplicate|already exist/i }).first();
    await expect(dupError).toBeVisible({ timeout: 10_000 });

    // Bước 6: Xác nhận không có thông báo thành công
    const successNotice = page.locator('.ant-message-success, .ant-notification-notice')
      .filter({ hasText: 'Thêm khách hàng thành công' });
    await expect(successNotice).toHaveCount(0);
  });

  test('FUNC_KHACHHANG__9 - Thêm khách hàng với Số điện thoại sai định dạng', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // Các giá trị SĐT không hợp lệ cần kiểm tra
    const invalidPhones = [
      { value: '0912', label: 'số quá ngắn (4 chữ số)' },
      { value: '0912345', label: 'số không đủ 10 chữ số' },
    ];

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    for (const { value: invalidPhone, label } of invalidPhones) {
      // Bước 2: Mở form Thêm khách hàng
      await customerPage.clickAddNew();
      await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
        .toBeVisible({ timeout: 5_000 });

      // Bước 3: Nhập Tên hợp lệ và SĐT sai định dạng rồi submit
      await customerPage.fill(customerPage.nameInput, 'Nguyễn Văn Test');
      await customerPage.fill(customerPage.phoneInput, invalidPhone);
      await customerPage.click(customerPage.confirmButton);

      // Bước 4: Xác nhận thông báo lỗi định dạng SĐT hiển thị
      const phoneError = page.locator(
        '.ant-form-item-explain-error, .ant-message-error, .ant-notification-notice-error'
      ).first();
      await expect(phoneError).toBeVisible({ timeout: 5_000 });
      console.log(`[FUNC_KHACHHANG__9] "${invalidPhone}" (${label}) → lỗi hiển thị ✓`);

      // Bước 5: Xác nhận drawer vẫn còn mở (form không submit)
      await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
        .toBeVisible();

      // Đóng drawer để lặp iteration tiếp theo
      await customerPage.click(customerPage.cancelButton);
      await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
        .not.toBeVisible({ timeout: 5_000 });
    }
  });

  test('FUNC_KHACHHANG__10 - Thêm khách hàng với Email sai định dạng', async ({ page }) => {
    test.setTimeout(90_000); // 3 iterations, mỗi iteration cần ~20s
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    const uniqueSuffix = Date.now().toString().slice(-6);

    // Các giá trị Email không hợp lệ cần kiểm tra
    const invalidEmails = [
      { value: 'abc@@gmail', label: 'double @ và thiếu domain' },
      { value: 'nodomain@', label: 'thiếu phần sau @' },
      { value: 'noatsign.com', label: 'thiếu ký tự @' },
    ];

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    for (const { value: invalidEmail, label } of invalidEmails) {
      const customerPhone = `095${Math.floor(1000000 + Math.random() * 9000000)}`;

      // Bước 2: Mở form Thêm khách hàng (clickAddNew tự scroll lên đầu trang)
      await customerPage.clickAddNew();
      await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
        .toBeVisible({ timeout: 10_000 });

      // Bước 3: Nhập Tên, SĐT hợp lệ và Email sai định dạng rồi submit
      await customerPage.fill(customerPage.nameInput, `KH Email Test ${uniqueSuffix}`);
      await customerPage.fill(customerPage.phoneInput, customerPhone);
      await customerPage.fill(customerPage.emailInput, invalidEmail);
      await customerPage.click(customerPage.confirmButton);

      // Bước 4: Xác nhận thông báo lỗi định dạng Email hiển thị
      const emailError = page.locator(
        '.ant-form-item-explain-error, .ant-message-error, .ant-notification-notice-error'
      ).first();
      await expect(emailError).toBeVisible({ timeout: 50_000 });
      console.log(`[FUNC_KHACHHANG__10] "${invalidEmail}" (${label}) → lỗi hiển thị ✓`);

      // Bước 5: Xác nhận drawer vẫn còn mở (form không submit)
      await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
        .toBeVisible();

      // Đóng drawer để lặp iteration tiếp theo
      await customerPage.click(customerPage.cancelButton);
      await expect(page.locator('.ant-drawer-title').filter({ hasText: 'Thêm khách hàng' }))
        .not.toBeVisible({ timeout: 5_000 });
    }
  });
});
