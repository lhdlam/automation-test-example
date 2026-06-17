import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { getValidUser, MESSAGES } from '../fixtures/test-data';
import { resetStorage } from '../fixtures/session';

// SC-REG-01 — Ma trận validate đăng nhập (dừng ở lỗi đầu tiên, đúng thứ tự BR-02→05)
test.describe('SC-REG-01 — Validate đăng nhập @regression', () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
    login = new LoginPage(page);
    await login.goto();
  });

  test('should hiện "Email là bắt buộc" when bỏ trống cả email lẫn mật khẩu', async () => {
    await login.login('', '');
    await expect(login.errorMessage).toHaveText(MESSAGES.emailRequired); // TC-LOGIN-10
  });

  test('should hiện "Email là bắt buộc" when email rỗng nhưng có mật khẩu', async () => {
    await login.login('', 'Test@1234');
    await expect(login.errorMessage).toHaveText(MESSAGES.emailRequired); // TC-LOGIN-02
  });

  test('should hiện "Email là bắt buộc" when email chỉ gồm khoảng trắng', async () => {
    await login.login('   ', 'Test@1234');
    await expect(login.errorMessage).toHaveText(MESSAGES.emailRequired); // TC-LOGIN-03
  });

  test('should hiện "Email không hợp lệ" when email thiếu ký tự @', async () => {
    await login.login('testerexample.com', 'Test@1234');
    await expect(login.errorMessage).toHaveText(MESSAGES.emailInvalid); // TC-LOGIN-04
  });

  test('should hiện "Email không hợp lệ" when email thiếu phần tên miền', async () => {
    await login.login('tester@', 'Test@1234');
    await expect(login.errorMessage).toHaveText(MESSAGES.emailInvalid); // TC-LOGIN-05
  });

  test('should hiện "Email không hợp lệ" when email thiếu phần mở rộng', async () => {
    await login.login('tester@example', 'Test@1234');
    await expect(login.errorMessage).toHaveText(MESSAGES.emailInvalid); // TC-LOGIN-06
  });

  test('should hiện "Mật khẩu là bắt buộc" when email hợp lệ nhưng mật khẩu rỗng', async () => {
    const { email } = getValidUser();
    await login.login(email, '');
    await expect(login.errorMessage).toHaveText(MESSAGES.passwordRequired); // TC-LOGIN-07
  });

  test('should qua được validate định dạng when email biên a@b.c (dừng ở sai tài khoản)', async () => {
    await login.login('a@b.c', 'Test@1234');
    // Không phải lỗi định dạng → đi tiếp tới so khớp tài khoản (TC-LOGIN-15)
    await expect(login.errorMessage).toHaveText(MESSAGES.loginFailed);
  });

  test('should reset thông báo lỗi cũ when sửa input hợp lệ và submit lại', async ({ page }) => {
    await login.submit(); // submit rỗng → lỗi
    await expect(login.errorMessage).toHaveText(MESSAGES.emailRequired);

    const user = getValidUser();
    await login.login(user.email, user.password);
    // Lỗi cũ được xóa & đăng nhập thành công → vào dashboard (TC-LOGIN-14)
    await expect(new DashboardPage(page).heading).toBeVisible();
  });
});
