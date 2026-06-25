# Playwright Test Automation Rules & Standards

Chào mừng bạn (nhà phát triển hoặc AI Agent) đến với dự án kiểm thử tự động VNPost! Vui lòng đọc kỹ và tuân thủ các quy tắc dưới đây để bảo trì và phát triển mã nguồn một cách nhất quán và chuẩn mực.

## 📂 1. Cấu Trúc Dự Án (Project Structure)
- **Page Objects (POM)**: Các file định nghĩa element locators và hàm thao tác UI (Actions) nằm ở `src/pages/*.page.ts` (ví dụ: `src/pages/product.page.ts`).
  - Tất cả các lớp Page Object bắt buộc phải kế thừa `BasePage` từ `src/pages/base.page.ts`.
- **Kịch Bản Kiểm Thử (Spec Files)**: Các file chứa kịch bản và assertions thực tế nằm ở `tests/**/*.spec.ts` (ví dụ: `tests/product/detail-product.spec.ts`).
  - Mọi tệp kiểm thử spec bắt buộc phải có phần code định nghĩa các kịch bản kiểm thử rõ ràng với mã kiểm thử cụ thể (ví dụ: `SANPHAM_26`, `SANPHAM_27`).
- **Cấu hình môi trường**: File `.env` chứa URL và tài khoản kiểm thử. Thông tin cấu hình được đọc qua `src/utils/env.config.ts`.

## 📌 2. Quy Tắc Viết Code (Coding & Locator Standards)

### A. Tách biệt Locators & Assertions (BẮT BUỘC)
- **Locators & Actions**: Phải nằm hoàn toàn trong file Page Object (`src/pages/*.page.ts`).
- **Assertions (`expect`)**: Phải nằm hoàn toàn trong file kịch bản kiểm thử (`tests/**/*.spec.ts`). Tuyệt đối không được viết Assertion trong Page Object.

### B. Ngôn ngữ & Chú thích (Vietnamese Only)
- Tất cả các chú thích (Comments), tài liệu JSDoc/TSDoc và console log (`console.log`) trong cả file Page Object và file Test Spec bắt buộc phải viết **100% bằng Tiếng Việt**.

### C. Thứ tự ưu tiên bộ chọn (Locator Priority)
Playwright cung cấp bộ locator hướng người dùng. Bắt buộc ưu tiên sử dụng thay vì XPath/CSS Selector thô:
1. `getByRole()` — Ví dụ: `page.getByRole('button', { name: 'Xác nhận' })`
2. `getByLabel()` — Tốt nhất cho các trường nhập liệu có nhãn
3. `getByPlaceholder()` — Tốt nhất cho trường nhập liệu có placeholder
4. `getByText()` — Tốt nhất cho văn bản tĩnh
5. `locator("css-selector")` — Chỉ dùng làm phương án cuối cùng khi không có phương án tốt hơn.

### D. Tránh Trùng Lặp Định Vị (Strict Mode & Exact Match)
- Khi tìm các nút bấm có văn bản phổ biến (như "Hủy", "Sửa", "Xác nhận"), hãy dùng tùy chọn `{ exact: true }` để tránh khớp nhầm các phần tử khác chứa chuỗi đó (ví dụ: Tên sản phẩm "Sản phẩm Hủy Gốc" bị khớp nhầm khi tìm nút "Hủy").
  *Ví dụ:* `page.getByRole('button', { name: 'Hủy', exact: true }).first()`
- Khi hiển thị Drawer/Dialog (như Drawer Chi tiết sản phẩm, Drawer Thêm sản phẩm), hãy khoanh vùng locator trong container Drawer để tránh tìm nhầm các phần tử ở trang chính:
  *Ví dụ:* `const detailDrawer = page.locator('[role="dialog"], .ant-drawer').filter({ hasText: 'Chi tiết sản phẩm' }).first();`

### E. Chiến Lược Chờ Đợi (Smart Wait)
- **Tuyệt đối không** sử dụng `page.waitForTimeout()` hoặc `setTimeout` cố định thời gian.
- Hãy để Playwright tự động chờ bằng cách sử dụng Web-First Assertions:
  ```typescript
  await expect(locator).toBeVisible({ timeout: 10_000 });
  await expect(locator).toBeEnabled();
  ```

## 🏃 3. Quy Tắc Chạy Kiểm Thử (Running & Execution)

### A. Chạy Tuần Tự (Single Worker Constraint)
- Do môi trường Staging/UAT giới hạn duy nhất 1 phiên đăng nhập đồng thời trên mỗi tài khoản, **bắt buộc** phải cấu hình hoặc chạy kiểm thử tuần tự với chỉ duy nhất 1 worker.
- **Lệnh chạy có hiển thị giao diện (Headed Mode - Bắt buộc khi debug):**
  ```bash
  npx playwright test tests/product/detail-product.spec.ts -g "SANPHAM_27" --project=chromium --headed --workers=1
  ```
- **Lệnh xem báo cáo HTML trên port cố định:**
  ```bash
  npx playwright show-report --port 9325
  ```

## 🛠️ 4. Quy Trình Gỡ Lỗi & Tự Phục Hồi (Debugging & Self-Healing)
Khi kịch bản kiểm thử bị thất bại (Fail):
1. Mở báo cáo HTML bằng lệnh show-report ở trên để xem chính xác ảnh chụp lỗi và log trace.
2. Kiểm tra xem locator có bị trùng khớp (Strict Mode Violation) hay không.
3. Luôn đảm bảo đóng các Drawer/Dialog trước khi kết thúc test hoặc trong kịch bản teardown để tránh ảnh hưởng đến các lượt chạy tiếp theo.
