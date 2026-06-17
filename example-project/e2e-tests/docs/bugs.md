# Bugs / Điểm nghi vấn — chờ tester xác nhận

> Theo `CLAUDE.md`: khi nghi ngờ app có bug, **không** sửa test cho xanh — ghi lại tại đây.
> Phát hiện từ phân tích code (feature-map) + thiết kế test (scenarios). Trạng thái: **cần xác nhận**.

| # | Mức | Tóm tắt | Bằng chứng (code) | Test liên quan | Kỳ vọng cần chốt |
|---|---|---|---|---|---|
| B-01 | High (an ninh) | Bảo vệ trang chỉ là client-side guard; phiên giả qua `localStorage` vào được dashboard không cần mật khẩu | `dashboard.js:5-9`; `data.js:22-32` | TC-AUTH-05 / SC-EDGE-01 | App demo chấp nhận, hay cần xác thực server? |
| B-02 | Medium | Đăng nhập phân biệt hoa/thường ở email (`===`) → email đúng viết hoa khác bị từ chối | `auth.js:19` | TC-LOGIN-12 / SC-EDGE-01 | Email có nên không phân biệt hoa/thường? |
| B-03 | Medium | Mật khẩu không được `.trim()` (email thì có) → mật khẩu đúng kèm khoảng trắng bị từ chối | `auth.js:37-38` | TC-LOGIN-13 / SC-EDGE-01 | Chủ ý hay bug? |
| B-04 | Medium | `JSON.parse` trong `getTasks()` không try/catch → `tm_tasks` hỏng có thể crash render | `data.js:40-47` | TC-EDGE-01 / SC-EDGE-02 | Cần xử lý phòng thủ + fallback seed? |
| B-05 | Medium | `JSON.parse` trong `getSession()` không try/catch → `tm_session` hỏng có thể crash thay vì redirect | `data.js:29-32`; `dashboard.js:5-9` | TC-EDGE-02 / SC-EDGE-02 | Redirect an toàn khi phiên hỏng? |
| B-06 | Low | Không giới hạn độ dài tên công việc → chuỗi rất dài có thể vỡ layout | `dashboard.js:62-68` | TC-ADD-06 / SC-EDGE-04 | Có cần maxlength? |
| B-07 | Low (UX) | Xóa công việc không có xác nhận/undo → rủi ro mất dữ liệu do nhầm | `dashboard.js:78-82` | TC-DEL-02 / SC-EDGE-04 | Có cần hộp xác nhận? |

> Cập nhật cột "Mức"/"Kỳ vọng" sau khi tester review. Test tương ứng giữ assert theo kỳ vọng đúng;
> nếu app được vá, các test edge sẽ chuyển trạng thái phản ánh hành vi mới.
