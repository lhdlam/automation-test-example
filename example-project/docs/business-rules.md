# Business Rules — Task Manager Demo

Các quy tắc nghiệp vụ chi tiết, dùng kèm SRS khi viết test case.

## Tài khoản

- **BR-01 — Tài khoản hợp lệ:** Hệ thống demo có một tài khoản dùng để kiểm thử:
  - Email: `tester@example.com`
  - Mật khẩu: `Test@1234`
  - Tên hiển thị: `Nguyễn Văn Tester`

## Quy tắc kiểm tra đăng nhập (thứ tự ưu tiên)

Khi bấm "Đăng nhập", hệ thống kiểm tra theo đúng thứ tự sau và dừng ở lỗi đầu tiên:

- **BR-02 — Email rỗng:** Email để trống → thông báo "Email là bắt buộc".
- **BR-03 — Email sai định dạng:** Email không đúng dạng `tên@miền.phần-mở-rộng`
  → thông báo "Email không hợp lệ".
- **BR-04 — Mật khẩu rỗng:** Mật khẩu để trống → thông báo "Mật khẩu là bắt buộc".
- **BR-05 — Sai thông tin:** Email/mật khẩu không khớp tài khoản hợp lệ →
  thông báo chung "Email hoặc mật khẩu không đúng" (không nói rõ sai phần nào,
  vì lý do bảo mật).

## Phiên & truy cập

- **BR-06 — Bảo vệ trang công việc:** Trang "Công việc của tôi" chỉ truy cập được
  khi đã đăng nhập. Truy cập khi chưa đăng nhập → tự chuyển về trang Đăng nhập.
- **BR-07 — Đăng xuất:** Đăng xuất sẽ kết thúc phiên; sau đó áp dụng lại BR-06.

## Công việc

- **BR-08 — Tên công việc bắt buộc:** Không cho thêm công việc có tên rỗng (kể cả
  chỉ gồm khoảng trắng) → thông báo "Tên công việc là bắt buộc".
- **BR-09 — Dữ liệu khởi tạo:** Mỗi phiên làm việc mới bắt đầu với 2 công việc mẫu:
  "Chuẩn bị báo cáo tuần" và "Gửi email cho khách hàng", cả hai ở trạng thái
  chưa hoàn thành.
- **BR-10 — Dòng tổng kết:** Luôn hiển thị "Tổng: {N} công việc, {M} hoàn thành",
  cập nhật ngay sau mỗi thao tác thêm/đánh dấu/xóa.

## Thông báo (đối chiếu chính xác chuỗi ký tự)

| Tình huống | Thông báo |
|---|---|
| Email rỗng | Email là bắt buộc |
| Email sai định dạng | Email không hợp lệ |
| Mật khẩu rỗng | Mật khẩu là bắt buộc |
| Sai thông tin đăng nhập | Email hoặc mật khẩu không đúng |
| Tên công việc rỗng | Tên công việc là bắt buộc |
