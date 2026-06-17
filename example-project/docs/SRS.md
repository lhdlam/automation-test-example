# Đặc tả yêu cầu phần mềm (SRS) — Task Manager Demo

Phiên bản: 1.0
Trạng thái: Áp dụng cho môi trường Staging/UAT

## 1. Giới thiệu

Task Manager là ứng dụng web đơn giản giúp một người dùng đăng nhập và quản lý
danh sách công việc cá nhân (thêm, đánh dấu hoàn thành, xóa). Tài liệu này mô tả
các yêu cầu chức năng để phục vụ phát triển và kiểm thử.

## 2. Phạm vi

- Đăng nhập bằng email & mật khẩu.
- Quản lý công việc: xem danh sách, thêm, đánh dấu hoàn thành, xóa.
- Đăng xuất.
- Bảo vệ trang nội bộ: chỉ người đã đăng nhập mới vào được trang công việc.

Ngoài phạm vi: đăng ký tài khoản, quên mật khẩu, phân quyền nhiều vai trò,
chia sẻ công việc giữa người dùng.

## 3. Yêu cầu chức năng

### 3.1. Đăng nhập (Màn hình: Đăng nhập)

- **REQ-001 — Đăng nhập thành công:** Khi người dùng nhập email và mật khẩu đúng
  của một tài khoản hợp lệ rồi bấm "Đăng nhập", hệ thống chuyển sang trang
  "Công việc của tôi" và hiển thị tên người dùng.
- **REQ-002 — Email bắt buộc:** Nếu để trống email và bấm "Đăng nhập",
  hệ thống hiển thị thông báo lỗi yêu cầu nhập email và không đăng nhập.
- **REQ-003 — Định dạng email:** Nếu email nhập vào sai định dạng (vd thiếu "@"
  hoặc thiếu phần tên miền), hệ thống hiển thị thông báo email không hợp lệ.
- **REQ-004 — Mật khẩu bắt buộc:** Nếu có email hợp lệ nhưng để trống mật khẩu,
  hệ thống hiển thị thông báo yêu cầu nhập mật khẩu.
- **REQ-005 — Sai thông tin đăng nhập:** Nếu email/mật khẩu không khớp tài khoản
  nào, hệ thống hiển thị một thông báo lỗi chung (không nói rõ sai email hay
  sai mật khẩu) và không đăng nhập.

### 3.2. Bảo vệ truy cập

- **REQ-006 — Chặn truy cập khi chưa đăng nhập:** Nếu người dùng chưa đăng nhập
  cố truy cập thẳng trang "Công việc của tôi", hệ thống tự chuyển họ về trang
  Đăng nhập.

### 3.3. Quản lý công việc (Màn hình: Công việc của tôi)

- **REQ-007 — Xem danh sách công việc:** Sau khi đăng nhập, người dùng thấy danh
  sách công việc hiện có và một dòng tổng kết số lượng công việc cùng số đã hoàn
  thành.
- **REQ-008 — Thêm công việc:** Người dùng nhập tên công việc và bấm "Thêm";
  công việc mới xuất hiện trong danh sách và ô nhập được làm trống.
- **REQ-009 — Tên công việc bắt buộc:** Nếu bấm "Thêm" khi ô tên công việc trống,
  hệ thống hiển thị thông báo lỗi và không thêm công việc.
- **REQ-010 — Đánh dấu hoàn thành:** Người dùng có thể đánh dấu một công việc là
  hoàn thành; công việc được hiển thị ở trạng thái hoàn thành và dòng tổng kết
  cập nhật số đã hoàn thành.
- **REQ-011 — Bỏ đánh dấu hoàn thành:** Người dùng có thể bỏ đánh dấu một công
  việc đã hoàn thành để đưa nó về trạng thái chưa hoàn thành.
- **REQ-012 — Xóa công việc:** Người dùng có thể xóa một công việc; công việc đó
  biến mất khỏi danh sách và dòng tổng kết cập nhật lại.

### 3.4. Đăng xuất

- **REQ-013 — Đăng xuất:** Người dùng bấm "Đăng xuất"; hệ thống kết thúc phiên và
  chuyển về trang Đăng nhập. Sau đó truy cập lại trang công việc sẽ bị chặn
  (theo REQ-006).

## 4. Ghi chú môi trường

- Ứng dụng được kiểm thử trên môi trường Staging/UAT đã deploy (không chạy local).
- Trang Đăng nhập là trang gốc của ứng dụng. Trang công việc nằm ở đường dẫn
  con của cùng tên miền.
