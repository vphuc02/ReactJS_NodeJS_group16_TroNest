# TroNest - Hệ Thống Tìm Kiếm & Đăng Tin Phòng Trọ

TroNest là nền tảng quản lý, tìm kiếm và đăng tin phòng trọ, căn hộ mini, chung cư mini, ký túc xá / sleepbox uy tín. Hệ thống kiểm duyệt 100% bài đăng và tài khoản chủ trọ nhằm bảo vệ quyền lợi người thuê và xây dựng cộng đồng cho thuê minh bạch.

---

## 1. Các Vai Trò (Roles) Trong Hệ Thống

Hệ thống có **3 roles chính**:

### 1. Quản Trị Viên (Admin)
- Đăng nhập hệ thống quản trị tại `/admin/login` (cổng riêng).
- **Duyệt tài khoản Chủ trọ**: Xem danh sách chủ trọ mới đăng ký (trạng thái `PENDING`), phê duyệt (`APPROVED`) hoặc từ chối (`REJECTED`) kèm lý do.
- **Duyệt bài đăng phòng trọ**: Thẩm định bài đăng của chủ trọ, duyệt bài (`APPROVED`) để bài xuất bản ra ngoài website hoặc từ chối (`REJECTED`) kèm lý do chỉnh sửa.
- **Quản lý người dùng**: Khóa / mở khóa bằng `isBlocked`, độc lập với trạng thái phê duyệt chủ trọ.
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
- **Đăng xuất**: `POST /logout` qua nút đăng xuất (có CSRF token).

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
- **Đăng xuất Admin**: `POST /admin/logout` qua nút đăng xuất (có CSRF token).

---

## 4. Hướng Dẫn Chạy Dự Án

Yêu cầu Node.js >= 20.19.0 và Yarn. Cài dependency bằng `yarn install`.

### Cấu hình biến môi trường (.env):
Sao chép từ file mẫu và cấu hình thông tin của bạn:
```bash
cp .env.example .env
```

### Khởi động Server:
```bash
yarn start
```

Server sẽ chạy tại: **`http://localhost:3000`**

Chạy phát triển với tự động tải lại: `yarn dev`. Đặt `NODE_ENV=production` trên môi trường triển khai HTTPS.

### Khởi tạo lại Dữ liệu mẫu (Seed Data):
Lệnh này xóa dữ liệu hiện tại trong database được cấu hình. Chỉ dùng database phát triển riêng; seed bị chặn khi `NODE_ENV=production` và yêu cầu cờ xác nhận `--reset`.
```bash
yarn seed --reset
```

### Ảnh tải lên
- Tối đa 6 ảnh/lượt, 10 MB/ảnh và 25 megapixel. Ảnh được giải mã rồi lưu lại dạng WebP tĩnh; GIF động chỉ giữ khung đầu.
- Ảnh mới có định danh chủ trọ trong tên file; quota 200 MB/chủ trọ được tính từ các file này, kể cả ảnh chưa gắn vào bài. Ảnh cũ không có định danh chủ trọ không được tính vào quota mới.
- Quota và giới hạn tải đồng thời hiện dành cho một tiến trình Node dùng ổ đĩa cục bộ. Khi triển khai nhiều worker cần dùng bộ đếm/khóa dùng chung.
- `yarn uploads:cleanup` chỉ liệt kê ảnh không còn được bài nào tham chiếu và đã cũ hơn 24 giờ.
- `yarn uploads:cleanup --apply` mới thực sự xóa các ảnh đó. Chạy khi tạm ngừng thao tác ghi bài/upload để tránh ảnh được gắn vào bài trong lúc dọn.

### Trạng thái tài khoản cũ
Khóa/mở khóa mới dùng `isBlocked`, giữ nguyên trạng thái duyệt. Chủ trọ cũ mang trạng thái `INACTIVE` sẽ chuyển về `PENDING` khi mở khóa vì dữ liệu cũ không lưu trạng thái duyệt trước lúc khóa.
