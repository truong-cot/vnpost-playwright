import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { ProductPage } from '../../src/pages/product.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Product Variant and Unit Conversion Flows', () => {
  test('Tạo sản phẩm có biến thể đồng thời áp dụng đơn vị quy đổi thành công', async ({ page }) => {
    // Tăng timeout cho luồng chạy phức tạp
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const productPage = new ProductPage(page);

    const timestamp = Date.now();
    const productName = `Kệ gỗ ${timestamp}`;
    const categoryName = 'Đồ gia dụng';
    const accountantCode = '999';
    const vatRate = '8%';
    const baseUnitName = 'cái';

    // Dữ liệu SKU cho biến thể và đơn vị quy đổi
    const skuNau = `SP-004-nau-${timestamp}`;
    const skuNauLo = `SP-004-naulo-${timestamp}`;
    const skuNauThung = `SP-004-nauthung-${timestamp}`;

    const skuDen = `SP-004-đen-${timestamp}`;
    const skuDenLo = `SP-004-denlo-${timestamp}`;
    const skuDenThung = `SP-004-denthung-${timestamp}`;

    // Bước 1: Đăng nhập và chọn cửa hàng
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');

    // Bước 2: Điều hướng tới trang Sản phẩm
    await dashboardPage.navigateToProducts();

    // Bước 3: Mở drawer Thêm mới sản phẩm
    await productPage.clickAddNew();

    const dialog = page.locator('[role="dialog"], .ant-drawer-content').first();
    await expect(dialog).toBeVisible();

    // Bước 4: Nhập các thông tin bắt buộc hợp lệ phần Thông tin chung
    await productPage.nameInput.fill(productName);
    
    await productPage.categorySelect.click();
    await productPage.categorySelect.fill(categoryName);
    await page.getByRole('treeitem', { name: categoryName }).first().click();

    // Bỏ trống trường SKU và Mã barcode ở Thông tin chung (mặc định đã trống hoặc không cần fill)
    await productPage.accountantCodeInput.fill(accountantCode);

    await productPage.vatSelect.click();
    await page.locator('.ant-select-item-option').filter({ hasText: vatRate }).first().click();

    // Loại hàng hóa / vật tư, Hình thức phân phối, Tích điểm, Phương pháp tính giá vốn: Mặc định
    await page.getByRole('radio', { name: 'Hàng hóa' }).click();
    await page.getByRole('radio', { name: 'Mua bán' }).click();

    // Đơn vị: cái
    await productPage.unitInput.fill(baseUnitName);
    await page.waitForTimeout(500);

    // Bước 5: Cấu hình Đơn vị quy đổi
    // Click button "Thêm đơn vị quy đổi" - Dòng 1: lô, 3, cái
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(0, {
      name: 'lô',
      quantity: '3',
      sku: '' // Bỏ trống SKU và Barcode ở đây để điền ở bảng cấu hình bên dưới
    });

    // Click button "Thêm đơn vị quy đổi" - Dòng 2: thùng, 2, lô
    await productPage.clickAddConversionUnit();
    await productPage.fillConversionRow(1, {
      name: 'thùng',
      quantity: '2',
      baseUnit: 'lô',
      sku: '' // Bỏ trống SKU và Barcode
    });

    // Bước 6: Tại phần Phân loại, nhấn "+ Thêm phân loại" và nhập màu -> nâu, đen
    await productPage.addVariant('màu', 'nâu');
    
    // Thêm giá trị thứ hai "đen" vào cùng thuộc tính
    const variantRow = page.locator('.ant-row', { has: productPage.variantNameInput }).first();
    const selectBox = variantRow.locator('.ant-select').first();
    await selectBox.click({ force: true });
    await productPage.variantValueInput.fill('đen');
    await productPage.variantValueInput.press('Enter');

    // Chờ bảng cấu hình sinh ra và ổn định
    await page.waitForTimeout(2000);

    // Bước 7: Tại bảng ma trận Cấu hình được sinh ra bên dưới
    const matrixRows = page.locator('.ant-drawer-body table').nth(1).locator('tbody tr.ant-table-row');
    await expect(matrixRows).toHaveCount(6);

    // Dòng biến thể "Màu: Nâu" (Index 0)
    const rowNau = matrixRows.nth(0);
    await rowNau.locator('input[placeholder="Nhập SKU"]').fill(skuNau);
    await rowNau.locator('button:has(.anticon-setting)').click(); // Sinh Barcode tự sinh
    await page.waitForTimeout(200);

    // Bảng con đơn vị quy đổi dưới "Màu: Nâu" - lô (Index 1)
    const rowNauLo = matrixRows.nth(1);
    await rowNauLo.locator('input[placeholder="Nhập SKU"]').fill(skuNauLo);
    await rowNauLo.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    // Bảng con đơn vị quy đổi dưới "Màu: Nâu" - thùng (Index 2)
    const rowNauThung = matrixRows.nth(2);
    await rowNauThung.locator('input[placeholder="Nhập SKU"]').fill(skuNauThung);
    await rowNauThung.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    // Dòng biến thể "màu: đen" (Index 3)
    const rowDen = matrixRows.nth(3);
    await rowDen.locator('input[placeholder="Nhập SKU"]').fill(skuDen);
    await rowDen.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    // Bảng con đơn vị quy đổi dưới "màu: đen" - lô (Index 4)
    const rowDenLo = matrixRows.nth(4);
    await rowDenLo.locator('input[placeholder="Nhập SKU"]').fill(skuDenLo);
    await rowDenLo.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(200);

    // Bảng con đơn vị quy đổi dưới "màu: đen" - thùng (Index 5)
    const rowDenThung = matrixRows.nth(5);
    await rowDenThung.locator('input[placeholder="Nhập SKU"]').fill(skuDenThung);
    await rowDenThung.locator('button:has(.anticon-setting)').click();
    await page.waitForTimeout(500);

    // Bước 8: Nhấn nút “Xác nhận” ở trên cùng
    await productPage.click(productPage.confirmButton);

    // Bước 9: Xác nhận lưu sản phẩm thành công và drawer đóng lại
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: 'Thêm thành công' });
    await expect(successMsg).toBeVisible();
    await expect(dialog).not.toBeVisible();

    // Bước 10: Tìm kiếm và xem chi tiết sản phẩm vừa tạo
    await productPage.searchBySku(skuNau); // Tìm theo SKU của một trong các biến thể vừa tạo
    const productRow = page.locator('tr').filter({ hasText: skuNau }).first();
    await expect(productRow).toBeVisible();

    // Click vào tên sản phẩm để xem chi tiết
    const nameButton = page.getByRole('button', { name: productName }).first();
    await nameButton.click();

    const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();
    await expect(detailDrawer).toBeVisible();
    await page.waitForTimeout(2000); // Chờ load xong dữ liệu chi tiết

    // Kiểm tra: Phần biến thể hiển thị tag màu "nâu" và "đen"
    await expect(detailDrawer.locator('.ant-tag', { hasText: 'nâu' }).first()).toBeVisible();
    await expect(detailDrawer.locator('.ant-tag', { hasText: 'đen' }).first()).toBeVisible();

    // Kiểm tra: Bảng cấu hình hiển thị phân nhóm rõ ràng theo 2 biến thể
    const configTable = detailDrawer.locator('.text-lg:has-text("Cấu hình") ~ .ant-table-wrapper');
    await expect(configTable).toBeVisible();

    // Click icon expand cho biến thể thứ nhất (nâu)
    const expandCarets = configTable.locator('.anticon-caret-down');
    await expandCarets.nth(0).click();
    await page.waitForTimeout(500);

    const expandedRow1 = configTable.locator('.ant-table-expanded-row').nth(0);
    await expect(expandedRow1).toBeVisible();

    const subRows1 = expandedRow1.locator('tbody tr.ant-table-row');
    await expect(subRows1).toHaveCount(3);
    await expect(subRows1.nth(0)).toContainText('lô');
    await expect(subRows1.nth(0)).toContainText(skuNauLo);
    await expect(subRows1.nth(1)).toContainText('thùng');
    await expect(subRows1.nth(1)).toContainText(skuNauThung);
    await expect(subRows1.nth(2)).toContainText('cái');
    await expect(subRows1.nth(2)).toContainText(skuNau);

    // Click icon expand cho biến thể thứ hai (đen)
    await expandCarets.nth(1).click();
    await page.waitForTimeout(500);

    // Lúc này đã có 2 dòng expand, ta lấy dòng expand thứ 2
    const expandedRow2 = configTable.locator('.ant-table-expanded-row').nth(1);
    await expect(expandedRow2).toBeVisible();

    const subRows2 = expandedRow2.locator('tbody tr.ant-table-row');
    await expect(subRows2).toHaveCount(3);
    await expect(subRows2.nth(0)).toContainText('lô');
    await expect(subRows2.nth(0)).toContainText(skuDenLo);
    await expect(subRows2.nth(1)).toContainText('thùng');
    await expect(subRows2.nth(1)).toContainText(skuDenThung);
    await expect(subRows2.nth(2)).toContainText('cái');
    await expect(subRows2.nth(2)).toContainText(skuDen);

    // Chụp màn hình để lưu lại làm minh chứng thành công
    await page.screenshot({ path: 'detail_view_success_screenshot.png' });
  });
});
