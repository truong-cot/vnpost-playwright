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

    // Step 1: Navigate and Login
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);

    // Step 2: Verify Select Shop page loaded
    await expect(selectShopPage.pageHeader).toBeVisible();

    // Step 3: Select the main role/shop
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Step 4: Verify successful redirection to Dashboard and profile visibility (with 15s timeout to allow loading)
    await expect(dashboardPage.getUserProfileLocator('Đặng Bá Trường')).toBeVisible({ timeout: 15000 });

    // Step 5: Navigate back to selection screen and logout
    await dashboardPage.goToSelectShop();
    await selectShopPage.logout();

    // Step 6: Verify navigation back to Login page
    await expect(loginPage.usernameInput).toBeVisible();
  });
});
