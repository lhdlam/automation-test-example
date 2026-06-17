import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { getValidUser, summaryText } from '../fixtures/test-data';
import { resetStorage } from '../fixtures/session';

// SC-SMOKE-01 — Hành trình cốt lõi: Đăng nhập → CRUD → Đăng xuất
test.describe('SC-SMOKE-01 — Hành trình cốt lõi @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('should hoàn tất đăng nhập, thêm/đánh dấu/xóa công việc và đăng xuất when dùng tài khoản hợp lệ', async ({
    page,
  }) => {
    const user = getValidUser();
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const myTask = `Smoke task ${Date.now()}`;

    // Bước 1-2: đăng nhập
    await login.goto();
    await login.login(user.email, user.password);

    // Checkpoint A: vào dashboard, header hiển thị đúng tên user (TC-LOGIN-01 / TC-AUTH-04)
    await expect(dashboard.userName).toHaveText(user.name);

    // Checkpoint B: 2 task seed + tổng kết khởi tạo (TC-LIST-01 / TC-LIST-02)
    await expect(dashboard.summary).toHaveText(summaryText(2, 0));

    // Bước 4 → Checkpoint C: thêm task hợp lệ (TC-ADD-01)
    await dashboard.addTask(myTask);
    await expect(dashboard.summary).toHaveText(summaryText(3, 0));

    // Bước 5 → Checkpoint D: tick hoàn thành (TC-TOGGLE-01)
    await dashboard.toggleTask(myTask);
    await expect(dashboard.summary).toHaveText(summaryText(3, 1));

    // Bước 6 → Checkpoint E: xóa task vừa tạo, dọn dữ liệu (TC-DEL-01)
    await dashboard.deleteTask(myTask);
    await expect(dashboard.summary).toHaveText(summaryText(2, 0));

    // Bước 7 → Trạng thái kết thúc: đăng xuất về trang đăng nhập (TC-LOGOUT-01)
    await dashboard.logout();
    await expect(login.submitButton).toBeVisible();
  });
});
