import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { SEED_TASKS, summaryText } from '../fixtures/test-data';
import { loginAsValidUser, resetStorage } from '../fixtures/session';

// SC-REG-04 — Biên dòng tổng kết: tất cả hoàn thành & danh sách rỗng
test.describe('SC-REG-04 — Biên tổng kết @regression', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
    await loginAsValidUser(page);
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('should cập nhật tổng kết khi tất cả hoàn thành rồi xóa hết', async () => {
    // Tick cả 2 task seed (TC-TOGGLE-03)
    await dashboard.toggleTask(SEED_TASKS[0]);
    await dashboard.toggleTask(SEED_TASKS[1]);
    // Checkpoint A: tất cả hoàn thành
    await expect(dashboard.summary).toHaveText(summaryText(2, 2));

    // Xóa hết (TC-DEL-01 / TC-LIST-03)
    await dashboard.deleteTask(SEED_TASKS[0]);
    await dashboard.deleteTask(SEED_TASKS[1]);
    // Checkpoint B: danh sách rỗng
    await expect(dashboard.summary).toHaveText(summaryText(0, 0));
  });
});
