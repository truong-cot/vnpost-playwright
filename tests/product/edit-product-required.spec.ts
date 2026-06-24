import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Product Editing Flows', () => {
  test('Kiểm tra chỉnh sửa sản phẩm khi xóa các trường bắt buộc', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const targetProductName = 'Sản phẩm mẫu-1781777412808';

    // Bước 1: Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    // Tìm kiếm sản phẩm theo Tên sản phẩm
    const searchNameInput = page.getByPlaceholder('Tìm kiếm theo tên');
    await searchNameInput.fill(targetProductName);
    await searchNameInput.press('Enter');
    await page.waitForTimeout(1000); // Chờ bảng tải lại

    // Bước 3: Tại dòng sản phẩm cần chỉnh sửa: Click chọn "Thao tác" -> "Xem chi tiết" -> "Sửa thông tin"
    const productRow = page.locator('tr').filter({ hasText: targetProductName }).first();
    await expect(productRow).toBeVisible();
    
    // Click button "Thao tác" trên dòng sản phẩm
    await productRow.locator('button:has-text("Thao tác")').click();

    // Click "Xem chi tiết" từ dropdown
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xem chi tiết' }).first().click();

    // Chờ Detail drawer mở ra
    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible();

    // Click "Sửa thông tin"
    await detailDrawer.locator('button:has-text("Sửa thông tin")').click();

    // Bước 4: Xóa thông tin 1 hoặc nhiều trường bắt buộc
    // Xóa Tên sản phẩm, SKU và Đơn vị tính
    await productPage.nameInput.fill('');
    await productPage.skuInput.fill('');
    await productPage.unitInput.fill('');

    // Bước 5: Click "Cập nhật" (hoặc Xác nhận tùy theo nhãn của hệ thống ở màn Edit)
    const updateButton = page.locator('button:has-text("Cập nhật"), button:has-text("Xác nhận")').first();
    await updateButton.click();

    // Kết quả mong muốn:
    // 1. Hệ thống không lưu thông tin mới (Drawer sửa thông tin vẫn hiển thị)
    const editDrawerTitle = page.locator('.ant-drawer-title').filter({ hasText: /Cập nhật|Sửa sản phẩm|Sửa thông tin/ }).first();
    // Hoặc kiểm tra form vẫn đang hiển thị
    await expect(productPage.nameInput).toBeVisible();

    // 2. Báo đỏ các trường bắt buộc bị bỏ trống (Ant Design hiển thị class error và label báo lỗi dưới trường)
    const errorFields = page.locator('.ant-form-item-has-error');
    await expect(errorFields.first()).toBeVisible();

    // 3. Hiển thị thông báo "Vui lòng nhập đầy đủ các thông tin được yêu cầu"
    const errorNotification = page.locator('.ant-message-notice, .ant-notification-notice').filter({ hasText: 'Vui lòng nhập đầy đủ các thông tin được yêu cầu' }).first();
    await expect(errorNotification).toBeVisible();
  });
});
