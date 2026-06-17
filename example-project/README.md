# Task Manager Demo — Project mẫu để test 2 quy trình automation

Project web app nhỏ dùng làm **mục tiêu kiểm thử (test target)** cho hai quy trình:

1. **Đọc code → Test case → Kịch bản → Playwright script**
2. **Tài liệu dự án → Test case (agent tự sinh) → Playwright script**

App đủ luồng để sinh test case phong phú: đăng nhập (thành công / sai / validate),
bảo vệ truy cập, thêm/đánh dấu/xóa công việc, đăng xuất.

---

## Có gì trong project

```
example-project/
├── src/                  # SOURCE CODE — dùng cho Quy trình 1 (đọc code)
│   ├── index.html        # trang Đăng nhập (trang gốc "/")
│   ├── dashboard.html    # trang Công việc ("/dashboard.html")
│   ├── css/styles.css
│   └── js/
│       ├── data.js       # dữ liệu giả lập + lưu trữ
│       ├── auth.js       # validate + xác thực đăng nhập
│       └── dashboard.js  # CRUD công việc + bảo vệ trang
├── docs/                 # TÀI LIỆU DỰ ÁN — dùng cho Quy trình 2 (tự sinh test case)
│   ├── SRS.md            # đặc tả yêu cầu (REQ-001 → REQ-013)
│   ├── user-stories.md
│   └── business-rules.md # quy tắc nghiệp vụ + bảng thông báo chính xác
├── package.json          # tiện chạy `npm start` để serve local
└── README.md
```

> Lưu ý: project này **không kèm sẵn thư mục test**. Việc sinh `tests/` chính là
> kết quả bạn để agent tạo ra khi chạy quy trình.

---

## Tài khoản demo

- Email: `tester@example.com`
- Mật khẩu: `Test@1234`

---

## Chạy / Deploy lên Staging (URL để Playwright trỏ vào)

App là **static thuần** (HTML/CSS/JS), không cần build. Vài cách lấy URL:

**Cách 1 — chạy local nhanh để thử:**
```bash
cd example-project
npm start          # tương đương: npx serve src -l 3000
# Mở http://localhost:3000
```

**Cách 2 — deploy lên host tĩnh để có URL Staging/UAT thật:**
- Netlify / Vercel / Cloudflare Pages: trỏ thư mục publish vào `src/`.
- GitHub Pages: đẩy nội dung `src/` lên branch phục vụ Pages.
- Bất kỳ web server tĩnh nào (Nginx, S3 + CloudFront...): đặt `src/` làm web root.

Sau khi deploy, bạn sẽ có URL kiểu `https://task-demo-staging.example.com` —
đây chính là `BASE_URL` để điền vào `.env.staging` trong các quy trình.

> Routes: trang Đăng nhập ở `/`, trang Công việc ở `/dashboard.html`.

---

## Dùng với Quy trình 1 (đọc code)

Mở tài liệu quy trình `quy-trinh-agent-automation-test.md` và làm theo, với lưu ý:
- **Đầu vào Phase 1:** trỏ agent đọc thư mục `src/` của project này.
- **BASE_URL:** URL bạn vừa deploy ở trên.
- Kỳ vọng: agent đọc `auth.js` / `dashboard.js` để hiểu validation & luồng,
  rồi sinh test case → kịch bản → script Playwright chạy vào URL Staging.

## Dùng với Quy trình 2 (tài liệu → tự sinh test case)

Mở tài liệu quy trình `quy-trinh-agent-tu-tai-lieu-du-an.md` và làm theo, với lưu ý:
- **Đầu vào Phase 1:** đặt/đọc toàn bộ thư mục `docs/` của project này
  (SRS, user stories, business rules).
- Kỳ vọng: agent trích yêu cầu REQ-xxx từ tài liệu, **tự sinh test case + RTM**,
  rồi đối chiếu UI thật trên Staging để lấy selector, sinh script Playwright.

---

## Gợi ý kiểm chứng nhanh kết quả

Một bộ test "đúng" sau khi agent sinh ra nên phủ tối thiểu:
- Đăng nhập thành công → vào dashboard, thấy tên user.
- 4 nhánh lỗi đăng nhập: email rỗng, email sai định dạng, mật khẩu rỗng, sai thông tin.
- Truy cập `/dashboard.html` khi chưa đăng nhập → bị đẩy về `/`.
- Thêm công việc hợp lệ; thêm với tên rỗng → báo lỗi.
- Đánh dấu hoàn thành / bỏ đánh dấu; dòng tổng kết cập nhật đúng.
- Xóa công việc.
- Đăng xuất → về trang đăng nhập, rồi truy cập lại dashboard bị chặn.

Đối chiếu chuỗi thông báo theo bảng trong `docs/business-rules.md`.
