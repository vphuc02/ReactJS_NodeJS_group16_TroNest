# TroNest - Hệ Thống Tìm Kiếm & Đăng Tin Phòng Trọ

TroNest là nền tảng quản lý, tìm kiếm và đăng tin phòng trọ, căn hộ mini, chung cư mini, ký túc xá / sleepbox uy tín. Hệ thống kiểm duyệt 100% bài đăng và tài khoản chủ trọ nhằm bảo vệ quyền lợi người thuê và xây dựng cộng đồng cho thuê minh bạch.

---

## 1. Các Vai Trò (Roles) Trong Hệ Thống

Hệ thống có **3 roles chính**:

### 1. Quản Trị Viên (Admin)
- Đăng nhập hệ thống quản trị tại `/admin/login` hoặc `/login`.
- **Duyệt tài khoản Chủ trọ**: Xem danh sách chủ trọ mới đăng ký (trạng thái `PENDING`), phê duyệt (`APPROVED`) hoặc từ chối (`REJECTED`) kèm lý do.
- **Duyệt bài đăng phòng trọ**: Thẩm định bài đăng của chủ trọ, duyệt bài (`APPROVED`) để bài xuất bản ra ngoài website hoặc từ chối (`REJECTED`) kèm lý do chỉnh sửa.
- **Quản lý người dùng**: Khóa / mở khóa tài khoản người dùng (`ACTIVE` / `INACTIVE`).
- **Quản lý danh mục loại phòng trọ**: Thêm / xóa loại hình phòng trọ.
- **Bảng điều khiển thống kê (Dashboard)**: Thống kê tổng số phòng, số bài chờ duyệt, số chủ trọ chờ duyệt, tổng khách hàng...

### 2. Chủ Trọ (Landlord)
- Đăng ký tài khoản tại `/register` (chọn vai trò **Chủ trọ cho thuê**).
- Sau khi đăng ký, tài khoản có trạng thái ban đầu là **`PENDING`** (Chờ duyệt).
- Khi ở trạng thái `PENDING` hoặc `REJECTED`, chủ trọ đăng nhập vào trang quản lý sẽ nhận thông báo cảnh báo và **chưa có quyền đăng phòng**.
- Sau khi được Admin phê duyệt chuyển sang **`APPROVED`**, chủ trọ có toàn quyền đăng và quản lý phòng trọ:
  - Tạo bài đăng mới với 2 chế độ: **Lưu bản nháp (`DRAFT`)** hoặc **Gửi Admin duyệt ngay (`PENDING`)**.
  - Bài đăng có 4 trạng thái:
    - `DRAFT`: Bản nháp chỉ chủ trọ thấy, có thể sửa bất cứ lúc nào và bấm nút **"Gửi duyệt"**.
    - `PENDING`: Bài đã gửi đi, đang chờ Admin duyệt.
    - `APPROVED`: Bài đã được Admin duyệt, hiển thị công khai trên website.
    - `REJECTED`: Bài bị Admin từ chối kèm lý do phản hồi, chủ trọ xem lý do, chỉnh sửa và bấm **"Gửi duyệt lại"**.
  - Chỉnh sửa, xóa bài đăng phòng trọ của mình.

### 3. Khách Hàng (Customer)
- Đăng ký tài khoản tại `/register` (vai trò **Khách thuê phòng**, kích hoạt ngay `ACTIVE`).
- Xem trang chủ với các phòng nổi bật, phòng mới nhất, danh mục loại phòng.
- Tìm kiếm và lọc phòng:
  - Lọc theo từ khóa (tiêu đề, địa chỉ).
  - Lọc theo quận/huyện (Cầu Giấy, Đống Đa, Hai Bà Trưng, Thanh Xuân, Nam Từ Liêm...).
  - Lọc theo loại phòng (Khép kín, Studio, Chung cư mini, Sleepbox...).
  - Lọc theo khoảng giá (Dưới 2tr, 2-4tr, 4-7tr, Trên 7tr).
  - Lọc theo diện tích (<20m², 20-30m², 30-50m², >50m²).
  - Sắp xếp: Mới nhất, Giá tăng dần, Giá giảm dần, Diện tích lớn.
