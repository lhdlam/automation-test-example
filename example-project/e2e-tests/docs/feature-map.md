# Feature Map — Task Manager Demo

> Tài liệu phân tích (chỉ đọc code, **không** chạy/build app) cho `example-project/`.
> Mục đích: làm đầu vào để sinh test case / kịch bản kiểm thử.
>
> Nguồn phân tích: `src/index.html`, `src/dashboard.html`, `src/js/auth.js`,
> `src/js/data.js`, `src/js/dashboard.js`, `src/css/styles.css`, đối chiếu với
> `docs/SRS.md` (REQ-001 → REQ-013) và `docs/business-rules.md` (BR-01 → BR-10).
>
> **Bản chất app:** Web tĩnh thuần (HTML/CSS/JS, không backend). Xác thực & dữ liệu
> đều giả lập phía client. "Phiên" lưu ở `localStorage`, "công việc" lưu ở
> `sessionStorage`. Đây là điểm cốt lõi chi phối toàn bộ hành vi bảo mật/trạng thái.

---

## 1. Danh sách màn hình / route

| Route | File | Tên màn hình | Mục đích |
|---|---|---|---|
| `/` (trang gốc) | `src/index.html` | **Đăng nhập** | Nhập email + mật khẩu, validate, xác thực với tài khoản demo, chuyển sang Dashboard khi thành công. |
| `/dashboard.html` *(live: `/dashboard`)* | `src/dashboard.html` | **Công việc của tôi** (Dashboard) | Trang nội bộ (cần đăng nhập). Xem/thêm/đánh dấu/xóa công việc; hiển thị tên user; đăng xuất. |

Ghi chú điều hướng:
- Đăng nhập thành công → `auth.js` chạy `window.location.href = 'dashboard.html'` (đường dẫn tương đối).
- ⚠️ **Route thật trên Staging** (đã verify qua Playwright MCP): host phục vụ tĩnh (vd `serve`) dùng
  **clean URL** → sau đăng nhập, URL là **`/dashboard`** (rewrite từ `dashboard.html`). Truy cập
  `/dashboard.html` vẫn hoạt động (301 → `/dashboard`). ⇒ Assertion **KHÔNG** nên khớp URL theo đuôi
  `.html`; chờ heading "Công việc của tôi" để xác nhận đã vào Dashboard.
- Vào Dashboard khi chưa đăng nhập → `dashboard.js` redirect về `index.html` (`/`).
- Đăng xuất → xóa phiên rồi redirect về `index.html`.
- Không có route đăng ký / quên mật khẩu / 404 — **ngoài phạm vi** (xác nhận trong `SRS.md` §2).

> ✅ **Đã verify trên Staging (qua Playwright MCP):** đăng nhập hợp lệ vào Dashboard (header hiện
> "Nguyễn Văn Tester", 2 task seed, tổng kết "Tổng: 2 công việc, 0 hoàn thành"), đăng xuất về login,
> và redirect khi truy cập Dashboard lúc chưa đăng nhập. Mọi selector Dashboard khớp UI thật.

---

## 2. Thành phần tương tác & input theo từng màn hình

### 2.1. Màn hình Đăng nhập (`index.html` + `auth.js`)

**Form:** `#login-form` (có thuộc tính `novalidate` → tắt validation mặc định của trình duyệt, mọi kiểm tra do JS đảm nhiệm).

| Thành phần | Selector / id | Loại | Ghi chú |
|---|---|---|---|
| Ô Email | `#email` (`name=email`, `type=email`, `autocomplete=username`) | input | Giá trị được `.trim()` trước khi xử lý. |
| Ô Mật khẩu | `#password` (`type=password`, `autocomplete=current-password`) | input | **Không** trim mật khẩu. |
| Nút Đăng nhập | `button[type=submit].btn-primary` | submit | Kích hoạt handler `submit`, có `preventDefault()`. |
| Vùng báo lỗi | `#login-error.error` (`role=alert`) | output | Hiển thị 1 thông báo lỗi tại một thời điểm; reset rỗng mỗi lần submit. |
| Gợi ý tài khoản demo | `.hint` | text tĩnh | In sẵn `tester@example.com / Test@1234` trong trang. |

**Validation rules (đăng nhập)** — thực thi trong `validateLogin()` rồi `attemptLogin()`, theo đúng thứ tự, **dừng ở lỗi đầu tiên**:

