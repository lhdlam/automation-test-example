// auth.js — Xử lý đăng nhập: kiểm tra hợp lệ (validate) + xác thực.
// Quy tắc validate chi tiết xem business-rules.md (BR-02 → BR-05).

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Trả về thông báo lỗi đầu tiên, hoặc null nếu hợp lệ.
function validateLogin(email, password) {
  if (!email) return 'Email là bắt buộc';
  if (!EMAIL_REGEX.test(email)) return 'Email không hợp lệ';
  if (!password) return 'Mật khẩu là bắt buộc';
  return null;
}

// Thử đăng nhập. Trả về { ok: boolean, error?: string }.
function attemptLogin(email, password) {
  const validationError = validateLogin(email, password);
  if (validationError) return { ok: false, error: validationError };

  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    saveSession(DEMO_USER);
    return { ok: true };
  }
  // Sai email hoặc mật khẩu: báo lỗi chung, không tiết lộ sai cái nào (BR-05).
  return { ok: false, error: 'Email hoặc mật khẩu không đúng' };
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  const errorEl = document.getElementById('login-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const result = attemptLogin(email, password);
    if (result.ok) {
      window.location.href = 'dashboard.html';
    } else {
      errorEl.textContent = result.error;
    }
  });
});
