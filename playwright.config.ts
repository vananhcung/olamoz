
import { defineConfig } from '@playwright/test';

export default defineConfig({

  // 1. Thư mục chứa toàn bộ file test
  testDir: './tests',

  // 2. Thời gian tối đa cho mỗi test
  timeout: 60000,

  // 3. Thời gian chờ kiểm tra phần tử
  expect: {
    timeout: 15000,
  },

  // 4. Không chạy song song
  fullyParallel: false,
  workers: 1,

  // 5. Không chạy lại khi test thất bại
  retries: 0,

  // 6. Không cho phép test.only trên GitHub
  forbidOnly: !!process.env.CI,

  // 7. Xuất báo cáo HTML
  reporter: 'html',

  // 8. Chỉ chạy trên Google Chrome
  projects: [
    {
      name: 'Google Chrome',

      use: {
        browserName: 'chromium',
        channel: 'chrome',

        // GitHub chạy ẩn, máy tính chạy hiện
        headless: !!process.env.CI,

        // Tốc độ thao tác
        launchOptions: {
          slowMo: process.env.CI ? 0 : 1000,
        },

        // Chụp ảnh khi xảy ra lỗi
        screenshot: 'only-on-failure',

        // Lưu video khi xảy ra lỗi
        video: 'retain-on-failure',

        // Lưu quá trình kiểm thử khi lỗi
        trace: 'retain-on-failure',
      },
    },
  ],
});
