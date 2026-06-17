# Test Scenarios — Task Manager Demo

> Nguồn: [test-cases.md](./test-cases.md) · [feature-map.md](./feature-map.md).
> Gom các TC thành kịch bản end-to-end (hành trình người dùng liền mạch).
> App web tĩnh client-side: phiên ở `localStorage` (`tm_session`), công việc ở `sessionStorage` (`tm_tasks`).
>
> **Phân nhóm:**
> - **Smoke** — critical path, chạy nhanh để gác cổng build/deploy (P1 trọng tâm).
> - **Regression** — phủ đầy đủ chức năng & validate (P1–P2).
> - **Edge** — biên, trạng thái bất thường, rủi ro an ninh/dữ liệu (gồm `[BUG?]`).
>
> **Quy ước test data:** mô tả vai trò dữ liệu, **chưa** điền giá trị thật (lấy từ `.env`/fixtures
> theo `CLAUDE.md`). Mỗi kịch bản tự dọn dữ liệu của mình, không phá dữ liệu người khác trên Staging/UAT.
>
> **Route & cách xác nhận đã vào Dashboard:** Đăng nhập ở `/`; Dashboard live ở **`/dashboard`** (clean URL,
> rewrite từ `dashboard.html` — đã verify qua Playwright MCP). Mọi kịch bản nhóm post-login đi **qua màn hình
> Đăng nhập** rồi xác nhận vào Dashboard bằng **heading "Công việc của tôi"** (KHÔNG khớp URL theo đuôi `.html`).
>
> ✅ **Đã verify trên Staging:** SC-SMOKE-01 (đăng nhập → thấy tên user + 2 task seed + tổng kết → đăng xuất)
> và SC-SMOKE-02 (redirect khi chưa đăng nhập). Selector Login & Dashboard khớp UI thật.

---

## NHÓM SMOKE — Critical Path

### SC-SMOKE-01 — Hành trình cốt lõi: Đăng nhập → Quản lý công việc → Đăng xuất

**Mô tả hành trình:** Người dùng hợp lệ đăng nhập, xem danh sách công việc, thêm một việc mới, đánh dấu hoàn thành, xóa, rồi đăng xuất an toàn. Đây là vòng đời sử dụng đầy đủ nhất của app.

**Test data cần thiết:**
- Tài khoản hợp lệ (email + mật khẩu + tên hiển thị mong đợi).
- Một tên công việc mới hợp lệ (do test tự tạo, dọn sau khi xong).

**Trạng thái khởi đầu:** Chưa đăng nhập (`localStorage` không có `tm_session`); `sessionStorage.tm_tasks` rỗng (sẽ seed 2 task).

**Trình tự:**
1. Mở trang `/` → *(TC-LOGIN-01 tiền đề)*
2. Đăng nhập bằng tài khoản hợp lệ → **TC-LOGIN-01**
   - ✅ **Checkpoint A:** chuyển sang `dashboard.html`, header hiện đúng tên user, `tm_session` được tạo → **TC-AUTH-04**
3. Quan sát danh sách & tổng kết khởi tạo → **TC-LIST-01**, **TC-LIST-02**
   - ✅ **Checkpoint B:** thấy 2 task seed, tổng kết "Tổng: 2 công việc, 0 hoàn thành"
4. Thêm 1 công việc mới hợp lệ → **TC-ADD-01**
   - ✅ **Checkpoint C:** task xuất hiện, ô nhập trống, tổng kết "3 công việc, 0 hoàn thành"
5. Tick hoàn thành task vừa thêm → **TC-TOGGLE-01**
   - ✅ **Checkpoint D:** task gạch ngang, tổng kết "…, 1 hoàn thành"
6. Xóa task vừa thêm (dọn dữ liệu) → **TC-DEL-01**
   - ✅ **Checkpoint E:** task biến mất, tổng kết về "2 công việc, …"
7. Bấm "Đăng xuất" → **TC-LOGOUT-01**

**Trạng thái kết thúc mong đợi:** Quay về `index.html`; `tm_session` đã bị xóa; không còn dữ liệu do test tạo.

---

### SC-SMOKE-02 — Bảo vệ truy cập & chặn sau đăng xuất

**Mô tả hành trình:** Đảm bảo trang nội bộ không truy cập được khi chưa/đã hết phiên — rào chắn nghiệp vụ quan trọng nhất về quyền.

**Test data cần thiết:** Tài khoản hợp lệ (để tạo rồi kết thúc phiên).

**Trạng thái khởi đầu:** Chưa đăng nhập.

