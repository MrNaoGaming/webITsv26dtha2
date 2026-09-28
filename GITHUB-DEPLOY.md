# Đưa IT Student Web lên GitHub và chạy online

## 1. Tạo repository
- Đăng nhập GitHub.
- Chọn New repository.
- Đặt tên ví dụ: `it-student-web`.
- Có thể để Public nếu muốn chia sẻ source.

## 2. Upload project
Giải nén file ZIP này rồi upload các thư mục/file vào repository.
Không upload:
- `node_modules`
- `.env`
- file database `.db`

## 3. Chạy online
Project có backend Node.js/Express nên GitHub Pages không chạy được backend.

Dùng một dịch vụ Node.js hosting (ví dụ Render) và kết nối repository GitHub:
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `JWT_SECRET` (tạo một chuỗi bí mật dài)

File `render.yaml` đã được chuẩn bị sẵn để hỗ trợ cấu hình.

## 4. Database
Bản hiện tại dùng SQLite để chạy thử. Khi website có nhiều người dùng và cần chạy online ổn định,
nên chuyển database sang PostgreSQL (Supabase/Neon/Render PostgreSQL hoặc dịch vụ tương đương).
Không đặt mật khẩu database trực tiếp trong source code; dùng `DATABASE_URL` trong Environment Variables.

## 5. Git
Nếu dùng Git trên máy:

```bash
git init
git add .
git commit -m "Initial IT Student Web"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Sau đó kết nối repository với dịch vụ hosting.
