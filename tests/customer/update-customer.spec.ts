import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { CustomerPage } from '../../src/pages/customer.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Quản lý khách hàng - Chỉnh sửa', () => {
  test('FUNC_KHACHHANG__26 - Chỉnh sửa thông tin cơ bản (Tên, Email) của khách hàng thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào màn hình khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Chọn khách hàng ở dòng đầu tiên của danh sách ───────────────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15_000 });

    const nameLink = firstRow.locator('td').nth(2).locator('a');
    const originalName = (await nameLink.textContent())?.trim() ?? '';
    console.log(`[FUNC_KHACHHANG__26] Khách hàng đầu tiên được chọn để sửa: "${originalName}"`);

    // Click vào tên khách hàng để mở màn hình chi tiết
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Mở Tab 1 "Thông tin cá nhân" và click "Chỉnh sửa/Sửa thông tin" ──
    const personalTab = page.getByRole('tab', { name: 'Thông tin cá nhân' });
    await expect(personalTab).toBeVisible({ timeout: 5_000 });
    await personalTab.click();

    const editBtn = page.locator('button').filter({ hasText: /Sửa thông tin|Chỉnh sửa/i }).first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();

    // ─── BƯỚC 4: Sửa Tên khách hàng và Email ───────────────────────────────
    const uniqueSuffix = Date.now().toString().slice(-6);
    const newName = `KH Sửa ${uniqueSuffix}`;
    const newEmail = `sua_${uniqueSuffix}@gmail.com`;

    await customerPage.fill(customerPage.nameInput, newName);
    await customerPage.fill(customerPage.emailInput, newEmail);

    // ─── BƯỚC 5: Click "Hoàn thành" ──────────────────────────────────────────
    await customerPage.click(customerPage.confirmButton);

    // Chờ thông báo thành công hoặc form/drawer đóng lại
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice')
      .filter({ hasText: /thành công|cập nhật/i });
    await expect(successMsg.first()).toBeVisible({ timeout: 10_000 });
    await expect(customerPage.confirmButton).not.toBeVisible({ timeout: 10_000 });

    // ─── BƯỚC 6: Xác nhận thông tin mới hiển thị ở màn chi tiết ─────────────
    const detailName = page.locator('main').getByText(newName, { exact: true }).first();
    await expect(detailName).toBeVisible({ timeout: 5_000 });

    const detailEmail = page.locator('main').getByText(newEmail, { exact: false }).first();
    await expect(detailEmail).toBeVisible({ timeout: 5_000 });
    console.log(`[FUNC_KHACHHANG__26] Màn chi tiết đã hiển thị thông tin mới: "${newName}" và "${newEmail}"`);

    // ─── BƯỚC 7: Quay lại danh sách và xác nhận hiển thị thông tin mới ───────
    await dashboardPage.navigateToCustomers();
    await page.waitForLoadState('networkidle');

    await customerPage.searchCustomer(newName);
    const customerRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: newName }).first();
    await expect(customerRow).toBeVisible({ timeout: 10_000 });
    console.log(`[FUNC_KHACHHANG__26] Đã xác nhận thông tin mới cập nhật thành công ở màn danh sách.`);
  });

  test('FUNC_KHACHHANG__27 - Chỉnh sửa Thông tin xuất hóa đơn và Địa chỉ liên hệ thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào màn hình khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Chọn khách hàng ở dòng đầu tiên của danh sách ───────────────
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15_000 });

    const nameLink = firstRow.locator('td').nth(2).locator('a');
    const originalName = (await nameLink.textContent())?.trim() ?? '';
    console.log(`[FUNC_KHACHHANG__27] Khách hàng đầu tiên được chọn để sửa: "${originalName}"`);

    // Click vào tên khách hàng để mở màn hình chi tiết
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Mở Tab 1 "Thông tin cá nhân" và click "Chỉnh sửa/Sửa thông tin" ──
    const personalTab = page.getByRole('tab', { name: 'Thông tin cá nhân' });
    await expect(personalTab).toBeVisible({ timeout: 5_000 });
    await personalTab.click();

    const editBtn = page.locator('button').filter({ hasText: /Sửa thông tin|Chỉnh sửa/i }).first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();

    // ─── BƯỚC 4: Cập nhật Mã số thuế, Tên doanh nghiệp, Địa chỉ liên hệ, Facebook, Zalo ─
    const uniqueSuffix = Date.now().toString().slice(-6);
    const newTaxCode = `01${uniqueSuffix}123`;
    const newCompany = `Công Ty Sửa ${uniqueSuffix}`;
    const newAddress = `Địa chỉ sửa ${uniqueSuffix}`;
    const newFacebook = `https://facebook.com/sua_${uniqueSuffix}`;
    const newZalo = `https://zalo.me/09${uniqueSuffix}`;

    await customerPage.fill(customerPage.taxCodeInput, newTaxCode);
    await customerPage.fill(customerPage.invoiceCompanyInput, newCompany);
    await customerPage.fill(customerPage.addressInput, newAddress);
    await customerPage.fill(customerPage.facebookInput, newFacebook);
    await customerPage.fill(customerPage.zaloInput, newZalo);

    // ─── BƯỚC 5: Click "Hoàn thành" ──────────────────────────────────────────
    await customerPage.click(customerPage.confirmButton);

    // Chờ thông báo thành công hoặc form/drawer đóng lại
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice')
      .filter({ hasText: /thành công|cập nhật/i });
    await expect(successMsg.first()).toBeVisible({ timeout: 10_000 });
    await expect(customerPage.confirmButton).not.toBeVisible({ timeout: 10_000 });

    // ─── BƯỚC 6: Xác nhận thông tin mới hiển thị chính xác khi xem lại chi tiết ────
    await page.waitForLoadState('networkidle');

    // Kiểm tra từng trường thông tin cập nhật trên giao diện chi tiết
    await expect(page.getByText(newTaxCode)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(newCompany)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(newAddress)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(newFacebook)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(newZalo)).toBeVisible({ timeout: 5_000 });

    console.log(`[FUNC_KHACHHANG__27] Toàn bộ thông tin cập nhật đã hiển thị chính xác tại trang chi tiết.`);
  });

  test('FUNC_KHACHHANG__28 - Hủy chỉnh sửa khách hàng - dữ liệu không bị thay đổi', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào màn hình khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Chọn khách hàng ở dòng đầu tiên của danh sách và lưu lại thông tin gốc ──
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15_000 });

    const nameLink = firstRow.locator('td').nth(2).locator('a');
    const originalName = (await nameLink.textContent())?.trim() ?? '';
    const phoneCell = firstRow.locator('td').nth(3);
    const originalPhone = (await phoneCell.textContent())?.trim() ?? '';
    console.log(`[FUNC_KHACHHANG__28] Khách hàng chọn sửa: Name="${originalName}", Phone="${originalPhone}"`);

    // Click vào tên khách hàng để mở màn hình chi tiết
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Click "Chỉnh sửa/Sửa thông tin" ──────────────────────────────
    const personalTab = page.getByRole('tab', { name: 'Thông tin cá nhân' });
    await expect(personalTab).toBeVisible({ timeout: 5_000 });
    await personalTab.click();

    const editBtn = page.locator('button').filter({ hasText: /Sửa thông tin|Chỉnh sửa/i }).first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();

    // ─── BƯỚC 4: Sửa Tên khách hàng và Số điện thoại ─────────────────────────
    const uniqueSuffix = Date.now().toString().slice(-6);
    const newName = `KH Sửa Hủy ${uniqueSuffix}`;
    const newPhone = `09${uniqueSuffix}12`;

    await customerPage.fill(customerPage.nameInput, newName);
    await customerPage.fill(customerPage.phoneInput, newPhone);

    // ─── BƯỚC 5: Click "Hủy" ──────────────────────────────────────────────────
    await customerPage.click(customerPage.cancelButton);

    // Xác nhận form/drawer chỉnh sửa đã đóng lại (nút Hủy biến mất)
    await expect(customerPage.cancelButton).not.toBeVisible({ timeout: 10_000 });

    // ─── BƯỚC 6: Xác nhận thông tin khách hàng giữ nguyên như cũ ở chi tiết ───
    const detailName = page.locator('main').getByText(originalName, { exact: true }).first();
    await expect(detailName).toBeVisible({ timeout: 5_000 });

    const cleanPhoneSuffix = originalPhone.replace(/^(\+84|0)/, '');
    const detailPhone = page.locator('main').getByText(cleanPhoneSuffix, { exact: false }).first();
    await expect(detailPhone).toBeVisible({ timeout: 5_000 });

    // Đảm bảo thông tin mới sửa KHÔNG được lưu
    await expect(page.locator('main').getByText(newName, { exact: true }).first()).not.toBeVisible();
    console.log(`[FUNC_KHACHHANG__28] Thông tin chi tiết khách hàng không thay đổi sau khi Click Hủy.`);

    // ─── BƯỚC 7: Quay lại danh sách và xác nhận thông tin vẫn giữ nguyên ─────
    await dashboardPage.navigateToCustomers();
    await page.waitForLoadState('networkidle');

    const checkRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(checkRow).toContainText(originalName);
    await expect(checkRow).toContainText(originalPhone);
    console.log(`[FUNC_KHACHHANG__28] Thông tin khách hàng ở danh sách vẫn giữ nguyên.`);
  });

  test('FUNC_KHACHHANG__29 - Chỉnh sửa - bỏ trống Tên khách hàng (bắt buộc)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào màn hình khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Chọn khách hàng ở dòng đầu tiên của danh sách và lưu lại thông tin gốc ──
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15_000 });

    const nameLink = firstRow.locator('td').nth(2).locator('a');
    const originalName = (await nameLink.textContent())?.trim() ?? '';
    const phoneCell = firstRow.locator('td').nth(3);
    const originalPhone = (await phoneCell.textContent())?.trim() ?? '';
    console.log(`[FUNC_KHACHHANG__29] Khách hàng chọn sửa: Name="${originalName}", Phone="${originalPhone}"`);

    // Click vào tên khách hàng để mở màn hình chi tiết
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Click "Chỉnh sửa/Sửa thông tin" ──────────────────────────────
    const personalTab = page.getByRole('tab', { name: 'Thông tin cá nhân' });
    await expect(personalTab).toBeVisible({ timeout: 5_000 });
    await personalTab.click();

    const editBtn = page.locator('button').filter({ hasText: /Sửa thông tin|Chỉnh sửa/i }).first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();

    // ─── BƯỚC 4: Xóa trống Tên khách hàng ─────────────────────────────────────
    await customerPage.fill(customerPage.nameInput, '');

    // ─── BƯỚC 5: Click "Hoàn thành" ──────────────────────────────────────────
    await customerPage.click(customerPage.confirmButton);

    // ─── BƯỚC 6: Xác nhận hiển thị lỗi validation ────────────────────────────
    const nameErrorMsg = page.locator('.ant-form-item-explain-error').first();
    await expect(nameErrorMsg).toBeVisible({ timeout: 5_000 });

    // Xác nhận form/drawer vẫn mở (nút Hoàn thành vẫn hiển thị)
    await expect(customerPage.confirmButton).toBeVisible();

    // Click Hủy để đóng form/drawer lại
    await customerPage.click(customerPage.cancelButton);
    await expect(customerPage.cancelButton).not.toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 7: Xác nhận thông tin khách hàng giữ nguyên như cũ ở chi tiết ───
    const detailName = page.locator('main').getByText(originalName, { exact: true }).first();
    await expect(detailName).toBeVisible({ timeout: 5_000 });

    const cleanPhoneSuffix = originalPhone.replace(/^(\+84|0)/, '');
    const detailPhone = page.locator('main').getByText(cleanPhoneSuffix, { exact: false }).first();
    await expect(detailPhone).toBeVisible({ timeout: 5_000 });
    console.log(`[FUNC_KHACHHANG__29] Thông tin chi tiết khách hàng vẫn giữ nguyên.`);

    // ─── BƯỚC 8: Quay lại danh sách và xác nhận thông tin vẫn giữ nguyên ─────
    await dashboardPage.navigateToCustomers();
    await page.waitForLoadState('networkidle');

    const checkRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(checkRow).toContainText(originalName);
    await expect(checkRow).toContainText(originalPhone);
    console.log(`[FUNC_KHACHHANG__29] Thông tin khách hàng ở danh sách vẫn giữ nguyên.`);
  });

  test('FUNC_KHACHHANG__30 - Chỉnh sửa - bỏ trống Số điện thoại (bắt buộc)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào màn hình khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Chọn khách hàng ở dòng đầu tiên của danh sách và lưu lại thông tin gốc ──
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15_000 });

    const nameLink = firstRow.locator('td').nth(2).locator('a');
    const originalName = (await nameLink.textContent())?.trim() ?? '';
    const phoneCell = firstRow.locator('td').nth(3);
    const originalPhone = (await phoneCell.textContent())?.trim() ?? '';
    console.log(`[FUNC_KHACHHANG__30] Khách hàng chọn sửa: Name="${originalName}", Phone="${originalPhone}"`);

    // Click vào tên khách hàng để mở màn hình chi tiết
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Click "Chỉnh sửa/Sửa thông tin" ──────────────────────────────
    const personalTab = page.getByRole('tab', { name: 'Thông tin cá nhân' });
    await expect(personalTab).toBeVisible({ timeout: 5_000 });
    await personalTab.click();

    const editBtn = page.locator('button').filter({ hasText: /Sửa thông tin|Chỉnh sửa/i }).first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();

    // ─── BƯỚC 4: Xóa trống Số điện thoại ─────────────────────────────────────
    await customerPage.fill(customerPage.phoneInput, '');

    // ─── BƯỚC 5: Click "Hoàn thành" ──────────────────────────────────────────
    await customerPage.click(customerPage.confirmButton);

    // ─── BƯỚC 6: Xác nhận hiển thị lỗi validation ────────────────────────────
    const phoneErrorMsg = page.locator('.ant-form-item-explain-error').first();
    await expect(phoneErrorMsg).toBeVisible({ timeout: 5_000 });

    // Xác nhận form/drawer vẫn mở (nút Hoàn thành vẫn hiển thị)
    await expect(customerPage.confirmButton).toBeVisible();

    // Click Hủy để đóng form/drawer lại
    await customerPage.click(customerPage.cancelButton);
    await expect(customerPage.cancelButton).not.toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 7: Xác nhận thông tin khách hàng giữ nguyên như cũ ở chi tiết ───
    const detailName = page.locator('main').getByText(originalName, { exact: true }).first();
    await expect(detailName).toBeVisible({ timeout: 5_000 });

    const cleanPhoneSuffix = originalPhone.replace(/^(\+84|0)/, '');
    const detailPhone = page.locator('main').getByText(cleanPhoneSuffix, { exact: false }).first();
    await expect(detailPhone).toBeVisible({ timeout: 5_000 });
    console.log(`[FUNC_KHACHHANG__30] Thông tin chi tiết khách hàng vẫn giữ nguyên.`);

    // ─── BƯỚC 8: Quay lại danh sách và xác nhận thông tin vẫn giữ nguyên ─────
    await dashboardPage.navigateToCustomers();
    await page.waitForLoadState('networkidle');

    const checkRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(checkRow).toContainText(originalName);
    await expect(checkRow).toContainText(originalPhone);
    console.log(`[FUNC_KHACHHANG__30] Thông tin khách hàng ở danh sách vẫn giữ nguyên.`);
  });

  test('FUNC_KHACHHANG__31 - Chỉnh sửa - đổi Số điện thoại thành SĐT đã tồn tại của khách hàng khác', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào màn hình khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Chọn khách hàng ở dòng đầu tiên (A) và lấy SĐT của dòng thứ hai (B) ──
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15_000 });

    const nameLink = firstRow.locator('td').nth(2).locator('a');
    const originalName = (await nameLink.textContent())?.trim() ?? '';
    const phoneCell = firstRow.locator('td').nth(3);
    const originalPhone = (await phoneCell.textContent())?.trim() ?? '';

    // Lấy SĐT của dòng thứ hai (Khách hàng B)
    const secondRow = page.locator('table tbody tr.ant-table-row').nth(1);
    await expect(secondRow).toBeVisible({ timeout: 5_000 });
    const duplicatePhoneCell = secondRow.locator('td').nth(3);
    const duplicatePhone = (await duplicatePhoneCell.textContent())?.trim() ?? '0911111111';

    console.log(`[FUNC_KHACHHANG__31] Khách hàng A (dòng 1): Name="${originalName}", Phone="${originalPhone}"`);
    console.log(`[FUNC_KHACHHANG__31] SĐT của Khách hàng B (dòng 2) dùng để đổi: "${duplicatePhone}"`);

    // Click vào tên khách hàng A để mở màn hình chi tiết
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Click "Chỉnh sửa/Sửa thông tin" ──────────────────────────────
    const personalTab = page.getByRole('tab', { name: 'Thông tin cá nhân' });
    await expect(personalTab).toBeVisible({ timeout: 5_000 });
    await personalTab.click();

    const editBtn = page.locator('button').filter({ hasText: /Sửa thông tin|Chỉnh sửa/i }).first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();

    // ─── BƯỚC 4: Đổi Số điện thoại thành SĐT của khách hàng B ─────────────────
    await customerPage.fill(customerPage.phoneInput, duplicatePhone);

    // ─── BƯỚC 5: Click "Hoàn thành" ──────────────────────────────────────────
    await customerPage.click(customerPage.confirmButton);

    // ─── BƯỚC 6: Xác nhận hiển thị lỗi 'Số điện thoại đã tồn tại' hoặc 'Không được phép thay đổi số điện thoại trong chuỗi' ───
    const errorMsg = page.locator(
      '.ant-message-error, .ant-notification-notice-error, .ant-form-item-explain-error'
    ).filter({ hasText: /đã tồn tại|trùng|already exist|duplicate|thay đổi số điện thoại/i }).first();
    await expect(errorMsg).toBeVisible({ timeout: 10_000 });

    // Xác nhận form/drawer vẫn mở (nút Hoàn thành vẫn hiển thị)
    await expect(customerPage.confirmButton).toBeVisible();

    // Click Hủy để đóng form/drawer lại
    await customerPage.click(customerPage.cancelButton);
    await expect(customerPage.cancelButton).not.toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 7: Xác nhận SĐT của khách hàng A vẫn giữ nguyên giá trị cũ ở chi tiết ───
    const detailName = page.locator('main').getByText(originalName, { exact: true }).first();
    await expect(detailName).toBeVisible({ timeout: 5_000 });

    const cleanPhoneSuffix = originalPhone.replace(/^(\+84|0)/, '');
    const detailPhone = page.locator('main').getByText(cleanPhoneSuffix, { exact: false }).first();
    await expect(detailPhone).toBeVisible({ timeout: 5_000 });
    console.log(`[FUNC_KHACHHANG__31] SĐT của khách hàng A vẫn giữ nguyên giá trị cũ: "${originalPhone}"`);

    // ─── BƯỚC 8: Quay lại danh sách và xác nhận thông tin vẫn giữ nguyên ─────
    await dashboardPage.navigateToCustomers();
    await page.waitForLoadState('networkidle');

    const checkRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(checkRow).toContainText(originalName);
    await expect(checkRow).toContainText(originalPhone);
    console.log(`[FUNC_KHACHHANG__31] Thông tin khách hàng A ở danh sách vẫn giữ nguyên.`);
  });

  test('FUNC_KHACHHANG__32 - Chỉnh sửa - nhập Email sai định dạng', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const customerPage = new CustomerPage(page);

    // ─── BƯỚC 1: Đăng nhập và vào màn hình khách hàng ───────────────────────
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToCustomers();

    // ─── BƯỚC 2: Chọn khách hàng ở dòng đầu tiên của danh sách và lưu lại thông tin gốc ──
    const firstRow = page.locator('table tbody tr.ant-table-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15_000 });

    const nameLink = firstRow.locator('td').nth(2).locator('a');
    const originalName = (await nameLink.textContent())?.trim() ?? '';
    const phoneCell = firstRow.locator('td').nth(3);
    const originalPhone = (await phoneCell.textContent())?.trim() ?? '';
    console.log(`[FUNC_KHACHHANG__32] Khách hàng chọn sửa: Name="${originalName}", Phone="${originalPhone}"`);

    // Click vào tên khách hàng để mở màn hình chi tiết
    await nameLink.click();
    await page.waitForURL(/\/customer\/detail\/\d+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // ─── BƯỚC 3: Click "Chỉnh sửa/Sửa thông tin" ──────────────────────────────
    const personalTab = page.getByRole('tab', { name: 'Thông tin cá nhân' });
    await expect(personalTab).toBeVisible({ timeout: 5_000 });
    await personalTab.click();

    const editBtn = page.locator('button').filter({ hasText: /Sửa thông tin|Chỉnh sửa/i }).first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();

    // ─── BƯỚC 4: Nhập Email sai định dạng ─────────────────────────────────────
    await customerPage.fill(customerPage.emailInput, 'test@@invalid');

    // ─── BƯỚC 5: Click "Hoàn thành" ──────────────────────────────────────────
    await customerPage.click(customerPage.confirmButton);

    // ─── BƯỚC 6: Xác nhận hiển thị lỗi validation định dạng Email ────────────
    const emailError = page.locator(
      '.ant-form-item-explain-error, .ant-message-error, .ant-notification-notice-error'
    ).first();
    await expect(emailError).toBeVisible({ timeout: 5_000 });

    // Xác nhận form/drawer vẫn mở (nút Hoàn thành vẫn hiển thị)
    await expect(customerPage.confirmButton).toBeVisible();

    // Click Hủy để đóng form/drawer lại
    await customerPage.click(customerPage.cancelButton);
    await expect(customerPage.cancelButton).not.toBeVisible({ timeout: 5_000 });

    // ─── BƯỚC 7: Xác nhận thông tin khách hàng giữ nguyên như cũ ở chi tiết ───
    const detailName = page.locator('main').getByText(originalName, { exact: true }).first();
    await expect(detailName).toBeVisible({ timeout: 5_000 });

    const cleanPhoneSuffix = originalPhone.replace(/^(\+84|0)/, '');
    const detailPhone = page.locator('main').getByText(cleanPhoneSuffix, { exact: false }).first();
    await expect(detailPhone).toBeVisible({ timeout: 5_000 });
    console.log(`[FUNC_KHACHHANG__32] Thông tin chi tiết khách hàng vẫn giữ nguyên.`);

    // ─── BƯỚC 8: Quay lại danh sách và xác nhận thông tin vẫn giữ nguyên ─────
    await dashboardPage.navigateToCustomers();
    await page.waitForLoadState('networkidle');

    const checkRow = page.locator('table tbody tr.ant-table-row').first();
    await expect(checkRow).toContainText(originalName);
    await expect(checkRow).toContainText(originalPhone);
    console.log(`[FUNC_KHACHHANG__32] Thông tin khách hàng ở danh sách vẫn giữ nguyên.`);
  });
});