**Trình tự:**
1. Truy cập thẳng `/dashboard` khi chưa đăng nhập → **TC-AUTH-01**
   - ✅ **Checkpoint A:** bị redirect về `index.html`, không lộ dữ liệu
2. Đăng nhập hợp lệ → **TC-LOGIN-01**
3. Đăng xuất → **TC-LOGOUT-01**
4. Truy cập lại `/dashboard` → **TC-LOGOUT-02** / **TC-AUTH-02**
   - ✅ **Checkpoint B:** redirect về `index.html`
5. Bấm Back của trình duyệt về dashboard → **TC-AUTH-03**
   - ✅ **Checkpoint C:** guard chạy lại, redirect login, không lộ dữ liệu qua bfcache

**Trạng thái kết thúc mong đợi:** Ở `index.html`, không có phiên hợp lệ; mọi nỗ lực vào dashboard đều bị chặn.

---

## NHÓM REGRESSION — Phủ đầy đủ

### SC-REG-01 — Ma trận validate đăng nhập (thứ tự ưu tiên lỗi)

**Mô tả hành trình:** Người dùng thử các tổ hợp input sai để kiểm tra toàn bộ luật validate đăng nhập và đúng thứ tự dừng-ở-lỗi-đầu.

**Test data cần thiết:**
- Email: rỗng / chỉ khoảng trắng / sai định dạng (thiếu @, thiếu domain, thiếu dot) / đúng định dạng nhưng không tồn tại / biên `a@b.c`.
- Mật khẩu: rỗng / sai / đúng.

**Trạng thái khởi đầu:** Chưa đăng nhập, ở `/`.

**Trình tự (mỗi bước reset input):**
1. Bỏ trống cả hai → **TC-LOGIN-10** → ✅ chỉ "Email là bắt buộc" (ưu tiên lỗi đầu)
2. Email rỗng, có mật khẩu → **TC-LOGIN-02**
3. Email toàn khoảng trắng → **TC-LOGIN-03**
4. Email thiếu @ → **TC-LOGIN-04**; thiếu domain → **TC-LOGIN-05**; thiếu dot → **TC-LOGIN-06**
5. Email hợp lệ, mật khẩu rỗng → **TC-LOGIN-07**
6. Email biên `a@b.c`, mật khẩu bất kỳ → **TC-LOGIN-15** → ✅ qua validate định dạng, dừng ở "sai tài khoản"
7. Submit lỗi rồi sửa hợp lệ submit lại → **TC-LOGIN-14** → ✅ lỗi cũ được reset
   - ✅ **Checkpoint:** mỗi tổ hợp cho đúng 1 thông báo theo `business-rules.md`; không trường hợp nào tạo phiên

**Trạng thái kết thúc mong đợi:** Vẫn ở `/`, chưa đăng nhập, vùng lỗi phản ánh đúng input cuối.

---

### SC-REG-02 — Privacy: không tiết lộ thông tin đăng nhập sai

**Mô tả hành trình:** Kiểm tra app không cho biết email có tồn tại hay không (chống dò tài khoản).

**Test data cần thiết:** Email tồn tại + mật khẩu sai; email không tồn tại đúng định dạng + mật khẩu bất kỳ.

**Trạng thái khởi đầu:** Chưa đăng nhập, ở `/`.

**Trình tự:**
1. Email đúng, mật khẩu sai → **TC-LOGIN-08** → ghi nhận thông báo
2. Email không tồn tại, mật khẩu bất kỳ → **TC-LOGIN-09** → ghi nhận thông báo
3. So sánh hai thông báo → **TC-LOGIN-11**
   - ✅ **Checkpoint:** hai thông báo **giống hệt** ("Email hoặc mật khẩu không đúng"); không phân biệt được email tồn tại

**Trạng thái kết thúc mong đợi:** Chưa đăng nhập; không rò rỉ thông tin tài khoản.

---

### SC-REG-03 — CRUD công việc đầy đủ & tính nhất quán tổng kết

**Mô tả hành trình:** Người dùng đã đăng nhập thực hiện toàn bộ thao tác công việc và kiểm tra dòng tổng kết luôn đồng bộ.

**Test data cần thiết:** Nhiều tên công việc hợp lệ (≥3); một tên rỗng và một tên toàn khoảng trắng (để test validate); tên có khoảng trắng đầu/cuối.

**Trạng thái khởi đầu:** Đã đăng nhập (qua storageState), dashboard với 2 task seed.

**Trình tự:**
1. Xác nhận seed & tổng kết → **TC-LIST-01**, **TC-LIST-02**
2. Thêm task hợp lệ → **TC-ADD-01**; thêm tên có khoảng trắng đầu/cuối → **TC-ADD-04** (kiểm trim)
3. Thử thêm tên rỗng → **TC-ADD-02**; tên toàn khoảng trắng → **TC-ADD-03**
   - ✅ **Checkpoint A:** hai lần lỗi "Tên công việc là bắt buộc", không thêm; số lượng task không đổi