| # | Điều kiện | Thông báo (đối chiếu chính xác) | Tham chiếu |
|---|---|---|---|
| 1 | Email rỗng (sau trim) | `Email là bắt buộc` | REQ-002 / BR-02 |
| 2 | Email sai định dạng — regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `Email không hợp lệ` | REQ-003 / BR-03 |
| 3 | Mật khẩu rỗng | `Mật khẩu là bắt buộc` | REQ-004 / BR-04 |
| 4 | Email/mật khẩu không khớp tài khoản demo | `Email hoặc mật khẩu không đúng` (lỗi chung, không nói rõ sai cái nào) | REQ-005 / BR-05 |
| — | Hợp lệ & khớp | (không lỗi) → lưu phiên, chuyển trang | REQ-001 / BR-01 |

Tài khoản hợp lệ (hardcode trong `data.js → DEMO_USER`): `tester@example.com` / `Test@1234`, tên hiển thị `Nguyễn Văn Tester`.

### 2.2. Màn hình Công việc / Dashboard (`dashboard.html` + `dashboard.js`)

**Header:**

| Thành phần | Selector / id | Loại | Ghi chú |
|---|---|---|---|
| Tên người dùng | `#user-name` | text | Đặt từ `session.name` qua `textContent` (an toàn XSS). |
| Nút Đăng xuất | `#logout-btn.btn-ghost` | button | `clearSession()` → redirect `index.html` (REQ-013 / BR-07). |

**Form thêm công việc:** `#add-task-form` (`novalidate`).

| Thành phần | Selector / id | Loại | Ghi chú |
|---|---|---|---|
| Ô Tên công việc | `#task-title` (`type=text`) | input | Giá trị được `.trim()` trước kiểm tra; sau khi thêm thành công thì làm trống ô. |
| Nút Thêm | `button[type=submit].btn-primary` | submit | `preventDefault()`. |
| Vùng báo lỗi thêm | `#add-error.error` (`role=alert`) | output | Reset rỗng mỗi lần submit. |

**Danh sách & tổng kết (render động):**

| Thành phần | Selector | Loại | Ghi chú |
|---|---|---|---|
| Dòng tổng kết | `#task-summary.summary` | text | `Tổng: {N} công việc, {M} hoàn thành` (BR-10). |
| Danh sách | `#task-list` (`aria-label="Danh sách công việc"`) | `<ul>` | Vẽ lại toàn bộ mỗi thao tác. |
| Mỗi item | `li.task-item[data-task-id]` | li | Thêm class `completed` khi xong (gạch ngang chữ). |
| Checkbox hoàn thành | `input[type=checkbox]` (aria-label `Đánh dấu hoàn thành: {title}`) | checkbox | `change` → `toggleTask(id)`. |
| Nhãn tên | `span.task-title` | text | Đặt qua `textContent` (an toàn XSS). |
| Nút Xóa | `button.delete-btn` (aria-label `Xóa công việc: {title}`) | button | `click` → `deleteTask(id)`, không có xác nhận. |

**Validation rules (thêm công việc):**

| Điều kiện | Hành vi | Tham chiếu |
|---|---|---|
| Tên rỗng hoặc chỉ khoảng trắng (sau `.trim()`) | Không thêm; hiện `Tên công việc là bắt buộc` | REQ-009 / BR-08 |
| Tên hợp lệ | Thêm task mới (`done=false`), render lại, làm trống ô nhập | REQ-008 |

---

## 3. Các user flow chính

**Flow A — Đăng nhập thành công (REQ-001):**
1. Mở `/` → nhập `tester@example.com` / `Test@1234` → bấm Đăng nhập.
2. `attemptLogin` khớp → `saveSession()` ghi `tm_session` vào `localStorage`.
3. Redirect `dashboard.html` → `dashboard.js` thấy session → hiển thị tên + danh sách.

**Flow B — Đăng nhập thất bại:**
- Mỗi điều kiện ở mục 2.1 → ở lại trang, hiện thông báo tương ứng, **không** tạo phiên.

**Flow C — Quản lý công việc (sau khi đã đăng nhập):**
- Xem: 2 task seed (`Chuẩn bị báo cáo tuần`, `Gửi email cho khách hàng`, đều chưa xong) + dòng tổng kết (REQ-007 / BR-09).
- Thêm (REQ-008): nhập tên → Thêm → xuất hiện cuối danh sách, ô nhập trống, tổng kết tăng.
- Đánh dấu / bỏ đánh dấu (REQ-010/011): tick checkbox → gạch ngang + cập nhật "{M} hoàn thành".
- Xóa (REQ-012): bấm Xóa → biến mất khỏi danh sách, tổng kết cập nhật.

**Flow D — Bảo vệ truy cập (REQ-006 / BR-06):**
- Vào thẳng `/dashboard.html` khi chưa có phiên → tự redirect `index.html`.

