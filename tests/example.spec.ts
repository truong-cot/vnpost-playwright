import { test, expect, chromium } from "@playwright/test";

test("Login test", async ({}) => {
  console.log("🚀 BƯỚC 1: Launch Browser (Xây nhà)");

  // Đây là lúc chúng ta quyết định "Hình hài" của trình duyệt

  const browser = await chromium.launch({
    headless: false, // false = Hiện giao diện (Có đầu), true = Chạy ngầm (Không đầu)

    slowMo: 2000, // Chuyển động chậm (2 giây mỗi thao tác) để kịp nhìn

    channel: "chrome", // (Tùy chọn) Bắt buộc dùng Google Chrome thật thay vì Chromium
  });
  console.log("🚪 BƯỚC 2: New Context (Mở phòng)");

  // Tùy chỉnh kích thước màn hình, quay video... ở bước này

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },

    recordVideo: { dir: "videos/" }, // Tự động quay video lưu vào folder
  });

  console.log("📄 BƯỚC 3: New Page (Mở Tab)");

  const page = await context.newPage();

  console.log("👉 BƯỚC 4: Thao tác");

  await page.goto("https://crm.anhtester.com");

  await page.fill('input[name="email"]', "admin@example.com");

  // Nhờ slowMo: 2000, bạn sẽ thấy nó gõ từng chữ rất từ tốn
  console.log("🛑 BƯỚC 5: Đóng cửa (Quan trọng)");

  await browser.close();

  // Nếu không close, cái cửa sổ Chrome đó sẽ treo mãi
});