4. Thêm task hợp lệ sau lỗi → **TC-ADD-08** → ✅ lỗi reset, task được thêm
5. Tick hoàn thành → **TC-TOGGLE-01**; bỏ tick → **TC-TOGGLE-02**
6. Xóa 1 task ở giữa → **TC-DEL-03**
   - ✅ **Checkpoint B:** sau mỗi thao tác, `#task-summary` khớp đúng số total/done thực tế
7. Dọn: xóa hết task do test tạo

**Trạng thái kết thúc mong đợi:** Danh sách trở về trạng thái sạch (chỉ còn seed hoặc rỗng tùy chiến lược dọn); tổng kết nhất quán.

---

### SC-REG-04 — Toàn-bộ-hoàn-thành và danh-sách-rỗng (biên tổng kết)

**Mô tả hành trình:** Đẩy danh sách tới hai cực: tất cả hoàn thành và rỗng hoàn toàn, kiểm tra dòng tổng kết.

**Test data cần thiết:** Trạng thái 2 task seed.

**Trạng thái khởi đầu:** Đã đăng nhập, dashboard với 2 task seed chưa xong.

**Trình tự:**
1. Tick cả 2 task → **TC-TOGGLE-03** → ✅ **Checkpoint A:** "Tổng: 2 công việc, 2 hoàn thành"
2. Xóa lần lượt toàn bộ task → **TC-DEL-01**, **TC-LIST-03**
   - ✅ **Checkpoint B:** danh sách rỗng, "Tổng: 0 công việc, 0 hoàn thành"

**Trạng thái kết thúc mong đợi:** Danh sách rỗng, tổng kết về 0/0.

---

## NHÓM EDGE — Biên, bất thường, rủi ro

### SC-EDGE-01 — Rủi ro an ninh & xác thực client-side

**Mô tả hành trình:** Khai thác bản chất client-guard để chứng minh các rủi ro: vào dashboard không cần mật khẩu, phân biệt hoa/thường, mật khẩu không trim. Các điểm `[BUG?]/[RISK]` cần ghi `docs/bugs.md`.

**Test data cần thiết:** `tm_session` giả mạo (JSON `{email,name}` bất kỳ); email đúng nhưng khác hoa/thường; mật khẩu đúng nhưng có khoảng trắng bao quanh.

**Trạng thái khởi đầu:** Chưa đăng nhập.

**Trình tự:**
1. Set tay `localStorage.tm_session` giả → vào `/dashboard` → **TC-AUTH-05**
   - ✅ **Checkpoint A:** `[RISK]` vào được dashboard không cần mật khẩu → ghi `bugs.md`
2. Quay lại `/`, đăng nhập email khác hoa/thường → **TC-LOGIN-12**
   - ✅ **Checkpoint B:** `[BUG?]` bị từ chối dù regex hợp lệ → ghi nhận
3. Đăng nhập mật khẩu đúng nhưng có khoảng trắng bao quanh → **TC-LOGIN-13**
   - ✅ **Checkpoint C:** `[BUG?]` không khớp (password không trim) → ghi nhận

**Trạng thái kết thúc mong đợi:** Các sai lệch so với kỳ vọng nghiệp vụ được ghi vào `docs/bugs.md`; **không** sửa test cho xanh.

---

### SC-EDGE-02 — Storage hỏng & sức bền khi load

**Mô tả hành trình:** Bơm dữ liệu storage bẩn/hỏng để kiểm tra app có phòng thủ khi `JSON.parse` thất bại không.

**Test data cần thiết:** Chuỗi JSON hỏng cho `tm_tasks`; chuỗi JSON hỏng cho `tm_session`.

**Trạng thái khởi đầu:** Trình duyệt sạch.

**Trình tự:**
1. Đặt `sessionStorage.tm_tasks` = JSON hỏng, đã có phiên hợp lệ → vào dashboard → **TC-EDGE-01**
   - ✅ **Checkpoint A:** `[BUG?]` kỳ vọng không crash; nếu trang lỗi → ghi `bugs.md`
2. Đặt `localStorage.tm_session` = JSON hỏng → vào dashboard → **TC-EDGE-02**
   - ✅ **Checkpoint B:** `[BUG?]` kỳ vọng redirect an toàn thay vì crash → ghi nhận

**Trạng thái kết thúc mong đợi:** Ghi nhận hành vi thực tế (crash hay redirect) vào `docs/bugs.md`.

