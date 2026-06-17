// dashboard.js — Bảo vệ trang + quản lý công việc (thêm/đánh dấu/xóa).

document.addEventListener('DOMContentLoaded', () => {
  // Bảo vệ trang: chưa đăng nhập thì quay về trang đăng nhập (BR-06).
  const session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  // Hiển thị tên người dùng đang đăng nhập.
  document.getElementById('user-name').textContent = session.name;

  // Đăng xuất: xóa phiên và quay về trang đăng nhập (BR-07).
  document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    window.location.href = 'index.html';
  });

  const listEl = document.getElementById('task-list');
  const addForm = document.getElementById('add-task-form');
  const addInput = document.getElementById('task-title');
  const addError = document.getElementById('add-error');
  const summaryEl = document.getElementById('task-summary');

  // Vẽ lại danh sách công việc + dòng tổng kết.
  function render() {
    const tasks = getTasks();
    listEl.innerHTML = '';

    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' completed' : '');
      li.dataset.taskId = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.setAttribute('aria-label', `Đánh dấu hoàn thành: ${task.title}`);
      checkbox.addEventListener('change', () => toggleTask(task.id));

      const span = document.createElement('span');
      span.className = 'task-title';
      span.textContent = task.title;

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'delete-btn';
      delBtn.textContent = 'Xóa';
      delBtn.setAttribute('aria-label', `Xóa công việc: ${task.title}`);
      delBtn.addEventListener('click', () => deleteTask(task.id));

      li.append(checkbox, span, delBtn);
      listEl.appendChild(li);
    });

    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    summaryEl.textContent = `Tổng: ${total} công việc, ${done} hoàn thành`;
  }

  function addTask(title) {
    const tasks = getTasks();
    const newId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    tasks.push({ id: newId, title, done: false });
    saveTasks(tasks);
    render();
  }

  function toggleTask(id) {
    const tasks = getTasks().map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    saveTasks(tasks);
    render();
  }

  function deleteTask(id) {
    const tasks = getTasks().filter((t) => t.id !== id);
    saveTasks(tasks);
    render();
  }

  // Thêm công việc: tên rỗng thì báo lỗi, không thêm (BR-08).
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addError.textContent = '';

    const title = addInput.value.trim();
    if (!title) {
      addError.textContent = 'Tên công việc là bắt buộc';
      return;
    }
    addTask(title);
    addInput.value = '';
  });

  render();
});
