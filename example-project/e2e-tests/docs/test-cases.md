# Test Cases — Task Manager Demo

> Nguồn: [feature-map.md](./feature-map.md) (đối chiếu `SRS.md` REQ-001→013, `business-rules.md` BR-01→10).
> App là web tĩnh client-side: phiên ở `localStorage` (`tm_session`), công việc ở `sessionStorage` (`tm_tasks`).
> Tài khoản demo: `tester@example.com` / `Test@1234` / tên `Nguyễn Văn Tester`.
>
> **Route:** trang Đăng nhập `/`; Dashboard live ở **`/dashboard`** (clean URL, rewrite từ `dashboard.html`
> — đã verify trên Staging). Xác nhận "đã vào Dashboard" bằng **heading "Công việc của tôi"**, không khớp URL `.html`.
>
> **Precondition chung cho nhóm C–H (Dashboard):** mọi case thao tác Dashboard yêu cầu **đã đăng nhập**
> (đi qua màn hình Đăng nhập với tài khoản demo, hoặc seed phiên hợp lệ). Trạng thái khởi đầu mặc định:
> 2 task seed, tổng kết "Tổng: 2 công việc, 0 hoàn thành".

## Quy ước

- **Loại:** Positive | Negative | Boundary | Permission | Error-handling.
- **Priority (theo rủi ro nghiệp vụ):**
  - **P1 (critical):** Cốt lõi — đăng nhập đúng/sai, bảo vệ truy cập, xác thực. Hỏng = chặn nghiệp vụ hoặc rủi ro an ninh.
  - **P2 (major):** CRUD công việc, validate input, đăng xuất, tổng kết.
  - **P3 (minor):** Edge UX, boundary hiển thị, hành vi storage hiếm gặp.
- Mọi thông báo đối chiếu **chính xác chuỗi** theo `business-rules.md`.
- `[BUG?]` = hành vi nghi ngờ; nếu lệch kỳ vọng → ghi `docs/bugs.md`, **không** sửa test cho xanh.

---

## A. Đăng nhập — màn hình `/` (REQ-001→005, BR-01→05)