---

### SC-EDGE-03 — Vòng đời storage & seed lại dữ liệu

**Mô tả hành trình:** Kiểm tra khác biệt vòng đời giữa phiên (localStorage, bền) và công việc (sessionStorage, theo tab) và cơ chế seed lại.

**Test data cần thiết:** Phiên hợp lệ; trạng thái danh sách đã thay đổi ở tab gốc.

**Trạng thái khởi đầu:** Đã đăng nhập ở tab A, đã sửa danh sách (thêm/xóa).

**Trình tự:**
1. Mở tab mới cùng domain, vào dashboard → **TC-EDGE-03**
   - ✅ **Checkpoint A:** phiên còn (vào được), nhưng task về 2 seed (sessionStorage tab mới rỗng)
2. Clear `sessionStorage.tm_tasks` rồi reload → **TC-EDGE-05**
   - ✅ **Checkpoint B:** hiển thị lại 2 task seed mặc định (BR-09)

**Trạng thái kết thúc mong đợi:** Hành vi seed-lại được xác nhận; ghi nhận khác biệt vòng đời nếu gây nhầm lẫn.

---

### SC-EDGE-04 — Đầu vào biên & an toàn hiển thị

**Mô tả hành trình:** Nhập các giá trị biên/đặc biệt vào form (đăng nhập & thêm task) để kiểm tra không crash và không XSS.

**Test data cần thiết:** Email cực dài / có `+tag` / unicode; tên task chuỗi HTML `<img onerror>`; tên task ~1000 ký tự; hai tên task trùng nhau.

**Trạng thái khởi đầu:** Một phần ở `/`, phần sau đã đăng nhập ở dashboard.

**Trình tự:**
1. Đăng nhập với email cực dài / ký tự đặc biệt → **TC-LOGIN-16** → ✅ không crash, trả lỗi phù hợp
2. (Đăng nhập hợp lệ) Thêm task tên chứa HTML/script → **TC-ADD-05**
   - ✅ **Checkpoint A:** hiển thị nguyên văn (textContent), **không** thực thi script
3. Thêm task tên ~1000 ký tự → **TC-ADD-06** → ✅ thêm được; `[BUG?]` kiểm layout không vỡ nghiêm trọng
4. Thêm 2 task trùng tên → **TC-ADD-07** → ✅ cả hai tồn tại độc lập
5. Xóa task không hộp xác nhận → **TC-DEL-02** → ✅ `[UX]` xóa ngay, ghi nhận rủi ro mất dữ liệu
6. Dọn: xóa toàn bộ task do test tạo

**Trạng thái kết thúc mong đợi:** Không crash, không XSS; các quan sát UX/biên được ghi nhận; dữ liệu test đã dọn.

---

## Bảng tra cứu Scenario ↔ TC ↔ Nhóm

| Scenario | Nhóm | TC bao phủ | Trọng tâm |
|---|---|---|---|
| SC-SMOKE-01 | Smoke | LOGIN-01, AUTH-04, LIST-01/02, ADD-01, TOGGLE-01, DEL-01, LOGOUT-01 | Vòng đời cốt lõi |
| SC-SMOKE-02 | Smoke | AUTH-01/02/03, LOGIN-01, LOGOUT-01/02 | Bảo vệ truy cập |
| SC-REG-01 | Regression | LOGIN-02→07, 10, 14, 15 | Ma trận validate đăng nhập |
| SC-REG-02 | Regression | LOGIN-08/09/11 | Privacy thông báo lỗi |
| SC-REG-03 | Regression | LIST-01/02, ADD-01/02/03/04/08, TOGGLE-01/02, DEL-03 | CRUD & tổng kết |
| SC-REG-04 | Regression | TOGGLE-03, DEL-01, LIST-03 | Biên tổng kết |
| SC-EDGE-01 | Edge | AUTH-05, LOGIN-12/13 | Rủi ro an ninh/xác thực |
| SC-EDGE-02 | Edge | EDGE-01/02 | Storage hỏng |
| SC-EDGE-03 | Edge | EDGE-03/05 | Vòng đời storage & seed |
| SC-EDGE-04 | Edge | LOGIN-16, ADD-05/06/07, DEL-02 | Đầu vào biên & XSS |

> **Thứ tự chạy đề xuất:** Smoke (gác cổng) → Regression (phủ chức năng) → Edge (rủi ro & `[BUG?]`).
> Mỗi kịch bản độc lập, tự seed/dọn dữ liệu của mình; tuân `CLAUDE.md` (baseURL từ `.env`, không hardcode credential, không phá dữ liệu chung trên Staging/UAT).
</content>