**Flow E — Đăng xuất (REQ-013 / BR-07):**
- Bấm Đăng xuất → `clearSession()` xóa `tm_session` → redirect `index.html`.
- Vào lại Dashboard → bị chặn (lặp lại Flow D).

> **Lưu ý:** Không có flow đăng ký → xác thực email → đăng nhập như trong đề bài gợi ý.
> App chỉ có **một tài khoản demo cố định**, không có chức năng đăng ký. Đây là khác biệt
> cần ghi nhận khi thiết kế test (đừng giả định luồng đăng ký).

---

## 4. Luồng xử lý lỗi & edge case phát hiện trong code

### Đã xử lý rõ ràng
- Validate đăng nhập theo thứ tự, dừng ở lỗi đầu (mục 2.1).
- Lỗi đăng nhập sai dùng thông báo chung (chống dò email tồn tại — BR-05).
- Email được `.trim()` → khoảng trắng đầu/cuối không gây sai định dạng.
- Tên công việc rỗng/toàn khoảng trắng bị chặn (BR-08).
- Render dùng `textContent` (không `innerHTML` cho dữ liệu người dùng) → tránh XSS khi hiển thị tên task / tên user.

### Edge case & rủi ro tiềm ẩn (đáng đưa vào test / ghi `bugs.md`)

1. **Mật khẩu không được trim.** Email trim nhưng password thì không (`auth.js:37-38`). Mật khẩu có khoảng trắng đầu/cuối sẽ không khớp → cần test chủ đích để xác nhận đây là chủ ý hay bug.

2. **Validate không kiểm tra độ dài / độ mạnh / độ dài tối đa.** Email cực dài hoặc password rỗng-sau-khoảng-trắng… chỉ chặn rỗng và sai định dạng email. Không có giới hạn ký tự cho tên công việc → có thể nhập chuỗi rất dài làm vỡ layout.

3. **`getTasks()` / `JSON.parse` không bọc try/catch** (`data.js:46`, `dashboard.js`). Nếu `sessionStorage`/`localStorage` chứa JSON hỏng (bị sửa tay, hoặc app khác ghi đè key `tm_tasks`/`tm_session`) → `JSON.parse` ném lỗi → trang Dashboard crash khi load. Edge case về dữ liệu storage bẩn không được phòng thủ.

4. **Sinh ID công việc bằng `Math.max(...ids)+1`.** Không phải UUID. Sau khi xóa task có id lớn nhất rồi thêm mới, ID có thể **trùng lại** id đã từng dùng. Với app demo thì ổn, nhưng test dựa trên ID cần lưu ý.

5. **Phiên không có hạn / không xác thực toàn vẹn.** `tm_session` chỉ là `{email, name}` JSON thô trong `localStorage`. Bất kỳ ai chạy 1 dòng JS (hoặc tự đặt localStorage) đều "đăng nhập" được mà không cần mật khẩu (xem mục 5). Không có expiry, không có token.

6. **Email chỉ validate bằng regex đơn giản** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Chấp nhận nhiều địa chỉ kỳ lạ (vd `a@b.c`) và từ chối một số email hợp lệ thực tế (vd có khoảng trắng trích dẫn). Khi so khớp tài khoản thì dùng `===` chính xác, **phân biệt hoa/thường** → `Tester@example.com` sẽ **không** đăng nhập được dù regex hợp lệ. Cần test case email đúng định dạng nhưng khác hoa/thường.

7. **Xóa công việc không có xác nhận.** Bấm "Xóa" là mất ngay, không undo. Edge case UX/an toàn dữ liệu.

8. **Khác biệt vòng đời storage giữa phiên và task.** Phiên ở `localStorage` (bền qua tab/đóng mở trình duyệt), task ở `sessionStorage` (mất khi đóng tab). → Có thể ở trạng thái "đã đăng nhập nhưng task bị seed lại" khi mở tab mới: vào Dashboard ở tab mới vẫn còn phiên (localStorage) nhưng task reset về 2 task seed (sessionStorage rỗng). Đây là điểm dễ gây nhầm lẫn khi viết test đa-tab/đa-context.

9. **Toggle/Delete theo id không tồn tại** (vd id đã bị xóa, gọi lặp): `filter`/`map` an toàn (không lỗi), thao tác trở thành no-op — chấp nhận được, nhưng test nên biết hành vi này.

10. **Không có trạng thái "đang tải"/disable nút khi submit.** Submit liên tục nhanh không gây hại ở app tĩnh, nhưng không có chống double-submit.

---

## 5. Điểm cần chú ý về phân quyền, bảo mật, trạng thái bất thường