| ID | Tính năng | Tiêu đề | Loại | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-LOGIN-01 | Đăng nhập | should đăng nhập thành công when email & mật khẩu đúng | Positive | Chưa đăng nhập, ở `/` | 1. Nhập email `tester@example.com`<br>2. Nhập mật khẩu `Test@1234`<br>3. Bấm "Đăng nhập" | Chuyển sang `dashboard.html`; header hiện "Xin chào, Nguyễn Văn Tester"; `localStorage.tm_session` được tạo | P1 |
| TC-LOGIN-02 | Đăng nhập | should báo lỗi when email rỗng | Negative | Ở `/` | 1. Để trống email<br>2. Nhập mật khẩu bất kỳ<br>3. Bấm "Đăng nhập" | Ở lại `/`; `#login-error` = "Email là bắt buộc"; không tạo phiên | P1 |
| TC-LOGIN-03 | Đăng nhập | should báo lỗi when email chỉ gồm khoảng trắng | Negative | Ở `/` | 1. Nhập email `"   "`<br>2. Nhập mật khẩu `Test@1234`<br>3. Bấm "Đăng nhập" | "Email là bắt buộc" (do `.trim()` → rỗng); không đăng nhập | P2 |
| TC-LOGIN-04 | Đăng nhập | should báo lỗi when email sai định dạng (thiếu @) | Negative | Ở `/` | 1. Nhập `testerexample.com`<br>2. Nhập `Test@1234`<br>3. Bấm "Đăng nhập" | "Email không hợp lệ"; không đăng nhập | P1 |
| TC-LOGIN-05 | Đăng nhập | should báo lỗi when email thiếu phần tên miền | Negative | Ở `/` | 1. Nhập `tester@`<br>2. Nhập `Test@1234`<br>3. Bấm "Đăng nhập" | "Email không hợp lệ" | P2 |
| TC-LOGIN-06 | Đăng nhập | should báo lỗi when email thiếu phần mở rộng (no dot) | Negative | Ở `/` | 1. Nhập `tester@example`<br>2. Nhập `Test@1234`<br>3. Bấm "Đăng nhập" | "Email không hợp lệ" | P2 |
| TC-LOGIN-07 | Đăng nhập | should báo lỗi mật khẩu when email hợp lệ nhưng mật khẩu rỗng | Negative | Ở `/` | 1. Nhập `tester@example.com`<br>2. Để trống mật khẩu<br>3. Bấm "Đăng nhập" | "Mật khẩu là bắt buộc"; không đăng nhập | P1 |
| TC-LOGIN-08 | Đăng nhập | should báo lỗi chung when sai mật khẩu | Negative | Ở `/` | 1. Nhập `tester@example.com`<br>2. Nhập `WrongPass`<br>3. Bấm "Đăng nhập" | "Email hoặc mật khẩu không đúng" (không lộ sai phần nào); không đăng nhập | P1 |
| TC-LOGIN-09 | Đăng nhập | should báo lỗi chung when email đúng định dạng nhưng không tồn tại | Negative | Ở `/` | 1. Nhập `nobody@example.com`<br>2. Nhập `Test@1234`<br>3. Bấm "Đăng nhập" | "Email hoặc mật khẩu không đúng"; không đăng nhập | P1 |
| TC-LOGIN-10 | Đăng nhập | should ưu tiên lỗi email when cả email lẫn mật khẩu đều rỗng | Boundary | Ở `/` | 1. Để trống cả hai<br>2. Bấm "Đăng nhập" | Chỉ hiện "Email là bắt buộc" (dừng ở lỗi đầu, theo thứ tự BR-02→05) | P2 |
| TC-LOGIN-11 | Đăng nhập | should không tiết lộ sai email hay sai mật khẩu (privacy) | Permission | Ở `/` | 1. So sánh thông báo của TC-LOGIN-08 và TC-LOGIN-09 | Hai trường hợp cho **cùng** thông báo chung → không phân biệt được email có tồn tại hay không (BR-05) | P1 |
| TC-LOGIN-12 | Đăng nhập | should không đăng nhập when email khác hoa/thường | Negative | Ở `/` | 1. Nhập `Tester@Example.com`<br>2. Nhập `Test@1234`<br>3. Bấm "Đăng nhập" | `[BUG?]` So khớp dùng `===` phân biệt hoa/thường → "Email hoặc mật khẩu không đúng". Xác nhận với tester kỳ vọng | P2 |
| TC-LOGIN-13 | Đăng nhập | should không khớp when mật khẩu có khoảng trắng đầu/cuối | Boundary | Ở `/` | 1. Nhập `tester@example.com`<br>2. Nhập `" Test@1234 "`<br>3. Bấm "Đăng nhập" | `[BUG?]` Mật khẩu **không** được trim → không khớp → "Email hoặc mật khẩu không đúng". Xác nhận chủ ý | P2 |
| TC-LOGIN-14 | Đăng nhập | should xóa thông báo lỗi cũ when submit lại | Error-handling | Vừa submit lỗi (vd TC-LOGIN-02) | 1. Sửa input thành hợp lệ<br>2. Bấm "Đăng nhập" lần nữa | `#login-error` được reset rỗng trước khi xử lý; không tồn đọng lỗi cũ | P3 |
| TC-LOGIN-15 | Đăng nhập | should chấp nhận email biên tối thiểu hợp lệ | Boundary | Ở `/` | 1. Nhập `a@b.c`<br>2. Nhập `Test@1234`<br>3. Bấm "Đăng nhập" | Qua được validate định dạng (regex chấp nhận) nhưng sai tài khoản → "Email hoặc mật khẩu không đúng" (không phải lỗi định dạng) | P3 |
| TC-LOGIN-16 | Đăng nhập | should xử lý email cực dài / ký tự đặc biệt mà không crash | Boundary | Ở `/` | 1. Nhập email >256 ký tự hoặc chứa `+tag`, unicode<br>2. Nhập `Test@1234`<br>3. Bấm "Đăng nhập" | Không crash; trả lỗi phù hợp (định dạng hoặc sai tài khoản); không có giới hạn độ dài nên không lỗi độ dài | P3 |

