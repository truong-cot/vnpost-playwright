import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { PurchaseRequestPage } from '../../src/pages/purchase-request.page';

test.describe('Inventory List Flows - Phiếu đề xuất đặt hàng', () => {
  test('FUNC_1_213 - Kiểm tra Lọc theo Điểm bán / kho cụ thể', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const purchaseRequestPage = new PurchaseRequestPage(page);

    // 1. User truy cập vào hệ thống (Login: 0300000000/123456)
    await loginPage.login('0300000000', '123456');

    // 2. Chọn kho hàng / Cửa hàng (Chọn Bưu điện Tỉnh Sóc Trăng - Quản lý tỉnh)
    await selectShopPage.selectShop('Bưu điện Tỉnh Sóc Trăng');

    // 3. Chọn phiếu đề xuất đặt hàng (Kho hàng -> Phiếu đề xuất đặt hàng)
    await dashboardPage.navigateToPurchaseRequest();
    await page.waitForLoadState('networkidle');

    // 4. Chọn Kho/Điểm bán là Pos mini bưu điện thành phố Sóc Trăng
    await purchaseRequestPage.selectShopAndWarehouse(
      'Bưu điện Tỉnh Sóc Trăng',
      'Bưu điện Thành phố Sóc Trăng',
      'Pos mini bưu điện thành phố Sóc Trăng'
    );

    // 5. Click tìm kiếm
    await purchaseRequestPage.search();
    
    // Đợi kết quả tìm kiếm tải xong và cập nhật bảng
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Kết quả mong muốn: Hiển thị danh sách phiếu thuộc kho/điểm bán đã chọn.
    const resultRows = purchaseRequestPage.tableRows;
    const resultCount = await resultRows.count();
    
    // Nếu có dòng kết quả, duyệt qua kiểm tra cột Cửa hàng / kho (td.nth(2))
    if (resultCount > 0) {
      for (let i = 0; i < resultCount; i++) {
        const row = resultRows.nth(i);
        const warehouseText = (await row.locator('td').nth(2).innerText()).trim();
        // Kiểm tra xem tên kho có chứa "Pos mini bưu điện thành phố Sóc Trăng" không
        expect(warehouseText).toContain('Pos mini bưu điện thành phố Sóc Trăng');
      }
    } else {
      // Trường hợp không có dữ liệu, kiểm tra hiển thị placeholder "Trống" hoặc "Không có dữ liệu"
      const emptyPlaceholder = page.locator('.ant-empty-description').first();
      await expect(emptyPlaceholder).toBeVisible({ timeout: 5000 });
      const emptyText = await emptyPlaceholder.innerText();
      console.log(`[FUNC_1_213] Danh sách trống: "${emptyText}"`);
    }

    console.log(`[FUNC_1_213] Kiểm tra lọc theo Điểm bán / kho cụ thể thành công. Tổng số dòng khớp: ${resultCount}`);
  });
});
