import users from './users.json';

export interface Credentials {
  email: string;
  password: string;
  name?: string;
}

/** Lấy biến môi trường bắt buộc; ném lỗi rõ ràng nếu thiếu (tránh chạy với giá trị undefined). */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thiếu biến môi trường ${name}. Hãy đặt trong .env.staging / .env.uat.`);
  }
  return value;
}

/** Tài khoản hợp lệ — email/mật khẩu resolve từ process.env, tên hiển thị từ fixtures (không nhạy cảm). */
export function getValidUser(): Required<Credentials> {
  return {
    email: requireEnv(users.validUser.emailEnv),
    password: requireEnv(users.validUser.passwordEnv),
    name: users.validUser.expectedName,
  };
}

/** Email đúng nhưng mật khẩu sai (BR-05). */
export function getInvalidPasswordUser(): Credentials {
  return {
    email: requireEnv(users.invalidPassword.emailEnv),
    password: users.invalidPassword.password,
  };
}

/** Email đúng định dạng nhưng không tồn tại (BR-05). */
export function getNonexistentUser(): Credentials {
  return { email: users.nonexistentUser.email, password: users.nonexistentUser.password };
}

/** Thông báo đối chiếu chính xác chuỗi (business-rules.md). */
export const MESSAGES = {
  emailRequired: 'Email là bắt buộc',
  emailInvalid: 'Email không hợp lệ',
  passwordRequired: 'Mật khẩu là bắt buộc',
  loginFailed: 'Email hoặc mật khẩu không đúng',
  taskTitleRequired: 'Tên công việc là bắt buộc',
} as const;

/** Tiêu đề 2 task seed mặc định (BR-09). */
export const SEED_TASKS = ['Chuẩn bị báo cáo tuần', 'Gửi email cho khách hàng'] as const;

/** Khóa storage của ứng dụng (data.js). */
export const STORAGE_KEYS = { session: 'tm_session', tasks: 'tm_tasks' } as const;

/** Dòng tổng kết kỳ vọng (BR-10). */
export function summaryText(total: number, done: number): string {
  return `Tổng: ${total} công việc, ${done} hoàn thành`;
}
