import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Product Deletion Flows', () => {
  test('Kiểm tra xóa sản phẩm thành công', async ({ page }) => {
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const targetSkus = [
      'SP-002-1781777748381',
      'SP-003-1781777412808',
      'SP-002-1781776684311',
      'SP-002-1781773924936'
    ];

    // Bước 1: Admin đăng nhập vào hệ thống
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Click chọn "Sản phẩm" -> "Sản phẩm"
    await dashboardPage.navigateToProducts();

    let skuToDelete = '';

    // Thử tìm kiếm các SKU mẫu mà người dùng cung cấp
    for (const sku of targetSkus) {
      await productPage.searchBySku(sku);
      const row = page.locator('tr').filter({ hasText: sku }).first();
      const isVisible = await row.isVisible();
      if (isVisible) {
        skuToDelete = sku;
        break;
      }
      // Xóa dữ liệu ô tìm kiếm trước lần thử tiếp theo
      await productPage.searchSkuInput.fill('');
      await productPage.searchSkuInput.press('Enter');
      await page.waitForTimeout(500);
    }

    // Nếu không tìm thấy bất kỳ sản phẩm mẫu nào (đã bị xóa ở lượt chạy trước)
    // Tự động khởi tạo dữ liệu mẫu mới (Fallback tự phục hồi)
    if (!skuToDelete) {
      console.log('Không tìm thấy SKU mẫu có sẵn, tiến hành tạo mới sản phẩm để thực hiện xóa...');
      const fallbackSku = `SP-DEL-${Date.now()}`;
      await productPage.clickAddNew();
      await productPage.createProduct({
        name: `Sản phẩm để xóa-${Date.now()}`,
        category: 'Nước giải khát',
        sku: fallbackSku,
        accountantCode: 'KT-DEL',
        vat: '8%',
        unit: 'lon',
        productType: 'Hàng hóa',
        distributionType: 'Mua bán'
      });

      // Chờ thông báo tạo thành công
      const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
      await expect(successMsg).toBeVisible();
      await expect(page.locator('text=Thêm sản phẩm')).not.toBeVisible();

      // Sử dụng SKU vừa tạo mới làm đối tượng xóa
      skuToDelete = fallbackSku;
      await productPage.searchBySku(skuToDelete);
    }

    // Bước 3: Tại dòng sản phẩm cần chỉnh sửa: Click chọn "Thao tác" -> "Xóa"
    const productRow = page.locator('tr').filter({ hasText: skuToDelete }).first();
    await expect(productRow).toBeVisible();

    await productRow.locator('button:has-text("Thao tác")').click();
    
    // Click chọn "Xóa"
    await page.locator('.ant-dropdown-menu-item').filter({ hasText: 'Xóa' }).first().click();

    // Chờ xác nhận hiển thị
    const confirmPopup = page.locator('.ant-popover, .ant-popconfirm').filter({ hasText: 'bạn có chắc chắn muốn xóa?' }).first();
    await expect(confirmPopup).toBeVisible();

    // Click "Đồng ý"
    await confirmPopup.locator('button:has-text("Đồng ý")').click();

    // Kết quả mong muốn:
    // 1. Hiển thị thông báo xóa thành công
    const deleteSuccessMsg = page.locator('.ant-message, .ant-notification-notice').filter({ hasText: 'thành công' }).first();
    await expect(deleteSuccessMsg).toBeVisible();

    // 2. Sản phẩm không còn xuất hiện trong danh sách sau khi tìm kiếm lại
    await productPage.searchSkuInput.fill('');
    await productPage.searchBySku(skuToDelete);
    await expect(page.locator('tr').filter({ hasText: skuToDelete })).not.toBeVisible();
  });
});
