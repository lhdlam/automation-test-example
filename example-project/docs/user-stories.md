# User Stories — Task Manager Demo

Tài liệu mô tả nhu cầu người dùng dưới dạng user story, bổ trợ cho SRS.

## Đăng nhập

**US-01 — Đăng nhập để dùng ứng dụng**
> Là một người dùng, tôi muốn đăng nhập bằng email và mật khẩu của mình,
> để truy cập danh sách công việc cá nhân.

Tiêu chí chấp nhận:
- Nhập đúng email/mật khẩu → vào được trang công việc, thấy tên mình.
- Bỏ trống email hoặc mật khẩu → được nhắc nhập đầy đủ.
- Email sai định dạng → được báo email không hợp lệ.
- Sai email/mật khẩu → được báo lỗi mà không cho biết sai cụ thể phần nào.

## Quản lý công việc

**US-02 — Xem công việc của tôi**
> Là người dùng đã đăng nhập, tôi muốn xem danh sách công việc và biết tổng số
> cũng như số đã hoàn thành, để nắm được khối lượng việc.

**US-03 — Thêm công việc mới**
> Là người dùng, tôi muốn thêm một công việc bằng cách nhập tên và bấm Thêm,
> để ghi lại việc cần làm.

Tiêu chí chấp nhận:
- Nhập tên hợp lệ → công việc xuất hiện trong danh sách, ô nhập được làm trống.
- Để trống tên rồi bấm Thêm → được báo lỗi, không thêm gì.

**US-04 — Đánh dấu hoàn thành**
> Là người dùng, tôi muốn đánh dấu một công việc là đã xong (và có thể bỏ đánh
> dấu), để theo dõi tiến độ.

**US-05 — Xóa công việc**
> Là người dùng, tôi muốn xóa một công việc không còn cần, để danh sách gọn gàng.

## Bảo mật & phiên

**US-06 — Chỉ người đăng nhập mới vào được**
> Là chủ ứng dụng, tôi muốn người chưa đăng nhập không vào được trang công việc,
> để bảo vệ dữ liệu.

**US-07 — Đăng xuất**
> Là người dùng, tôi muốn đăng xuất khi dùng xong, để kết thúc phiên an toàn.
