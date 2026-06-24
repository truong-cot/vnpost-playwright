import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Authentication Flow', () => {
  test('Đăng nhập thành công và Đăng xuất', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);

    // Bước 1: Điều hướng và Đăng nhập
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);

    // Bước 2: Xác nhận trang chọn Cửa hàng hiển thị thành công
    await expect(selectShopPage.pageHeader).toBeVisible();

    // Bước 3: Chọn vai trò/cửa hàng chính
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 4: Xác nhận chuyển hướng thành công tới Dashboard và hiển thị thông tin hồ sơ (chờ tối đa 15 giây để tải)
    await expect(dashboardPage.getUserProfileLocator('Đặng Bá Trường')).toBeVisible({ timeout: 15000 });

    // Bước 5: Quay lại màn hình chọn cửa hàng và thực hiện Đăng xuất
    await dashboardPage.goToSelectShop();
    await selectShopPage.logout();

    // Bước 6: Xác nhận đã quay lại trang Đăng nhập
    await expect(loginPage.usernameInput).toBeVisible();
  });
});
