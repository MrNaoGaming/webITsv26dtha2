# IT Student Web

Website học tập Công nghệ thông tin cho sinh viên.

## Chức năng
- Trang chủ giới thiệu CNTT
- Menu 3 gạch
- Đăng ký / đăng nhập
- Avatar và menu tài khoản
- Thông tin / Bảo mật / Điểm / Logout
- Trắc nghiệm yêu cầu đăng nhập
- Bài 0 đến Bài 6
- Lưu điểm
- BXH
- Backend Node.js + Express
- JWT + bcrypt
- SQLite cho bản chạy thử local

## Chạy local

Yêu cầu Node.js 18+:

```bash
npm install
npm start
```

Mở `http://localhost:3000`.

## Đưa lên GitHub

Đây là source code, GitHub dùng để lưu và quản lý project. Backend không chạy bằng GitHub Pages.

Xem `GITHUB-DEPLOY.md` để triển khai backend online.

## Bảo mật

Không commit `.env`, mật khẩu, API key hoặc database production.
Dùng Environment Variables trên dịch vụ hosting.

## Database production

SQLite phù hợp cho bản demo/local. Với website nhiều người dùng, nên chuyển sang PostgreSQL và cấu hình `DATABASE_URL`.
