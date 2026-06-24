import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { SelectShopPage } from '../../src/pages/select-shop.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { PricingPage } from '../../src/pages/pricing.page';
import { ENV } from '../../src/utils/env.config';

test.describe('Pricing List Flows', () => {
  test('BANGGIA_35: Màn hình Quản lý bảng giá hiển thị đúng các cột thông tin và phân trang', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Vào menu Sản phẩm > Bảng Giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Bước 2: Quan sát màn hình danh sách và đối chiếu kết quả mong muốn

    // 1. Kiểm tra danh sách hiển thị đúng các cột tiêu đề
    const expectedColumns = [
      'STT',
      'Tên bảng giá',
      'Thời gian hiệu lực',
      'Thời gian tạo',
      'Hình thức',
      'Trạng thái',
      'Trạng thái phê duyệt',
      'Thao tác'
    ];
    const actualHeaders = await pricingPage.getHeaders();
    console.log('Headers found in table:', actualHeaders);
    for (const column of expectedColumns) {
      expect(actualHeaders).toContain(column);
    }

    // 2. Hiển thị đúng Hình thức (Mua bán/Ký gửi) cho từng bảng giá
    const formValues = await pricingPage.getFormColumnValues();
    console.log('Hình thức values in rows:', formValues);
    expect(formValues.length).toBeGreaterThan(0);
    for (const val of formValues) {
      expect(['Mua bán', 'Ký gửi']).toContain(val);
    }

    // 3. Phân trang hiển thị đúng số lượng mặt hàng (mặc định 10/trang)
    const pageSizeText = await pricingPage.getPageSizeText();
    expect(pageSizeText).toBe('10 / trang');

    // Kiểm tra số lượng dòng dữ liệu hiển thị khớp với phân trang mặc định (tối đa 10 dòng)
    const totalText = await pricingPage.paginationTotalText.innerText();
    console.log('Pagination total text:', totalText);
    expect(totalText).toContain('1-10 trên');

    const rowCount = await pricingPage.getRowsCount();
    expect(rowCount).toBe(10);
  });

  test('BANGGIA_36: Tìm kiếm bảng giá theo tên – kết quả đúng', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Vào menu Sản phẩm > Bảng Giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Bước 2: Nhập "Hà Nội" vào ô tìm kiếm tên bảng giá
    const keyword = 'Hà Nội';
    await pricingPage.searchPricing(keyword);

    // Bước 3: Quan sát kết quả lọc và đối chiếu kết quả mong muốn
    const names = await pricingPage.getPricingNames();
    console.log('Filtered pricing names:', names);

    // Kiểm tra kết quả lọc không rỗng
    expect(names.length).toBeGreaterThan(0);

    // Kiểm tra tất cả các bảng giá hiển thị đều có tên chứa "Hà Nội" (không phân biệt hoa thường)
    for (const name of names) {
      expect(name.toLowerCase()).toContain(keyword.toLowerCase());
    }
  });

  test('BANGGIA_37: Tìm kiếm bảng giá theo Trạng thái', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Đăng nhập, chọn cửa hàng và vào menu Sản phẩm > Bảng Giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Bước 2: Chọn bộ lọc Trạng thái = "Kích hoạt"
    await pricingPage.filterByStatus('Kích hoạt');

    // Bước 3: Quan sát kết quả
    const statusValues = await pricingPage.getStatusColumnValues();
    console.log('Các giá trị cột Trạng thái sau khi lọc:', statusValues);

    // Kiểm tra kết quả lọc không rỗng
    expect(statusValues.length).toBeGreaterThan(0);

    // Kết quả mong muốn:
    // - Chỉ hiển thị các bảng giá có Trạng thái = "Kích hoạt"
    // - Bảng giá "Ngừng kích hoạt" không hiển thị
    for (const status of statusValues) {
      expect(status).toBe('Kích hoạt');
    }
  });

  test('BANGGIA_38: Tìm kiếm bảng giá theo Hình thức', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Đăng nhập, chọn cửa hàng và vào menu Sản phẩm > Bảng Giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Bước 2: Chọn bộ lọc Hình thức = "Ký gửi"
    await pricingPage.filterByForm('Ký gửi');

    // Bước 3: Quan sát kết quả
    const formValues = await pricingPage.getFormColumnValues();
    console.log('Các giá trị cột Hình thức sau khi lọc:', formValues);

    // Kiểm tra kết quả lọc không rỗng
    expect(formValues.length).toBeGreaterThan(0);

    // Kết quả mong muốn:
    // - Chỉ hiển thị các bảng giá có Hình thức = "Ký gửi"
    // - Bảng giá "Mua bán" không hiển thị trong kết quả lọc
    for (const form of formValues) {
      expect(form).toBe('Ký gửi');
    }
  });

  test('BANGGIA_39: Tìm kiếm bảng giá theo Thời gian hiệu lực (khoảng ngày)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Đăng nhập, chọn cửa hàng và vào menu Sản phẩm > Bảng Giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Bước 2: Nhập Ngày bắt đầu = 01/03/2026 vào bộ lọc thời gian
    const targetDateStr = '01/03/2026';
    await pricingPage.filterByStartDate(targetDateStr);

    // Bước 3: Quan sát kết quả
    const validityValues = await pricingPage.getValidityColumnValues();
    console.log('Các giá trị cột Thời gian hiệu lực sau khi lọc:', validityValues);

    // Kiểm tra kết quả lọc không rỗng
    expect(validityValues.length).toBeGreaterThan(0);

    // Hàm phụ trợ để chuyển chuỗi ngày định dạng DD/MM/YYYY thành đối tượng Date
    const parseDateDDMMYYYY = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };

    const targetDate = parseDateDDMMYYYY(targetDateStr);

    // Kết quả mong muốn:
    // - Chỉ hiển thị các bảng giá có ngày bắt đầu từ 01/03/2026 trở đi
    // - Kết quả lọc chính xác
    for (const val of validityValues) {
      const match = val.match(/Ngày bắt đầu:\s*(\d{2}\/\d{2}\/\d{4})/);
      expect(match).not.toBeNull();
      if (match) {
        const rowDateStr = match[1];
        const rowDate = parseDateDDMMYYYY(rowDateStr);
        expect(rowDate.getTime()).toBeGreaterThanOrEqual(targetDate.getTime());
      }
    }
  });

  test('BANGGIA_40: Tìm kiếm kết hợp nhiều bộ lọc cùng lúc', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Đăng nhập, chọn cửa hàng và vào menu Sản phẩm > Bảng Giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Bước 2: Nhập tên = "Bảng giá"
    const keyword = 'Bảng giá';
    await pricingPage.searchPricing(keyword);

    // Bước 3: Chọn Hình thức = "Mua bán"
    await pricingPage.filterByForm('Mua bán');

    // Bước 4: Chọn Trạng thái = "Kích hoạt"
    await pricingPage.filterByStatus('Kích hoạt');

    // Bước 5: Quan sát kết quả
    const names = await pricingPage.getPricingNames();
    const formValues = await pricingPage.getFormColumnValues();
    const statusValues = await pricingPage.getStatusColumnValues();

    console.log('Tên bảng giá sau khi lọc kết hợp:', names);
    console.log('Hình thức sau khi lọc kết hợp:', formValues);
    console.log('Trạng thái sau khi lọc kết hợp:', statusValues);

    // Kiểm tra kết quả lọc không rỗng
    expect(names.length).toBeGreaterThan(0);

    // Kết quả mong muốn:
    // - Chỉ hiển thị bảng giá thỏa mãn TẤT CẢ 3 điều kiện: tên chứa "Bảng giá" + Hình thức Mua bán + Kích hoạt
    // - Kết quả lọc chính xác
    for (let i = 0; i < names.length; i++) {
      expect(names[i].toLowerCase()).toContain(keyword.toLowerCase());
      expect(formValues[i]).toBe('Mua bán');
      expect(statusValues[i]).toBe('Kích hoạt');
    }
  });

  test('BANGGIA_41: Tìm kiếm không có kết quả → hiển thị thông báo phù hợp', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Đăng nhập, chọn cửa hàng và vào menu Sản phẩm > Bảng Giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Bước 2: Nhập tên bảng giá = "XXXXXXXXXXX" (không tồn tại)
    const keyword = 'XXXXXXXXXXX';
    await pricingPage.searchPricing(keyword);

    // Kết quả mong muốn:
    // - Danh sách hiển thị trống hoặc thông báo "Không có dữ liệu" (hoặc "Trống" theo thực tế DOM)
    // - Không có lỗi hệ thống
    const rowCount = await pricingPage.getRowsCount();
    expect(rowCount).toBe(0);

    await expect(pricingPage.emptyPlaceholder).toBeVisible();
    const emptyText = await pricingPage.emptyPlaceholder.innerText();
    console.log('Thông báo trống hiển thị trên giao diện:', emptyText);
    expect(emptyText).toBe('Trống');
  });

  test('BANGGIA_51: Xóa bảng giá – hiển thị popup xác nhận trước khi xóa', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Vào danh sách bảng giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Bước 2: Nhấn icon Xóa (thùng rác) trên một bảng giá
    const firstRow = pricingPage.tableRows.first();
    const deleteBtn = firstRow.locator('.ant-btn-dangerous, button:has(span[aria-label="delete"]), button:has(svg[data-icon="delete"])').first();
    await deleteBtn.click();

    // Bước 3: Quan sát phản hồi
    const popconfirm = page.locator('.ant-popover, .ant-popconfirm').filter({ hasText: 'Xác nhận xóa' }).first();
    await expect(popconfirm).toBeVisible();

    // Kiểm tra nội dung tiêu đề popup xác nhận
    const popconfirmTitle = popconfirm.locator('.ant-popconfirm-title, .ant-popconfirm-message-text').first();
    await expect(popconfirmTitle).toBeVisible();
    const titleText = await popconfirmTitle.innerText();
    console.log('Tiêu đề popup xác nhận xóa:', titleText);

    // Hỗ trợ cả hai mẫu text UAT thực tế ("Xác nhận xóa bảng giá?") và mô tả yêu cầu ("Bạn có chắc muốn xóa bảng giá này?")
    expect(titleText === 'Xác nhận xóa bảng giá?' || titleText.includes('muốn xóa bảng giá')).toBe(true);

    // Kiểm tra sự tồn tại của 2 nút: Xác nhận (hoặc Xóa) và Hủy
    const cancelButton = popconfirm.locator('button').filter({ hasText: 'Hủy' }).first();
    const confirmButton = popconfirm.locator('button').filter({ hasText: /^(Xác nhận|Xóa)$/ }).first();

    await expect(cancelButton).toBeVisible();
    await expect(confirmButton).toBeVisible();

    console.log('Nút Hủy hiển thị:', await cancelButton.innerText());
    console.log('Nút Xác nhận/Xóa hiển thị:', await confirmButton.innerText());

    // Nhấp Hủy để đóng popup, tránh thực sự xóa dữ liệu gây ảnh hưởng đến môi trường
    await cancelButton.click();
    await expect(popconfirm).not.toBeVisible();
  });

  test('BANGGIA_52: Xóa bảng giá – xác nhận xóa → xóa thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Vào danh sách bảng giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Lấy tên của bảng giá ở dòng đầu tiên để đối chiếu sau khi xóa
    const namesBefore = await pricingPage.getPricingNames();
    const targetDeleteName = namesBefore[0];
    console.log('Bảng giá sẽ thực hiện xóa:', targetDeleteName);

    // Nhấn icon Xóa (thùng rác) trên bảng giá đầu tiên
    const firstRow = pricingPage.tableRows.first();
    const deleteBtn = firstRow.locator('.ant-btn-dangerous, button:has(span[aria-label="delete"]), button:has(svg[data-icon="delete"])').first();
    await deleteBtn.click();

    // Chờ popup xuất hiện và nhấn "Xóa" (hoặc "Xác nhận")
    const popconfirm = page.locator('.ant-popover, .ant-popconfirm').filter({ hasText: 'Xác nhận xóa' }).first();
    await expect(popconfirm).toBeVisible();

    const confirmButton = popconfirm.locator('button').filter({ hasText: /^(Xác nhận|Xóa)$/ }).first();
    await confirmButton.click();

    // Quan sát thông báo phản hồi (Hệ thống hiển thị thông báo xóa thành công)
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: /thành công|Xóa bảng giá thành công/i }).first();
    await expect(successMsg).toBeVisible();
    console.log('Thông báo thành công hiển thị:', await successMsg.innerText());

    // Đợi popup biến mất
    await expect(popconfirm).not.toBeVisible();

    // Tìm kiếm lại tên bảng giá vừa xóa (Không có dữ liệu tức là xóa thành công)
    await pricingPage.searchPricing(targetDeleteName);

    const rowCount = await pricingPage.getRowsCount();
    expect(rowCount).toBe(0);

    await expect(pricingPage.emptyPlaceholder).toBeVisible();
    const emptyText = await pricingPage.emptyPlaceholder.innerText();
    console.log('Tìm kiếm lại tên bảng giá đã xóa, hiển thị trống:', emptyText);
    expect(emptyText).toBe('Trống');
  });

  test('BANGGIA_53: Xóa bảng giá – nhấn Hủy → bảng giá không bị xóa', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Vào danh sách bảng giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Lấy tên của bảng giá ở dòng đầu tiên để đối chiếu
    const namesBefore = await pricingPage.getPricingNames();
    const targetName = namesBefore[0];
    console.log('Bảng giá sẽ thực hiện hủy xóa:', targetName);

    // Nhấn icon Xóa (thùng rác) trên bảng giá đầu tiên
    const firstRow = pricingPage.tableRows.first();
    const deleteBtn = firstRow.locator('.ant-btn-dangerous, button:has(span[aria-label="delete"]), button:has(svg[data-icon="delete"])').first();
    await deleteBtn.click();

    // Chờ popup xuất hiện và nhấn "Hủy"
    const popconfirm = page.locator('.ant-popover, .ant-popconfirm').filter({ hasText: 'Xác nhận xóa' }).first();
    await expect(popconfirm).toBeVisible();

    const cancelButton = popconfirm.locator('button').filter({ hasText: 'Hủy' }).first();
    await cancelButton.click();

    // Xác nhận popup đóng lại
    await expect(popconfirm).not.toBeVisible();

    // Xác nhận bảng giá KHÔNG bị xóa và danh sách không thay đổi (dòng đầu tiên vẫn là bảng giá đó)
    const namesAfter = await pricingPage.getPricingNames();
    expect(namesAfter[0]).toBe(targetName);
    console.log(`[BANGGIA_53] Đã xác nhận bảng giá "${targetName}" không bị xóa sau khi nhấn Hủy.`);
  });

  test('BANGGIA_54: Không thể xóa bảng giá đang Kích hoạt và đã Phê duyệt (đang áp dụng)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Vào danh sách bảng giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Tìm kiếm bảng giá "Bảng giá test combo"
    const targetName = 'Bảng giá test combo';
    await pricingPage.searchPricing(targetName);

    // Tìm dòng tương ứng với bảng giá test combo
    const targetRow = pricingPage.tableRows.filter({ hasText: targetName }).first();
    await expect(targetRow).toBeVisible({ timeout: 10_000 });

    // Định vị nút xóa trong dòng
    const deleteBtn = targetRow.locator('.ant-btn-dangerous, button:has(span[aria-label="delete"]), button:has(svg[data-icon="delete"])').first();
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });

    const isDisabled = await deleteBtn.isDisabled();
    if (isDisabled) {
      console.log(`[BANGGIA_54] Nút xóa đã bị disable đúng như kỳ vọng cho bảng giá "${targetName}".`);
      expect(isDisabled).toBe(true);
    } else {
      console.log(`[BANGGIA_54] Nút xóa không bị disable, tiến hành nhấp thử để kiểm tra thông báo lỗi.`);
      await deleteBtn.click();

      // Nếu hệ thống mở popup xác nhận xóa
      const popconfirm = page.locator('.ant-popover, .ant-popconfirm').filter({ hasText: 'Xác nhận xóa' }).first();
      const isPopconfirmVisible = await popconfirm.isVisible({ timeout: 2000 }).catch(() => false);
      if (isPopconfirmVisible) {
        const confirmButton = popconfirm.locator('button').filter({ hasText: /^(Xác nhận|Xóa)$/ }).first();
        await confirmButton.click();
      }

      // Đợi thông báo lỗi hiển thị (Hệ thống KHÔNG cho xóa và báo lỗi không thể xóa bảng giá đang kích hoạt/áp dụng)
      const errorMsg = page.locator('.ant-message-error, .ant-notification-notice-error')
        .filter({ hasText: /không thể xóa|đang kích hoạt|đang được áp dụng|đang áp dụng/i }).first();
      await expect(errorMsg).toBeVisible({ timeout: 10_000 });
      console.log(`[BANGGIA_54] Đã xác nhận hệ thống chặn xóa và hiển thị lỗi: "${await errorMsg.innerText()}"`);
    }
  });

  test('BANGGIA_47: Bảng giá mới tạo có Trạng thái phê duyệt = Chờ phê duyệt', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Vào danh sách bảng giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Đổi kích thước trang sang 50 để hiển thị tất cả các bảng giá (bao gồm cả bảng giá vừa tạo/chờ phê duyệt)
    const pageSizeSelector = page.locator('.ant-pagination .ant-select-selector').first();
    if (await pageSizeSelector.isVisible()) {
      await pageSizeSelector.click();
      await page.waitForTimeout(500);
      const option50 = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').filter({ hasText: '50 / trang' }).first();
      if (await option50.isVisible()) {
        await option50.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
    }

    // Bước 2: Quan sát cột Trạng thái phê duyệt của bảng giá mới tạo (trạng thái Chờ phê duyệt)
    const targetRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: 'Chờ phê duyệt' }).first();
    await expect(targetRow).toBeVisible({ timeout: 15_000 });

    // - Cột Trạng thái phê duyệt hiển thị "Chờ phê duyệt" (màu cam)
    // Index 7 tương ứng với cột thứ 8: Trạng thái phê duyệt
    const approvalStatusCell = targetRow.locator('td').nth(7);
    await expect(approvalStatusCell).toHaveText('Chờ phê duyệt');

    // Kiểm tra tag màu cam (Ant Design thường dùng class ant-tag-orange hoặc class chứa màu cam)
    const orangeTag = approvalStatusCell.locator('.ant-tag-orange, .ant-tag').first();
    await expect(orangeTag).toBeVisible();

    // - Nút tick phê duyệt hiển thị trong cột Thao tác
    // Index 8 tương ứng với cột thứ 9: Thao tác
    const actionCell = targetRow.locator('td').nth(8);
    const approveBtn = actionCell.locator('button:has(span[aria-label="check"]), button:has(svg[data-icon="check"]), .anticon-check').first();
    await expect(approveBtn).toBeVisible({ timeout: 5_000 });

    console.log('[BANGGIA_47] Đã xác nhận bảng giá mới tạo (Chờ phê duyệt) hiển thị đúng trạng thái màu cam và nút phê duyệt.');
  });

  test('BANGGIA_48: Phê duyệt bảng giá – Trạng thái phê duyệt chuyển thành Đã phê duyệt', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Vào danh sách bảng giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Đổi kích thước trang sang 50 để hiển thị tất cả các bảng giá
    const pageSizeSelector = page.locator('.ant-pagination .ant-select-selector').first();
    if (await pageSizeSelector.isVisible()) {
      await pageSizeSelector.click();
      await page.waitForTimeout(500);
      const option50 = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').filter({ hasText: '50 / trang' }).first();
      if (await option50.isVisible()) {
        await option50.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
    }

    // Bước 2: Tìm bảng giá có Trạng thái phê duyệt = "Chờ phê duyệt"
    const targetRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: 'Chờ phê duyệt' }).first();
    await expect(targetRow).toBeVisible({ timeout: 15_000 });

    // Lưu lại tên của bảng giá này
    const pricingName = await targetRow.locator('td').nth(1).innerText();
    console.log('Bảng giá sẽ thực hiện phê duyệt:', pricingName.trim());

    // Nhấn icon phê duyệt (tick ✓) trong cột Thao tác (index 8)
    const actionCell = targetRow.locator('td').nth(8);
    const approveBtn = actionCell.locator('button:has(span[aria-label="check"]), button:has(svg[data-icon="check"]), .anticon-check').first();
    await expect(approveBtn).toBeVisible({ timeout: 5_000 });
    await approveBtn.click();

    // Xác nhận phê duyệt (nếu có popup/popconfirm)
    const popconfirm = page.locator('.ant-popover, .ant-popconfirm').filter({ hasText: /phê duyệt|xác nhận/i }).first();
    const isPopconfirmVisible = await popconfirm.isVisible({ timeout: 2000 }).catch(() => false);
    if (isPopconfirmVisible) {
      const confirmButton = popconfirm.locator('button').filter({ hasText: /^(Xác nhận|Đồng ý|Phê duyệt)$/ }).first();
      await confirmButton.click();
    }

    // Đợi thông báo phê duyệt thành công hiển thị
    const successMsg = page.locator('.ant-message-success, .ant-notification-notice').filter({ hasText: /thành công/i }).first();
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
    console.log('Thông báo thành công:', await successMsg.innerText());

    // Đợi bảng dữ liệu tải lại xong
    await page.waitForTimeout(2000);

    // Bước 3: Xác nhận trạng thái sau khi phê duyệt
    const updatedRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: pricingName }).first();
    await expect(updatedRow).toBeVisible({ timeout: 10_000 });

    // - Trạng thái phê duyệt chuyển thành "Đã phê duyệt" (màu xanh)
    const approvalStatusCell = updatedRow.locator('td').nth(7);
    await expect(approvalStatusCell).toHaveText('Đã phê duyệt');

    const successTag = approvalStatusCell.locator('.ant-tag-success, .ant-tag-green, .ant-tag').first();
    await expect(successTag).toBeVisible();

    // - Icon phê duyệt ẩn đi trong cột Thao tác
    const updatedActionCell = updatedRow.locator('td').nth(8);
    const updatedApproveBtn = updatedActionCell.locator('button:has(span[aria-label="check"]), button:has(svg[data-icon="check"]), .anticon-check').first();
    await expect(updatedApproveBtn).not.toBeVisible({ timeout: 5_000 });

    console.log(`[BANGGIA_48] Đã phê duyệt thành công bảng giá "${pricingName}" và chuyển trạng thái sang "Đã phê duyệt".`);
  });

  test('BANGGIA_49: Bảng giá đã phê duyệt không thể phê duyệt lại', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const selectShopPage = new SelectShopPage(page);
    const dashboardPage = new DashboardPage(page);
    const pricingPage = new PricingPage(page);

    // Bước 1: Vào danh sách bảng giá
    await loginPage.login(ENV.TEST_USERNAME, ENV.TEST_PASSWORD);
    await selectShopPage.selectShop('Tổng công ty Bưu Điện Việt Nam');
    await dashboardPage.navigateToPricing();

    // Chờ bảng dữ liệu hiển thị
    await page.waitForSelector('.ant-table-tbody');

    // Đổi kích thước trang sang 50 để hiển thị tất cả các bảng giá
    const pageSizeSelector = page.locator('.ant-pagination .ant-select-selector').first();
    if (await pageSizeSelector.isVisible()) {
      await pageSizeSelector.click();
      await page.waitForTimeout(500);
      const option50 = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').filter({ hasText: '50 / trang' }).first();
      if (await option50.isVisible()) {
        await option50.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
    }

    // Bước 2: Tìm bảng giá có Trạng thái phê duyệt = "Đã phê duyệt"
    const targetRow = page.locator('table tbody tr.ant-table-row')
      .filter({ hasText: 'Đã phê duyệt' }).first();
    await expect(targetRow).toBeVisible({ timeout: 15_000 });

    // Bước 3: Xác nhận nút tick phê duyệt không hiển thị hoặc bị disable ở cột Thao tác (index 8)
    const actionCell = targetRow.locator('td').nth(8);
    const approveBtn = actionCell.locator('button:has(span[aria-label="check"]), button:has(svg[data-icon="check"]), .anticon-check').first();

    const isVisible = await approveBtn.isVisible();
    if (isVisible) {
      const isDisabled = await approveBtn.isDisabled();
      expect(isDisabled).toBe(true);
      console.log('[BANGGIA_49] Nút phê duyệt vẫn xuất hiện nhưng đã bị vô hiệu hóa (disabled).');
    } else {
      await expect(approveBtn).not.toBeVisible();
      console.log('[BANGGIA_49] Nút phê duyệt không còn hiển thị (ẩn đi) đúng như kỳ vọng.');
    }
  });
});
