import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { getValidUser, MESSAGES } from '../fixtures/test-data';
import { resetStorage, seedSession } from '../fixtures/session';

// SC-EDGE-01 — Rủi ro an ninh & xác thực client-side.
// LƯU Ý: các test này GHI NHẬN hành vi/rủi ro hiện tại để tester xác nhận (xem docs/bugs.md).
// KHÔNG sửa assert cho "xanh" nhằm che giấu vấn đề (theo CLAUDE.md).
test.describe('SC-EDGE-01 — An ninh & client-guard @edge', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('should vào được dashboard when giả mạo tm_session (rủi ro: guard chỉ phía client)', async ({ page }) => {
    test.info().annotations.push({
      type: 'risk',
      description:
        'Bảo vệ trang chỉ là client-side guard. Phiên giả mạo qua localStorage cho phép vào dashboard ' +
        'mà không cần mật khẩu. Ghi docs/bugs.md để tester quyết định mức rủi ro (TC-AUTH-05).',
    });

    // Bơm phiên giả (không qua đăng nhập)
    await seedSession(page, { email: 'gia-mao@example.com', name: 'Kẻ Giả Mạo' });
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Ghi nhận thực trạng: dashboard hiển thị → khẳng định rủi ro client-guard.
    await expect(dashboard.heading).toBeVisible();
  });

  test('should từ chối đăng nhập when email đúng nhưng khác hoa/thường (nghi vấn bug)', async ({ page }) => {
    test.info().annotations.push({
      type: 'bug?',
      description:
        'So khớp email dùng === phân biệt hoa/thường. Email đúng nhưng viết hoa khác sẽ bị từ chối. ' +
        'Cần xác nhận kỳ vọng nghiệp vụ (thường email không phân biệt hoa/thường) — TC-LOGIN-12.',
    });

    const user = getValidUser();
    const login = new LoginPage(page);
    await login.goto();
    await login.login(user.email.toUpperCase(), user.password);

    // Ghi nhận thực trạng hiện tại (bị từ chối). Nếu nghiệp vụ kỳ vọng KHÁC → ghi docs/bugs.md.
    await expect(login.errorMessage).toHaveText(MESSAGES.loginFailed);
  });

  test('should từ chối đăng nhập when mật khẩu đúng nhưng có khoảng trắng bao quanh (nghi vấn bug)', async ({
    page,
  }) => {
    test.info().annotations.push({
      type: 'bug?',
      description:
        'Mật khẩu KHÔNG được trim (khác email). Mật khẩu đúng nhưng có khoảng trắng đầu/cuối bị từ chối. ' +
        'Xác nhận đây là chủ ý hay bug — TC-LOGIN-13.',
    });

    const user = getValidUser();
    const login = new LoginPage(page);
    await login.goto();
    await login.login(user.email, `  ${user.password}  `);

    await expect(login.errorMessage).toHaveText(MESSAGES.loginFailed);
  });
});