---

## B. Bảo vệ truy cập & Phân quyền (REQ-006, BR-06)

| ID | Tính năng | Tiêu đề | Loại | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-AUTH-01 | Bảo vệ truy cập | should redirect về login when truy cập dashboard chưa đăng nhập | Permission | `localStorage` không có `tm_session` | 1. Truy cập trực tiếp `/dashboard` | Tự chuyển về `index.html`; không hiển thị dữ liệu công việc | P1 |
| TC-AUTH-02 | Bảo vệ truy cập | should chặn dashboard when phiên đã bị xóa (hết phiên) | Permission | Đã đăng nhập, sau đó xóa `tm_session` | 1. Xóa `localStorage.tm_session`<br>2. Reload `/dashboard` | Redirect về `index.html` | P1 |
| TC-AUTH-03 | Bảo vệ truy cập | should chặn dashboard via nút Back sau khi đăng xuất | Permission | Đã đăng nhập rồi đăng xuất | 1. Sau đăng xuất, bấm Back của trình duyệt về dashboard | Guard chạy lại, không có phiên → redirect `index.html`; không lộ dữ liệu cũ (bfcache) | P1 |
| TC-AUTH-04 | Bảo vệ truy cập | should hiển thị đúng tên user của phiên hiện tại | Permission | Đã đăng nhập | 1. Vào dashboard | `#user-name` = "Nguyễn Văn Tester" (đúng `session.name`) | P2 |
| TC-AUTH-05 | Bảo vệ truy cập | should vào được dashboard when set tay tm_session (lỗ hổng client-guard) | Permission | Chưa đăng nhập | 1. Set `localStorage.tm_session = '{"email":"x","name":"Hacker"}'`<br>2. Vào `/dashboard` | `[BUG?/RISK]` Vào được dashboard không cần mật khẩu (guard chỉ client-side). Ghi nhận rủi ro an ninh — không phải bảo vệ thật | P1 |

---

## C. Xem danh sách & Tổng kết (REQ-007, BR-09, BR-10)

| ID | Tính năng | Tiêu đề | Loại | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-LIST-01 | Xem công việc | should hiển thị 2 task seed when phiên mới | Positive | Đăng nhập, `sessionStorage.tm_tasks` rỗng | 1. Vào dashboard | Danh sách có "Chuẩn bị báo cáo tuần" và "Gửi email cho khách hàng", cả hai chưa hoàn thành | P2 |
| TC-LIST-02 | Tổng kết | should hiển thị dòng tổng kết đúng when khởi tạo | Positive | Như trên | 1. Quan sát `#task-summary` | "Tổng: 2 công việc, 0 hoàn thành" | P2 |
| TC-LIST-03 | Tổng kết | should hiển thị "Tổng: 0 công việc, 0 hoàn thành" when xóa hết | Boundary | Đăng nhập, dashboard | 1. Xóa lần lượt tất cả task | Danh sách rỗng; tổng kết "Tổng: 0 công việc, 0 hoàn thành" | P3 |

---

## D. Thêm công việc (REQ-008, REQ-009, BR-08)

