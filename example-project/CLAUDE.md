# Quy ước viết test cho dự án này
- Framework: Playwright + TypeScript, test chạy trên môi trường DEPLOY (Staging/UAT).
- KHÔNG giả định app chạy ở localhost. Mọi goto() dùng đường dẫn TƯƠNG ĐỐI
  (vd page.goto('/login')), baseURL do config lấy từ .env.
- KHÔNG hardcode URL, email, mật khẩu trong test → đọc từ process.env / fixtures.
- Dùng Page Object Model, mỗi page 1 class trong tests/pages/
- Selector ưu tiên: getByRole > getByLabel > getByTestId. KHÔNG dùng XPath/CSS brittle.
- Mỗi test độc lập, không phụ thuộc thứ tự chạy.
- Vì là môi trường dùng chung: test tự tạo dữ liệu của mình, dọn sau khi xong,
  KHÔNG xoá/sửa dữ liệu của người khác, tránh thao tác phá hoại trên Staging/UAT.
- Đặt tên test theo format: "should [hành vi] when [điều kiện]"
- Mọi assertion phải có ý nghĩa nghiệp vụ, không assert vu vơ.
- Khi nghi ngờ ứng dụng có bug: KHÔNG sửa test cho xanh, ghi docs/bugs.md để tester xác nhận.