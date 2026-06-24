import { defineConfig, devices } from '@playwright/test';

/**
 * Đọc các biến môi trường từ file .env.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Xem chi tiết cấu hình tại: https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Chạy các file kiểm thử song song */
  fullyParallel: true,
  /* Báo lỗi bản build trên CI nếu bạn vô tình để lại test.only trong mã nguồn. */
  forbidOnly: !!process.env.CI,
  /* Chạy lại kiểm thử khi thất bại trên môi trường CI */
  retries: process.env.CI ? 2 : 0,
  /* Vô hiệu hóa chạy song song trên CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Định dạng báo cáo kiểm thử. Xem https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Cấu hình chung cho tất cả các projects bên dưới. Xem https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Đường dẫn URL gốc cho các thao tác chuyển trang như `await page.goto('')`. */
    baseURL: process.env.BASE_URL || 'https://vnpost.sfin.vn/',

    /* Thu thập trace khi chạy lại kiểm thử thất bại. Xem https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // Cấu hình làm chậm thao tác (slowMo: 1000ms) và tắt bảo mật web để tránh CORS
    launchOptions: {
      slowMo: 1000,
      args: ['--disable-web-security'],
    }
  },

  /* Cấu hình các trình duyệt kiểm thử chính */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Kiểm thử trên thiết bị di động. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Kiểm thử trên các trình duyệt thương mại. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Khởi chạy dev server cục bộ trước khi bắt đầu kiểm thử */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
