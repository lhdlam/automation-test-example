import { Page, Locator } from '@playwright/test';

/**
 * Page Object — Màn hình Công việc / Dashboard (route '/dashboard.html').
 * Các task render động với aria-label theo tiêu đề → selector dựa trên role + tên
 * truy cập được (getByRole) thay vì CSS brittle.
 */
export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  /** Tên người dùng — không có role ngữ nghĩa; dùng id ổn định (#user-name). */
  readonly userName: Locator;
  readonly logoutButton: Locator;
  readonly taskTitleInput: Locator;
  readonly addButton: Locator;
  /** Lỗi khi thêm task (#add-error có role="alert" — chỉ 1 alert trên dashboard). */
  readonly addError: Locator;
  /** Dòng tổng kết — không có role; dùng id ổn định (#task-summary). */
  readonly summary: Locator;
  readonly taskList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Công việc của tôi' });
    this.userName = page.locator('#user-name');
    this.logoutButton = page.getByRole('button', { name: 'Đăng xuất' });
    this.taskTitleInput = page.getByLabel('Tên công việc');
    this.addButton = page.getByRole('button', { name: 'Thêm' });
    this.addError = page.getByRole('alert');
    this.summary = page.locator('#task-summary');
    this.taskList = page.getByRole('list', { name: 'Danh sách công việc' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard.html');
  }

  /** Một item công việc theo tiêu đề. */
  taskItem(title: string): Locator {
    return this.taskList.getByRole('listitem').filter({ hasText: title });
  }

  /** Checkbox hoàn thành của một task (aria-label: "Đánh dấu hoàn thành: {title}"). */
  taskCheckbox(title: string): Locator {
    return this.page.getByRole('checkbox', { name: `Đánh dấu hoàn thành: ${title}` });
  }

  /** Nút xóa của một task (aria-label: "Xóa công việc: {title}"). */
  deleteButton(title: string): Locator {
    return this.page.getByRole('button', { name: `Xóa công việc: ${title}` });
  }

  async addTask(title: string): Promise<void> {
    await this.taskTitleInput.fill(title);
    await this.addButton.click();
  }

  async toggleTask(title: string): Promise<void> {
    await this.taskCheckbox(title).click();
  }

  async deleteTask(title: string): Promise<void> {
    await this.deleteButton(title).click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
