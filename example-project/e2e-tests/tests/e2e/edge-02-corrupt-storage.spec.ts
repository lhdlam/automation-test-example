import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { STORAGE_KEYS } from '../fixtures/test-data';
import { resetStorage, seedSession, setRawStorage } from '../fixtures/session';

// SC-EDGE-02 — Storage hỏng & sức bền khi load.
// Các test này assert KỲ VỌNG PHÒNG THỦ (không crash). Nếu FAIL → xác nhận bug & ghi docs/bugs.md.
// KHÔNG nới lỏng assert để vượt qua (theo CLAUDE.md): `JSON.parse` không bọc try/catch.
test.describe('SC-EDGE-02 — Storage hỏng @edge', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('should không crash dashboard when tm_tasks chứa JSON hỏng', async ({ page }) => {
    test.info().annotations.push({
      type: 'bug?',
      description:
        'getTasks() gọi JSON.parse không try/catch. tm_tasks hỏng có thể ném lỗi khi render → trang lỗi. TC-EDGE-01.',
    });

    const pageErrors: Error[] = [];
    page.on('pageerror', (e) => pageErrors.push(e));

    await seedSession(page, { email: 'tester@example.com', name: 'Nguyễn Văn Tester' });
    await setRawStorage(page, 'session', STORAGE_KEYS.tasks, '{day-la-json-hong');

    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Kỳ vọng: trang load an toàn, không có lỗi runtime chưa bắt.
    expect(pageErrors, `Có lỗi runtime: ${pageErrors.map((e) => e.message).join('; ')}`).toHaveLength(0);
  });

  test('should xử lý an toàn when tm_session là JSON hỏng (redirect thay vì crash)', async ({ page }) => {
    test.info().annotations.push({
      type: 'bug?',
      description: 'getSession() JSON.parse không try/catch. tm_session hỏng có thể crash thay vì redirect. TC-EDGE-02.',
    });

    const pageErrors: Error[] = [];
    page.on('pageerror', (e) => pageErrors.push(e));

    await setRawStorage(page, 'local', STORAGE_KEYS.session, 'khong-phai-json');
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    expect(pageErrors, `Có lỗi runtime: ${pageErrors.map((e) => e.message).join('; ')}`).toHaveLength(0);
  });
});