| ID | Tính năng | Tiêu đề | Loại | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-ADD-01 | Thêm công việc | should thêm task when nhập tên hợp lệ | Positive | Đăng nhập, dashboard | 1. Nhập "Mua cà phê"<br>2. Bấm "Thêm" | Task xuất hiện cuối danh sách (chưa hoàn thành); ô nhập trống; tổng kết "Tổng: 3 công việc, 0 hoàn thành" | P2 |
| TC-ADD-02 | Thêm công việc | should báo lỗi when tên công việc rỗng | Negative | Dashboard | 1. Để trống ô tên<br>2. Bấm "Thêm" | `#add-error` = "Tên công việc là bắt buộc"; không thêm task | P2 |
| TC-ADD-03 | Thêm công việc | should báo lỗi when tên chỉ gồm khoảng trắng | Negative | Dashboard | 1. Nhập `"   "`<br>2. Bấm "Thêm" | "Tên công việc là bắt buộc" (do `.trim()`); không thêm | P2 |
| TC-ADD-04 | Thêm công việc | should trim khoảng trắng đầu/cuối when thêm | Boundary | Dashboard | 1. Nhập `"  Họp nhóm  "`<br>2. Bấm "Thêm" | Task được thêm với tiêu đề đã trim "Họp nhóm" | P3 |
| TC-ADD-05 | Thêm công việc | should xử lý tên chứa ký tự đặc biệt / HTML mà không bị XSS | Boundary | Dashboard | 1. Nhập `<img src=x onerror=alert(1)>`<br>2. Bấm "Thêm" | Hiển thị nguyên văn chuỗi (dùng `textContent`); không thực thi script | P1 |
| TC-ADD-06 | Thêm công việc | should xử lý tên cực dài (vượt giới hạn hiển thị) | Boundary | Dashboard | 1. Nhập chuỗi ~1000 ký tự<br>2. Bấm "Thêm" | `[BUG?]` Không có giới hạn độ dài → task vẫn thêm; kiểm layout không vỡ nghiêm trọng. Ghi nhận nếu UX hỏng | P3 |
| TC-ADD-07 | Thêm công việc | should cho phép thêm 2 task trùng tên | Boundary | Dashboard | 1. Thêm "Việc A"<br>2. Thêm "Việc A" lần nữa | Cả hai task tồn tại độc lập (không chặn trùng tên) | P3 |
| TC-ADD-08 | Thêm công việc | should reset thông báo lỗi when thêm thành công sau lỗi | Error-handling | Vừa lỗi TC-ADD-02 | 1. Nhập tên hợp lệ<br>2. Bấm "Thêm" | `#add-error` được xóa rỗng; task được thêm | P3 |

---

## E. Đánh dấu hoàn thành / Bỏ đánh dấu (REQ-010, REQ-011)

| ID | Tính năng | Tiêu đề | Loại | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-TOGGLE-01 | Đánh dấu | should đánh dấu hoàn thành when tick checkbox | Positive | Dashboard, có task chưa xong | 1. Tick checkbox của task | Task hiển thị trạng thái hoàn thành (gạch ngang, class `completed`); tổng kết tăng số hoàn thành | P2 |
| TC-TOGGLE-02 | Bỏ đánh dấu | should bỏ hoàn thành when bỏ tick | Positive | Dashboard, có task đã xong | 1. Bỏ tick checkbox | Task về trạng thái chưa hoàn thành; tổng kết giảm số hoàn thành | P2 |
| TC-TOGGLE-03 | Đánh dấu | should cập nhật tổng kết đúng when tất cả task hoàn thành | Boundary | Dashboard, 2 task seed | 1. Tick cả 2 task | "Tổng: 2 công việc, 2 hoàn thành" | P3 |

---

## F. Xóa công việc (REQ-012)

| ID | Tính năng | Tiêu đề | Loại | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-DEL-01 | Xóa công việc | should xóa task when bấm "Xóa" | Positive | Dashboard, có task | 1. Bấm "Xóa" trên một task | Task biến mất khỏi danh sách; tổng kết cập nhật giảm | P2 |
| TC-DEL-02 | Xóa công việc | should xóa ngay không cần xác nhận | Error-handling | Dashboard, có task | 1. Bấm "Xóa" | `[UX]` Xóa lập tức, không hộp xác nhận, không undo. Ghi nhận rủi ro mất dữ liệu | P3 |
| TC-DEL-03 | Xóa công việc | should cập nhật danh sách đúng when xóa task ở giữa | Boundary | Dashboard, ≥3 task | 1. Xóa task ở giữa danh sách | Chỉ task đó mất; các task còn lại giữ nguyên thứ tự & trạng thái | P3 |

---

## G. Đăng xuất (REQ-013, BR-07)

