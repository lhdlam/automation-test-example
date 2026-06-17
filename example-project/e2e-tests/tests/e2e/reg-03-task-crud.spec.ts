import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { MESSAGES, summaryText } from '../fixtures/test-data';
import { loginAsValidUser, resetStorage } from '../fixtures/session';

// SC-REG-03 — CRUD công việc đầy đủ & tính nhất quán của dòng tổng kết
test.describe('SC-REG-03 — CRUD công việc @regression', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
    await loginAsValidUser(page);
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('should thêm/đánh dấu/xóa công việc và giữ tổng kết nhất quán when thao tác lần lượt', async () => {
    // Trạng thái khởi đầu: 2 task seed (TC-LIST-02)
    await expect(dashboard.summary).toHaveText(summaryText(2, 0));

    // Thêm task có khoảng trắng đầu/cuối → được trim (TC-ADD-04)
    await dashboard.addTask('  CRUD việc A  ');
    await expect(dashboard.taskItem('CRUD việc A')).toBeVisible();

    // Thử thêm tên rỗng → lỗi, không thêm (TC-ADD-02)
    await dashboard.addTask('');
    await expect(dashboard.addError).toHaveText(MESSAGES.taskTitleRequired);

    // Thử thêm tên toàn khoảng trắng → lỗi (TC-ADD-03)
    await dashboard.taskTitleInput.fill('   ');
    await dashboard.addButton.click();
    await expect(dashboard.addError).toHaveText(MESSAGES.taskTitleRequired);

    // Checkpoint A: số lượng không đổi sau 2 lần lỗi (vẫn 3 = 2 seed + A)
    await expect(dashboard.summary).toHaveText(summaryText(3, 0));

    // Thêm hợp lệ sau lỗi → lỗi reset, thêm được (TC-ADD-08)
    await dashboard.addTask('CRUD việc B');
    await expect(dashboard.summary).toHaveText(summaryText(4, 0));

    // Tick & bỏ tick (TC-TOGGLE-01 / TC-TOGGLE-02)
    await dashboard.toggleTask('CRUD việc B');
    await expect(dashboard.summary).toHaveText(summaryText(4, 1));
    await dashboard.toggleTask('CRUD việc B');
    await expect(dashboard.summary).toHaveText(summaryText(4, 0));

    // Xóa task ở giữa (TC-DEL-03) — Checkpoint B: chỉ task đó mất, tổng kết cập nhật
    await dashboard.deleteTask('CRUD việc A');
    await expect(dashboard.taskItem('CRUD việc A')).toHaveCount(0);
    await expect(dashboard.summary).toHaveText(summaryText(3, 0));

    // Dọn dữ liệu do test tạo
    await dashboard.deleteTask('CRUD việc B');
  });
});
