import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Chọn môi trường qua biến TEST_ENV (mặc định staging)
dotenv.config({ path: `.env.${process.env.TEST_ENV || 'staging'}` });

export default defineConfig({
  testDir: './tests/e2e',
  // KHÔNG có webServer — vì ta không chạy app local, chỉ trỏ tới server deploy
  use: {
    baseURL: process.env.BASE_URL,        // ← lấy từ .env.staging / .env.uat
    trace: 'on-first-retry',              // lưu trace khi retry để debug
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  retries: 2,                             // staging/UAT hay chập chờn → cho retry
  reporter: [['html'], ['list']],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});