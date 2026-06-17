import { Page, Locator } from '@playwright/test';

/**
 * Page Object — Màn hình Đăng nhập (route '/').
 * Selector ưu tiên getByLabel/getByRole theo CLAUDE.md. Mọi goto() dùng đường dẫn
 * TƯƠNG ĐỐI, baseURL lấy từ .env qua playwright.config.ts.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  /** Vùng thông báo lỗi (#login-error có role="alert" — chỉ 1 alert trên trang này). */
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Mật khẩu');
    this.submitButton = page.getByRole('button', { name: 'Đăng nhập' });
    this.errorMessage = page.getByRole('alert');
  }

  /** Mở trang đăng nhập (trang gốc của ứng dụng). */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Điền email + mật khẩu rồi submit. */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}
