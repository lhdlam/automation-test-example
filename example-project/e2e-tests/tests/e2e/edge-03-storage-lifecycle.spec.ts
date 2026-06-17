import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { STORAGE_KEYS, summaryText } from '../fixtures/test-data';
import { loginAsValidUser, resetStorage } from '../fixtures/session';

// SC-EDGE-03 — Vòng đời storage: phiên (localStorage, chia sẻ) vs task (sessionStorage, theo tab) + seed lại
test.describe('SC-EDGE-03 — Vòng đời storage & seed @edge', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('should giữ phiên nhưng seed lại task when mở tab mới trong cùng context', async ({ context, page }) => {
    test.info().annotations.push({
      type: 'note',
      description:
        'localStorage (phiên) chia sẻ giữa các tab; sessionStorage (task) riêng theo tab → tab mới vẫn đăng nhập ' +
        'nhưng task reset về seed. Ghi nhận khác biệt vòng đời (TC-EDGE-03).',
    });

    await loginAsValidUser(page);
    const d1 = new DashboardPage(page);
    await d1.goto();
    await d1.addTask('Việc ở tab 1');
    await expect(d1.summary).toHaveText(summaryText(3, 0));

    // Mở tab mới cùng context (chia sẻ localStorage, KHÔNG chia sẻ sessionStorage)
    const page2 = await context.newPage();
    const d2 = new DashboardPage(page2);
    await d2.goto();

    // Checkpoint A: phiên còn (vào được dashboard) nhưng task về 2 seed
    await expect(d2.summary).toHaveText(summaryText(2, 0));
    await page2.close();
  });

  test('should seed lại 2 task when sessionStorage.tm_tasks bị xóa giữa phiên', async ({ page }) => {
    await loginAsValidUser(page);
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.addTask('Việc tạm');
    await expect(dashboard.summary).toHaveText(summaryText(3, 0));

    // Xóa dữ liệu task rồi reload → getTasks() seed lại
    await page.evaluate((key) => sessionStorage.removeItem(key), STORAGE_KEYS.tasks);
    await page.reload();

    // Checkpoint B: hiển thị lại 2 task seed mặc định (TC-EDGE-05 / BR-09)
    await expect(dashboard.summary).toHaveText(summaryText(2, 0));
  });
});
