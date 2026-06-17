import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { summaryText } from '../fixtures/test-data';
import { loginAsValidUser, resetStorage } from '../fixtures/session';

// SC-EDGE-04 — Đầu vào biên & an toàn hiển thị (không crash, không XSS)
test.describe('SC-EDGE-04 — Đầu vào biên & XSS @edge', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('should không crash when email cực dài / ký tự đặc biệt', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (e) => pageErrors.push(e));

    const login = new LoginPage(page);
    await login.goto();
    const longEmail = `${'a'.repeat(300)}+tag@ví-dụ-unicode.com`;
    await login.login(longEmail, 'Test@1234');

    // Checkpoint: có thông báo lỗi phù hợp, không lỗi runtime (TC-LOGIN-16)
    await expect(login.errorMessage).toBeVisible();
    expect(pageErrors).toHaveLength(0);
  });

  test('should hiển thị nguyên văn và KHÔNG thực thi script when tên task chứa HTML', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (d) => {
      dialogFired = true;
      await d.dismiss();
    });

    await loginAsValidUser(page);
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    const xss = '<img src=x onerror=alert(1)>';
    await dashboard.addTask(xss);

    // Checkpoint A: hiển thị nguyên văn (textContent), không có dialog alert (TC-ADD-05)
    await expect(dashboard.taskItem(xss)).toBeVisible();
    expect(dialogFired).toBe(false);

    await dashboard.deleteTask(xss);
  });

  test('should thêm được when tên công việc cực dài (ghi nhận rủi ro layout)', async ({ page }) => {
    test.info().annotations.push({
      type: 'bug?',
      description: 'Không giới hạn độ dài tên công việc → chuỗi rất dài vẫn thêm; kiểm tra layout (TC-ADD-06).',
    });

    await loginAsValidUser(page);
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    const longTitle = `Việc dài ${'x'.repeat(1000)}`;
    await dashboard.addTask(longTitle);

    await expect(dashboard.summary).toHaveText(summaryText(3, 0)); // TC-ADD-06
    await dashboard.deleteTask(longTitle);
  });

  test('should cho phép when thêm 2 task trùng tên', async ({ page }) => {
    await loginAsValidUser(page);
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addTask('Việc trùng tên');
    await dashboard.addTask('Việc trùng tên');

    // Checkpoint: cả hai tồn tại độc lập (TC-ADD-07)
    await expect(dashboard.taskItem('Việc trùng tên')).toHaveCount(2);

    // Dọn cả hai
    await dashboard.deleteButton('Việc trùng tên').first().click();
    await dashboard.deleteButton('Việc trùng tên').first().click();
  });

  test('should xóa ngay không cần xác nhận when bấm "Xóa" (ghi nhận rủi ro UX)', async ({ page }) => {
    test.info().annotations.push({
      type: 'note',
      description: 'Xóa không có hộp xác nhận/undo → rủi ro mất dữ liệu do thao tác nhầm (TC-DEL-02).',
    });

    let dialogFired = false;
    page.on('dialog', async (d) => {
      dialogFired = true;
      await d.dismiss();
    });

    await loginAsValidUser(page);
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addTask('Việc sẽ xóa');
    await dashboard.deleteTask('Việc sẽ xóa');

    // Checkpoint: không có hộp xác nhận, task biến mất ngay (TC-DEL-02)
    expect(dialogFired).toBe(false);
    await expect(dashboard.taskItem('Việc sẽ xóa')).toHaveCount(0);
  });
});