> ⚠️ Đây là **app demo tĩnh** — mọi "bảo mật" chỉ là mô phỏng phía client. Các điểm dưới
> đây cần ghi nhận để (a) thiết kế test đúng kỳ vọng và (b) **không** nhầm tưởng app có
> bảo mật thật.

**Phân quyền / xác thực:**
- Chỉ một vai trò, một tài khoản (`DEMO_USER`). Không có phân quyền nhiều vai trò (xác nhận `SRS.md §2` — ngoài phạm vi).
- "Bảo vệ trang" hoàn toàn dựa vào kiểm tra `getSession()` phía client (`dashboard.js:5-9`). Đây là **client-side guard**, không phải bảo vệ thực: vô hiệu hóa JS hoặc đặt thủ công `localStorage.tm_session` là vào được Dashboard mà không cần mật khẩu. → Test bảo vệ truy cập nên kiểm "redirect khi không có phiên", **không** nên coi đây là kiểm soát an ninh thật.

**Bảo mật dữ liệu nhạy cảm:**
- Mật khẩu thật (`Test@1234`) **hardcode trong source** (`data.js`) và **in ra UI** (gợi ý ở trang đăng nhập). Chấp nhận với demo, nhưng tuyệt đối không phải mẫu cho app thật.
- Phiên lưu plaintext, không mã hóa, không HttpOnly cookie (vì là localStorage, JS đọc được) → dễ bị XSS-đánh-cắp nếu sau này có lỗ hổng inject. Hiện tại render dùng `textContent` nên chưa có vector XSS rõ ràng.
- So khớp đăng nhập chạy hoàn toàn client → ai xem source cũng biết credential. Không có rate-limit, không khóa tài khoản sau nhiều lần sai (BR/REQ không yêu cầu, nhưng cần ghi nhận).

**Trạng thái bất thường cần test:**
- Storage bị sửa tay / JSON hỏng → crash khi parse (xem edge case #3) — chưa phòng thủ.
- Phiên còn nhưng dữ liệu task reset giữa các tab (xem edge case #8).
- Đăng nhập phân biệt hoa/thường ở email (xem edge case #6).
- Truy cập trực tiếp `dashboard.html` qua URL khi chưa/đã hết phiên → phải redirect (REQ-006).
- Sau đăng xuất, dùng nút Back của trình duyệt quay lại Dashboard: trang load lại sẽ chạy guard `getSession()` (phiên đã xóa) → redirect về login. Nên test để xác nhận không lộ dữ liệu qua bfcache.

**Khuyến nghị cho việc viết test (đối chiếu `example-project/CLAUDE.md`):**
- Mọi `goto()` dùng đường dẫn tương đối (`/`, `/dashboard.html`), `baseURL` lấy từ `.env`.
- Không hardcode email/mật khẩu trong test → đọc từ `process.env`/fixtures.
- Với khác biệt storage `localStorage` (phiên) vs `sessionStorage` (task): cân nhắc dùng Playwright `storageState` cho phiên, và chủ động seed/clean `sessionStorage` để test độc lập.
- Khi gặp các edge case nghi là bug (mục 4: #1 trim mật khẩu, #3 JSON hỏng, #6 hoa/thường) → **không** sửa test cho xanh, ghi `docs/bugs.md` để tester xác nhận (theo quy ước dự án).

---

## Phụ lục — Ma trận đối chiếu REQ / BR ↔ vị trí code

| REQ / BR | Mô tả | Vị trí thực thi |
|---|---|---|
| REQ-001 / BR-01 | Đăng nhập thành công | `auth.js:19-22, 41-42`; `data.js:5-9, 22-27` |
| REQ-002 / BR-02 | Email bắt buộc | `auth.js:8` |
| REQ-003 / BR-03 | Định dạng email | `auth.js:4, 9` |
| REQ-004 / BR-04 | Mật khẩu bắt buộc | `auth.js:10` |
| REQ-005 / BR-05 | Sai thông tin (lỗi chung) | `auth.js:24` |
| REQ-006 / BR-06 | Chặn truy cập chưa đăng nhập | `dashboard.js:5-9` |
| REQ-007 / BR-09, BR-10 | Xem danh sách + tổng kết + seed | `dashboard.js:27-60`; `data.js:15-18, 40-47` |
| REQ-008 | Thêm công việc | `dashboard.js:62-68, 85-96` |
| REQ-009 / BR-08 | Tên công việc bắt buộc | `dashboard.js:89-93` |
| REQ-010 / REQ-011 | Đánh dấu / bỏ đánh dấu | `dashboard.js:70-76` |
| REQ-012 | Xóa công việc | `dashboard.js:78-82` |
| REQ-013 / BR-07 | Đăng xuất | `dashboard.js:14-18`; `data.js:34-36` |
</content>
</invoke>