| ID | Tính năng | Tiêu đề | Loại | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-LOGOUT-01 | Đăng xuất | should kết thúc phiên & về login when bấm "Đăng xuất" | Positive | Đã đăng nhập, ở dashboard | 1. Bấm "Đăng xuất" | Redirect `index.html`; `localStorage.tm_session` bị xóa | P1 |
| TC-LOGOUT-02 | Đăng xuất | should chặn dashboard sau khi đăng xuất | Permission | Vừa đăng xuất | 1. Truy cập lại `/dashboard` | Redirect `index.html` (áp dụng lại REQ-006) | P1 |

---

## H. Edge case / Trạng thái bất thường (mục 4 & 5 feature-map)

| ID | Tính năng | Tiêu đề | Loại | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-EDGE-01 | Storage hỏng | should không crash when tm_tasks chứa JSON hỏng | Error-handling | Đã đăng nhập | 1. Set `sessionStorage.tm_tasks = '{broken'`<br>2. Vào dashboard | `[BUG?]` `JSON.parse` không try/catch → có thể throw làm trang crash. Ghi `bugs.md` xác nhận hành vi | P2 |
| TC-EDGE-02 | Storage hỏng | should xử lý an toàn when tm_session là JSON hỏng | Error-handling | Chưa rõ phiên | 1. Set `localStorage.tm_session = 'xxx'`<br>2. Vào dashboard | `[BUG?]` `JSON.parse` ném lỗi trong `getSession()` → có thể crash thay vì redirect. Ghi nhận | P2 |
| TC-EDGE-03 | Vòng đời storage | should task reset về seed when mở tab mới (session còn) | Error-handling | Đã đăng nhập ở tab A, đã sửa danh sách | 1. Mở tab mới cùng domain<br>2. Vào dashboard | Phiên còn (localStorage) nhưng task về 2 seed (sessionStorage mới rỗng). Ghi nhận khác biệt vòng đời | P3 |
| TC-EDGE-04 | Sinh ID | should không lỗi when ID task có thể trùng sau xóa+thêm | Error-handling | Dashboard | 1. Xóa task id lớn nhất<br>2. Thêm task mới | Task mới thêm được; lưu ý ID có thể trùng id cũ (Math.max+1). Không gây lỗi chức năng | P3 |
| TC-EDGE-05 | Seed dữ liệu | should seed lại 2 task when sessionStorage bị clear giữa phiên | Positive | Đã đăng nhập | 1. Clear `sessionStorage.tm_tasks`<br>2. Reload dashboard | Hiển thị lại 2 task seed mặc định (BR-09) | P3 |

---

## Ma trận phủ (Coverage)

| Loại | Số TC | Ghi chú |
|---|---|---|
| Positive (happy path) | TC-LOGIN-01, LIST-01/02, ADD-01, TOGGLE-01/02, DEL-01, LOGOUT-01, EDGE-05 | Phủ mọi luồng chính A–G |
| Negative | TC-LOGIN-02→09/12/13, ADD-02/03 | Sai định dạng, bỏ trống bắt buộc, sai thông tin |
| Boundary | TC-LOGIN-10/15/16, LIST-03, ADD-04/05/06/07, TOGGLE-03, DEL-03 | Min/max, ký tự đặc biệt, rỗng/giới hạn |
| Permission | TC-LOGIN-11, AUTH-01→05, LOGOUT-02 | Truy cập trái phép, hết phiên, client-guard |
| Error-handling | TC-LOGIN-14, ADD-08, DEL-02, EDGE-01→04 | Reset lỗi, storage hỏng, no-confirm |

**Phân bố Priority:** P1 = đăng nhập đúng/sai, privacy, bảo vệ truy cập, đăng xuất, XSS. P2 = CRUD, validate, tổng kết, storage hỏng. P3 = boundary hiển thị, UX, vòng đời storage hiếm.

> Các TC gắn `[BUG?]`/`[RISK]` (LOGIN-12/13, AUTH-05, ADD-06, EDGE-01/02): nếu kết quả thực tế lệch kỳ vọng nghiệp vụ → ghi `docs/bugs.md` cho tester xác nhận, **không** sửa test cho xanh (theo `CLAUDE.md`).
</content>
