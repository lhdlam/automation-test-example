// data.js — Tầng dữ liệu giả lập của ứng dụng demo (không phải backend thật).
// Mục đích: cung cấp dữ liệu & helper lưu trữ ổn định để dễ kiểm thử tự động.

// Tài khoản demo dùng để đăng nhập (xem business-rules.md, BR-01).
const DEMO_USER = {
  email: 'tester@example.com',
  password: 'Test@1234',
  name: 'Nguyễn Văn Tester',
};

const SESSION_KEY = 'tm_session';
const TASKS_KEY = 'tm_tasks';

// Dữ liệu công việc mặc định, seed lại mỗi phiên để test có dữ liệu xác định.
const SEED_TASKS = [
  { id: 1, title: 'Chuẩn bị báo cáo tuần', done: false },
  { id: 2, title: 'Gửi email cho khách hàng', done: false },
];

// --- Phiên đăng nhập: lưu ở localStorage để giữ qua các trang ---
// (Dùng localStorage để Playwright storageState có thể tái sử dụng phiên.)
function saveSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email: user.email, name: user.name })
  );
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// --- Công việc: lưu ở sessionStorage, seed lại nếu rỗng ---
// (sessionStorage reset theo mỗi context trình duyệt → dữ liệu test sạch.)
function getTasks() {
  const raw = sessionStorage.getItem(TASKS_KEY);
  if (!raw) {
    sessionStorage.setItem(TASKS_KEY, JSON.stringify(SEED_TASKS));
    return SEED_TASKS.map((t) => ({ ...t }));
  }
  return JSON.parse(raw);
}

function saveTasks(tasks) {
  sessionStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}
