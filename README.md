# VNPost UI Automation Testing Framework

Dự án kiểm thử tự động (UI Automation Testing) cho website VNPost sử dụng **Playwright** và **TypeScript** theo mô hình **Page Object Model (POM)**.

---

## 🚀 Tính Năng & Thiết Kế Framework
- **Page Object Model (POM)**: Tách biệt hoàn toàn phần xử lý giao diện (locators & actions) và phần kịch bản kiểm thử (assertions & flows).
- **Environment Management**: Quản lý thông tin nhạy cảm (Credentials, URL) qua file `.env` không commit lên Git.
- **Smart Wait**: Sử dụng cơ chế auto-waiting mặc định và Web-First Assertions của Playwright giúp test chạy ổn định, hạn chế tối đa flaky tests.
- **Traceable Test Data**: Tiện ích sinh dữ liệu tự động gắn nhãn rõ ràng theo cấu trúc để dễ dàng truy vết trong DB/Reports.
- **Video & Screenshots**: Tự động chụp ảnh màn hình và quay video khi kịch bản test thất bại để phục vụ việc debug.

---

## 🛠️ Hướng Dẫn Thiết Lập (Setup)

### 1. Yêu cầu hệ thống
- Cài đặt **Node.js** (Khuyến nghị phiên bản 18+).

### 2. Cài đặt các thư viện phụ thuộc
Di chuyển vào thư mục dự án và chạy lệnh:
```bash
npm install
```

### 3. Cấu hình môi trường (Environment Setup)
Tạo file `.env` ở thư mục gốc của dự án (hoặc copy từ file `.env.example`):
```bash
cp .env.example .env
```
Cập nhật nội dung trong file `.env` với các thông tin thực tế:
```ini
BASE_URL=https://vnpost.sfin.vn/
TEST_USERNAME=0339940200
TEST_PASSWORD=123456
```

---

## 🏃 Hướng Dẫn Chạy Kiểm Thử (Running Tests)

### Chạy toàn bộ test suite ở chế độ headless (chạy ngầm)
```bash
npx playwright test
```

### Chạy một file test cụ thể
```bash
npx playwright test tests/auth/login.spec.ts
```

### Chạy và xem giao diện trình duyệt trực tiếp (Headed mode)
```bash
npx playwright test tests/auth/login.spec.ts --headed
```

### Chạy chế độ giao diện tương tác trực quan (UI Mode)
Cho phép xem từng hành động chạy tự động, DOM snapshot, console log và network request trực tiếp trên UI:
```bash
npx playwright test tests/auth/login.spec.ts --ui
```

### Chạy chế độ gỡ lỗi từng bước (Debug Mode)
Mở công cụ **Playwright Inspector** để tạm dừng và bấm chạy qua từng dòng lệnh:
```bash
npx playwright test tests/auth/login.spec.ts --headed --debug
```

### Chỉ chạy trên một trình duyệt cụ thể (ví dụ Google Chrome)
```bash
npx playwright test tests/auth/login.spec.ts --project=chromium
```

### Xem báo cáo kết quả kiểm thử (HTML Report)
Sau khi chạy xong test, sử dụng lệnh sau để mở báo cáo kết quả trên trình duyệt:
```bash
npx playwright show-report
```
*Lưu ý: Nếu gặp lỗi trùng cổng (`EADDRINUSE`), hãy chỉ định cổng khác để chạy:*
```bash
npx playwright show-report --port 9325
```

---

## 📁 Cấu Trúc Dự Án (Project Structure)
```
playwright-demo/
├── playwright.config.ts        # File cấu hình Playwright (baseURL, viewport, reporter...)
├── package.json                # Quản lý thư viện phụ thuộc và scripts
├── .env.example                # Bản mẫu cấu hình môi trường
├── .env                        # Chứa URL và tài khoản kiểm thử (được bỏ qua bởi git)
├── .gitignore                  # Cấu hình bỏ qua các thư mục node_modules, reports, videos...
├── README.md                   # Tài liệu hướng dẫn này
├── src/
│   ├── pages/                  # Thư mục lưu các lớp Page Objects
│   │   ├── base.page.ts        # Chứa wrapper actions dùng chung
│   │   ├── login.page.ts       # Page Object cho màn hình đăng nhập
│   │   ├── select-shop.page.ts # Page Object cho màn hình chọn vai trò & điểm bán
│   │   └── dashboard.page.ts   # Page Object cho trang Dashboard chính
│   └── utils/                  # Thư mục chứa các module tiện ích
│       ├── env.config.ts       # Đọc và định nghĩa kiểu dữ liệu cho biến môi trường
│       └── test-data.ts        # Sinh dữ liệu ngẫu nhiên hỗ trợ test
└── tests/                      # Thư mục chứa kịch bản kiểm thử (Test Specs)
    └── auth/
        └── login.spec.ts       # Kịch bản kiểm thử Đăng nhập & Đăng xuất
```

---

## 📌 Các Quy Tắc Chung (Conventions)
1. **Locators**: Không hardcode các XPath/CSS selector dài và dễ vỡ. Hãy ưu tiên sử dụng các locator theo hướng người dùng như `getByRole()`, `getByLabel()`, `getByPlaceholder()`, `getByText()`.
2. **Assertions**: Toàn bộ Assertions phải được đặt ở các file test (`*.spec.ts`), tuyệt đối không viết Assertion trong các file Page Objects (`*.page.ts`).
3. **Smart Wait**: Tuyệt đối không sử dụng `page.waitForTimeout()` hoặc `setTimeout`. Hãy để Playwright tự động đợi thông qua các Web-First Assertions (`expect(locator).toBeVisible()`).