- Xem chi tiết phòng: hình ảnh, giá thuê, tiền cọc, giá điện/nước/dịch vụ, tiện ích đi kèm, mô tả.
- **Xem thông tin liên hệ của Chủ trọ**: Tên chủ trọ, số điện thoại (nút gọi trực tiếp, nút chat Zalo), email, địa chỉ.
- **Lưu phòng yêu thích (Wishlist)**: Khách hàng đăng nhập có thể nhấn biểu tượng trái tim để lưu phòng và xem danh sách tại `/favorites`.

---

## 2. Tài Khoản Thử Nghiệm Có Sẵn

Tất cả tài khoản đều có mật khẩu mặc định là: **`123456`**

| Vai trò (Role) | Email | Mật khẩu | Trạng thái | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@tronest.com` | `123456` | `ACTIVE` | Toàn quyền quản trị & phê duyệt |
| **Chủ trọ đã duyệt** | `chutro.viet@tronest.com` | `123456` | `APPROVED` | Có quyền đăng phòng, quản lý bài đăng |
| **Chủ trọ chờ duyệt** | `chutro.hung@tronest.com` | `123456` | `PENDING` | Mới đăng ký, chưa có quyền đăng bài |
| **Khách hàng thuê** | `khachhang@tronest.com` | `123456` | `ACTIVE` | Tìm phòng, xem chi tiết, lưu yêu thích |

---

## 3. Cấu Trúc Các Đường Dẫn (URLs)

### Website Khách Hàng (Client)
- **Trang chủ**: `http://localhost:3000/`
- **Danh sách & Tìm kiếm phòng**: `http://localhost:3000/rooms`
- **Chi tiết phòng**: `http://localhost:3000/rooms/detail/:id`
- **Phòng yêu thích**: `http://localhost:3000/favorites`
- **Đăng nhập**: `http://localhost:3000/login`
- **Đăng ký**: `http://localhost:3000/register`
- **Đăng xuất**: `http://localhost:3000/logout`

### Portal Chủ Trọ (Landlord)
- **Tổng quan bài đăng**: `http://localhost:3000/landlord/dashboard`
- **Quản lý danh sách bài trọ**: `http://localhost:3000/landlord/rooms`
- **Đăng bài mới**: `http://localhost:3000/landlord/rooms/create`
- **Chỉnh sửa bài**: `http://localhost:3000/landlord/rooms/edit/:id`

### Portal Quản Trị (Admin)
- **Đăng nhập Quản trị viên (Cổng riêng)**: `http://localhost:3000/admin/login`
- **Bảng điều khiển Admin**: `http://localhost:3000/admin/dashboard`
- **Duyệt Chủ trọ**: `http://localhost:3000/admin/landlords`
- **Duyệt bài đăng phòng**: `http://localhost:3000/admin/rooms`
- **Thẩm định bài đăng**: `http://localhost:3000/admin/rooms/detail/:id`
- **Quản lý người dùng**: `http://localhost:3000/admin/users`
- **Quản lý loại phòng**: `http://localhost:3000/admin/categories`
- **Đăng xuất Admin**: `http://localhost:3000/admin/logout`

---

## 4. Hướng Dẫn Chạy Dự Án

### Cấu hình biến môi trường (.env):
Sao chép từ file mẫu và cấu hình thông tin của bạn:
```bash
cp .env.example .env
```

### Khởi động Server:
```bash
npm start
# hoặc
yarn start
```

Server sẽ chạy tại: **`http://localhost:3000`**

### Khởi tạo lại Dữ liệu mẫu (Seed Data) bất cứ lúc nào:
```bash
node seeds/seed.js
```
