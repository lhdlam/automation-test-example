import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { getValidUser, STORAGE_KEYS } from './test-data';

/**
 * Tiện ích thao tác phiên/storage cho test.
 * Lưu ý: dữ liệu "task" nằm ở sessionStorage và "phiên" ở localStorage phía client —
 * KHÔNG phải dữ liệu server. Reset/seed ở đây chỉ ảnh hưởng context trình duyệt của
 * chính test, không tạo dữ liệu rác trên Staging/UAT.
 */

/** Về đúng origin rồi xóa toàn bộ storage để test độc lập. */
export async function resetStorage(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/** Đăng nhập qua UI bằng tài khoản hợp lệ; chờ điều hướng sang dashboard. */
export async function loginAsValidUser(page: Page): Promise<Required<ReturnType<typeof getValidUser>>> {
  const user = getValidUser();
  const login = new LoginPage(page);
  await login.goto();
  await login.login(user.email, user.password);
  // Chờ vào dashboard bằng heading (KHÔNG khớp URL theo '.html' — một số host dùng
  // clean URL '/dashboard', xác nhận qua MCP trên Staging thật).
  await new DashboardPage(page).heading.waitFor();
  return user;
}

/** Bơm phiên trực tiếp vào localStorage (dùng cho edge: kiểm tra client-side guard). */
export async function seedSession(page: Page, session: { email: string; name: string }): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [STORAGE_KEYS.session, JSON.stringify(session)] as const
  );
}

/** Ghi raw string (có thể là JSON hỏng) vào storage — dùng cho edge error-handling. */
export async function setRawStorage(
  page: Page,
  area: 'local' | 'session',
  key: string,
  raw: string
): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ([a, k, v]) => (a === 'local' ? localStorage : sessionStorage).setItem(k, v),
    [area, key, raw] as const
  );
}
