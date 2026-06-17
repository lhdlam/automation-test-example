import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { getValidUser } from '../fixtures/test-data';
import { resetStorage } from '../fixtures/session';

// SC-SMOKE-02 — Bảo vệ truy cập & chặn sau đăng xuất (luồng kiểm tra phân quyền)
test.describe('SC-SMOKE-02 — Bảo vệ truy cập @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  // SC-AUTH-01 / TC-AUTH-01 — luồng được xác minh selector qua Playwright MCP trên Staging.
  test('should redirect về đăng nhập when truy cập dashboard lúc chưa đăng nhập', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await dashboard.goto();

    // Checkpoint A: bị đẩy về trang đăng nhập (không lộ dữ liệu nội bộ)
    await expect(login.submitButton).toBeVisible();
  });

  test('should chặn dashboard sau khi đăng xuất when quay lại trang nội bộ', async ({ page }) => {
    const user = getValidUser();
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await login.goto();
    await login.login(user.email, user.password);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.logout();

    // Checkpoint B: vào lại dashboard sau đăng xuất bị chặn (TC-LOGOUT-02 / TC-AUTH-02)
    await dashboard.goto();
    await expect(login.submitButton).toBeVisible();

    // Checkpoint C: nút Back của trình duyệt cũng không lộ dashboard (TC-AUTH-03)
    await page.goBack();
    await expect(login.submitButton).toBeVisible();
  });
});
