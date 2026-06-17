import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { getInvalidPasswordUser, getNonexistentUser, MESSAGES } from '../fixtures/test-data';
import { resetStorage } from '../fixtures/session';

// SC-REG-02 — Privacy: không tiết lộ email tồn tại hay không (BR-05)
test.describe('SC-REG-02 — Privacy thông báo đăng nhập sai @regression', () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
    login = new LoginPage(page);
  });

  test('should dùng cùng một thông báo chung when sai mật khẩu và khi email không tồn tại', async () => {
    const wrongPass = getInvalidPasswordUser();
    const ghost = getNonexistentUser();

    // Email đúng + mật khẩu sai (TC-LOGIN-08)
    await login.goto();
    await login.login(wrongPass.email, wrongPass.password);
    await expect(login.errorMessage).toHaveText(MESSAGES.loginFailed);

    // Email không tồn tại + mật khẩu bất kỳ (TC-LOGIN-09)
    await login.goto();
    await login.login(ghost.email, ghost.password);
    // Checkpoint: thông báo GIỐNG HỆT → không phân biệt được email có tồn tại (TC-LOGIN-11)
    await expect(login.errorMessage).toHaveText(MESSAGES.loginFailed);
  });
});
