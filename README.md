# Sango — Đặt sân thể thao

Ứng dụng web đặt sân thể thao: tìm sân theo môn/khu vực, xem lịch trống, đặt và hủy sân. Có giao diện riêng cho người chơi và chủ sân.

## Công nghệ

- Frontend: React, TypeScript, Vite, React Router, Zustand và Context API.
- Backend: Node.js, Express REST API, JWT, bcrypt.
- Cơ sở dữ liệu: MongoDB và Mongoose (`User`, `Venue`, `Booking`).

## Chạy trên máy cá nhân

Yêu cầu Node.js 20.19+ và MongoDB đang chạy (local hoặc MongoDB Atlas).

1. Cài dependencies:

   ```bash
   npm install
   ```

2. Tạo file `.env` từ `.env.example`, sau đó cấu hình `MONGODB_URI` và một `JWT_SECRET` ngẫu nhiên dài tối thiểu 32 ký tự.

3. Khởi tạo tài khoản và sân mẫu:

   ```bash
   npm run seed
   ```

4. Mở hai terminal trong thư mục dự án:

   ```bash
   npm run dev:api
   ```

   ```bash
   npm run dev
   ```

   Frontend chạy tại `http://localhost:5173`, API tại `http://localhost:5000`. Vite chuyển tiếp `/api` sang backend.

Tài khoản demo (được tạo bởi lệnh seed):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Người chơi | `player@sango.vn` | `demo12345` |
| Chủ sân | `owner@sango.vn` | `demo12345` |

Không dùng các mật khẩu demo trong môi trường thật.

## Các màn hình

1. Khám phá: tổng quan, tìm nhanh và sân nổi bật.
2. Tìm sân: lọc theo môn thể thao, khu vực và từ khóa.
3. Chi tiết sân: thông tin sân, lịch theo ngày/khung giờ và đặt sân.
4. Lịch đặt sân: xem trạng thái, hủy lịch.
5. Sân yêu thích: lưu và xem lại các sân đã chọn.
6. Quản lý sân: tổng quan doanh thu, lượt đặt và khách hàng.
7. Đăng nhập: chọn vai trò người chơi hoặc chủ sân.

Lịch đặt và sân yêu thích của chế độ demo được lưu trong trình duyệt. Backend cung cấp API có xác thực để lưu dữ liệu MongoDB.

## REST API

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/venues`, `GET /api/venues/:id`, `GET /api/venues/:id/availability`
- `POST /api/venues`, `PATCH /api/venues/:id` (chủ sân)
- `GET /api/bookings`, `POST /api/bookings`, `PATCH /api/bookings/:id/cancel`
- `GET /api/health`

Các API yêu cầu đăng nhập nhận header `Authorization: Bearer <token>`. API trả JSON và mã trạng thái HTTP tương ứng; lỗi được chuẩn hóa qua middleware.

## Build và kiểm tra

```bash
npm run build
npm run lint
```

## Bảo mật và triển khai

- `.env` không được commit; chỉ chia sẻ `.env.example` không chứa secret.
- Đặt `CLIENT_ORIGIN`, `MONGODB_URI`, `JWT_SECRET` và `PORT` theo môi trường triển khai.
- Dùng secret ngẫu nhiên riêng cho môi trường production; bật HTTPS và không dùng tài khoản demo.
