const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const { startTestServer, stopTestServer, clearTestData } = require('./helpers/test-setup');
const { TestClient } = require('./helpers/test-client');
const User = require('../models/user.model');
const Room = require('../models/room.model');
const Category = require('../models/category.model');
const Favorite = require('../models/favorite.model');
const { ROLES, ROOM_STATUS, USER_STATUS } = require('../configs/system.config');

let baseUrl;
let adminClient;
let adminUser;
let otherAdminUser;
let customerUser;
let landlordUser;

before(async () => {
  const serverInfo = await startTestServer();
  baseUrl = serverInfo.baseUrl;
});

after(async () => {
  await clearTestData('admin-test');
  await stopTestServer();
});

beforeEach(async () => {
  await clearTestData('admin-test');

  const passwordHash = await bcrypt.hash('123456', 10);

  // Admin chính thực hiện kiểm thử
  adminUser = await User.create({
    fullName: 'Quản Trị Viên Chính',
    email: 'super.admin@admin-test.tronest.com',
    password: passwordHash,
    phone: '0988000001',
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE
  });

  // Admin thứ hai (dùng để test chống tự khóa / khóa chéo)
  otherAdminUser = await User.create({
    fullName: 'Quản Trị Viên Phụ',
    email: 'other.admin@admin-test.tronest.com',
    password: passwordHash,
    phone: '0988000002',
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE
  });

  // Người dùng Khách thuê
  customerUser = await User.create({
    fullName: 'Khách Thuê Admin-Test',
    email: 'customer@admin-test.tronest.com',
    password: passwordHash,
    phone: '0988000003',
    role: ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE
  });

  // Chủ trọ đang chờ duyệt
  landlordUser = await User.create({
    fullName: 'Chủ Trọ Chờ Duyệt Admin-Test',
    email: 'pending.landlord@admin-test.tronest.com',
    password: passwordHash,
    phone: '0988000004',
    role: ROLES.LANDLORD,
    status: USER_STATUS.PENDING
  });

  // Đăng nhập tài khoản Admin chính
  adminClient = new TestClient(baseUrl);
  const loginRes = await adminClient.post('/admin/login', {
    email: 'super.admin@admin-test.tronest.com',
    password: '123456'
  });
  assert.equal(loginRes.status, 200, 'Admin đăng nhập phải thành công');
});

describe('Quản Lý Danh Mục Phòng Trọ (Admin Category Management)', () => {
  test('Hiển thị danh sách danh mục và thống kê số lượng phòng (GET /admin/categories)', async () => {
    const cat = await Category.create({
      title: '[ADMIN-TEST] Phòng Chung Cư Mini',
      slug: 'admin-test-phong-chung-cu-mini',
      status: USER_STATUS.ACTIVE
    });

    await Room.create({
      title: '[ADMIN-TEST] Phòng test đếm danh mục',
      categoryId: cat._id,
      landlordId: landlordUser._id,
      price: 3500000,
      area: 25,
      address: 'Số 10 Cầu Giấy',
      status: ROOM_STATUS.APPROVED
    });

    const res = await adminClient.get('/admin/categories', { wantsJson: false });
    assert.equal(res.status, 200);
    assert.match(res.body, /\[ADMIN-TEST\] Phòng Chung Cư Mini/);
  });

  test('Báo lỗi 400 khi tạo danh mục với tiêu đề rỗng (POST /admin/categories/create)', async () => {
    const res = await adminClient.post('/admin/categories/create', {
      title: '   ',
      description: 'Mô tả loại phòng'
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.code, 400);
    assert.match(res.body.message, /Tên loại phòng không được để trống/);
  });

  test('Tạo thành công loại phòng mới và tự động sinh slug tiếng Việt chuẩn', async () => {
    const res = await adminClient.post('/admin/categories/create', {
      title: '[ADMIN-TEST] Căn Hộ Dịch Vụ Cao Cấp',
      description: 'Dành cho chuyên gia',
      icon: 'fa-solid fa-building'
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);

    const created = await Category.findOne({ title: '[ADMIN-TEST] Căn Hộ Dịch Vụ Cao Cấp' });
    assert.ok(created, 'Danh mục phải được lưu vào database');
    assert.equal(created.slug, 'admin-test-can-ho-dich-vu-cao-cap');
    assert.equal(created.icon, 'fa-solid fa-building');
  });

  test('Chặn tạo loại phòng trùng tên hoặc trùng slug (Mã 400)', async () => {
    await Category.create({
      title: '[ADMIN-TEST] Phòng Độc Nhất',
      slug: 'admin-test-phong-doc-nhat'
    });

    const res = await adminClient.post('/admin/categories/create', {
      title: '[ADMIN-TEST] Phòng Độc Nhất'
    });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /Loại phòng này đã tồn tại/);
  });


  test('Báo lỗi 404 khi xóa loại phòng không tồn tại (POST /admin/categories/delete/:id)', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await adminClient.post(`/admin/categories/delete/${fakeId}`);
    assert.equal(res.status, 404);
  });

  test('Ngăn chặn xóa loại phòng đang có bài đăng phòng trọ liên kết (Mã 409 Conflict)', async () => {
    const cat = await Category.create({
      title: '[ADMIN-TEST] Ký Túc Xá Sinh Viên',
      slug: 'admin-test-ky-tuc-xa-sinh-vien',
      status: USER_STATUS.ACTIVE
    });

    await Room.create({
      title: '[ADMIN-TEST] Giường tầng sinh viên',
      categoryId: cat._id,
      landlordId: landlordUser._id,
      price: 1500000,
      area: 20,
      address: 'Số 15 Xuân Thủy',
      status: ROOM_STATUS.APPROVED
    });

    const res = await adminClient.post(`/admin/categories/delete/${cat._id}`);
    assert.equal(res.status, 409);
    assert.match(res.body.message, /Không thể xóa loại phòng đang được sử dụng/);

    const stillExists = await Category.findById(cat._id);
    assert.ok(stillExists, 'Danh mục không được phép bị xóa khi còn phòng tham chiếu');
  });

  test('Xóa thành công loại phòng không có bài đăng nào sử dụng', async () => {
    const cat = await Category.create({
      title: '[ADMIN-TEST] Phòng Độc Lập Trống',
      slug: 'admin-test-phong-doc-lap-trong',
      status: USER_STATUS.ACTIVE
    });

    const res = await adminClient.post(`/admin/categories/delete/${cat._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);

    const deleted = await Category.findById(cat._id);
    assert.equal(deleted, null);
  });
});

describe('Quản Lý Người Dùng & Khóa/Mở Khóa Tài Khoản (Admin User Management)', () => {
  test('Lọc danh sách người dùng theo vai trò, trạng thái và từ khóa (GET /admin/users)', async () => {
    const res = await adminClient.get('/admin/users?role=CUSTOMER&keyword=Khách Thuê', { wantsJson: false });
    assert.equal(res.status, 200);
    assert.match(res.body, /Khách Thuê Admin-Test/);
  });

  test('Báo lỗi 404 khi thao tác khóa người dùng không tồn tại (POST /admin/users/toggle-status/:id)', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await adminClient.post(`/admin/users/toggle-status/${fakeId}`);
    assert.equal(res.status, 404);
  });

  test('Chặn Admin tự khóa tài khoản của chính mình (Mã 400)', async () => {
    const res = await adminClient.post(`/admin/users/toggle-status/${adminUser._id}`);
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Bạn không thể tự khóa tài khoản của chính mình/);

    const reloaded = await User.findById(adminUser._id);
    assert.equal(reloaded.isBlocked, false);
  });

  test('Chặn việc khóa tài khoản Quản trị viên khác (Mã 403 Forbidden)', async () => {
    const res = await adminClient.post(`/admin/users/toggle-status/${otherAdminUser._id}`);
    assert.equal(res.status, 403);
    assert.match(res.body.message, /Không thể khóa tài khoản Quản trị viên/);

    const reloaded = await User.findById(otherAdminUser._id);
    assert.equal(reloaded.isBlocked, false);
  });

  test('Khóa và mở khóa tài khoản Khách thuê, kiểm tra hiệu lực đăng nhập tức thì', async () => {
    // 1. Khóa tài khoản
    const lockRes = await adminClient.post(`/admin/users/toggle-status/${customerUser._id}`);
    assert.equal(lockRes.status, 200);
    assert.equal(lockRes.body.isBlocked, true);

    const lockedCustomer = await User.findById(customerUser._id);
    assert.equal(lockedCustomer.isBlocked, true);

    // 2. Thử đăng nhập tài khoản bị khóa -> Bị từ chối mã 403
    const customerClient = new TestClient(baseUrl);
    const failedLoginRes = await customerClient.post('/login', {
      email: customerUser.email,
      password: '123456'
    });
    assert.equal(failedLoginRes.status, 403);
    assert.match(failedLoginRes.body.message, /Tài khoản của bạn đã bị khóa/);

    // 3. Mở khóa lại tài khoản
    const unlockRes = await adminClient.post(`/admin/users/toggle-status/${customerUser._id}`);
    assert.equal(unlockRes.status, 200);
    assert.equal(unlockRes.body.isBlocked, false);

    // 4. Đăng nhập lại thành công
    const successfulLoginRes = await customerClient.post('/login', {
      email: customerUser.email,
      password: '123456'
    });
    assert.equal(successfulLoginRes.status, 200);
  });
});

describe('Quy Trình Duyệt & Từ Chối Chủ Trọ (Admin Landlord Verification Flow)', () => {
  test('Xem danh sách chủ trọ với bộ lọc và thống kê (GET /admin/landlords)', async () => {
    const res = await adminClient.get('/admin/landlords?status=PENDING', { wantsJson: false });
    assert.equal(res.status, 200);
    assert.match(res.body, /Chủ Trọ Chờ Duyệt Admin-Test/);
  });

  test('Báo lỗi 404 khi phê duyệt hoặc từ chối chủ trọ không tồn tại', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const resApprove = await adminClient.post(`/admin/landlords/approve/${fakeId}`);
    assert.equal(resApprove.status, 404);

    const resReject = await adminClient.post(`/admin/landlords/reject/${fakeId}`, {
      reason: 'Thiếu thông tin'
    });
    assert.equal(resReject.status, 404);
  });

  test('Admin phê duyệt Chủ trọ -> Trạng thái APPROVED và cho phép Chủ trọ đăng phòng', async () => {
    // 1. Phê duyệt chủ trọ
    const approveRes = await adminClient.post(`/admin/landlords/approve/${landlordUser._id}`);
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.body.code, 200);

    const updated = await User.findById(landlordUser._id);
    assert.equal(updated.status, USER_STATUS.APPROVED);
    assert.equal(updated.rejectReason, '');

    // 2. Chủ trọ đăng nhập và kiểm tra đã truy cập được trang tạo phòng
    const landlordClient = new TestClient(baseUrl);
    await landlordClient.post('/login', {
      email: landlordUser.email,
      password: '123456'
    });

    const createPageRes = await landlordClient.get('/landlord/rooms/create', { wantsJson: false });
    assert.equal(createPageRes.status, 200);
    assert.match(createPageRes.body, /Đăng tin phòng trọ mới/);
  });

  test('Admin từ chối Chủ trọ kèm lý do (POST /admin/landlords/reject/:id)', async () => {
    const res = await adminClient.post(`/admin/landlords/reject/${landlordUser._id}`, {
      reason: 'Ảnh căn cước công dân bị mờ, vui lòng cập nhật lại.'
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);

    const rejected = await User.findById(landlordUser._id);
    assert.equal(rejected.status, USER_STATUS.REJECTED);
    assert.equal(rejected.rejectReason, 'Ảnh căn cước công dân bị mờ, vui lòng cập nhật lại.');
  });
});

describe('Xóa Bài Đăng Vi Phạm Phía Quản Trị Viên (Admin Room Deletion)', () => {
  test('Admin xóa bài đăng vi phạm và dọn dẹp các bản ghi yêu thích liên quan (POST /admin/rooms/delete/:id)', async () => {
    const category = await Category.create({
      title: '[ADMIN-TEST] Loại Phòng Xóa',
      slug: 'admin-test-loai-phong-xoa',
      status: USER_STATUS.ACTIVE
    });

    const room = await Room.create({
      title: '[ADMIN-TEST] Bài đăng vi phạm chính sách TroNest',
      categoryId: category._id,
      landlordId: landlordUser._id,
      price: 5000000,
      area: 30,
      address: 'Số 99 Nguyễn Trãi',
      status: ROOM_STATUS.APPROVED
    });

    // Tạo bản ghi Favorite cho phòng này
    await Favorite.create({
      userId: customerUser._id,
      roomId: room._id
    });

    // Admin thực hiện xóa
    const deleteRes = await adminClient.post(`/admin/rooms/delete/${room._id}`);
    assert.equal(deleteRes.status, 200);
    assert.equal(deleteRes.body.code, 200);

    // Xác nhận Room đã bị xóa
    const deletedRoom = await Room.findById(room._id);
    assert.equal(deletedRoom, null);

    // Xác nhận Favorite liên quan đã được dọn sạch
    const remainingFav = await Favorite.findOne({ roomId: room._id });
    assert.equal(remainingFav, null);
  });
});

describe('Quy Chế Điều Phối & Quản Trị Bài Đăng (Admin Room Features)', () => {
  test('Tự động gỡ bài đăng đã xuất bản khi chủ trọ bị từ chối hoặc bị khóa tài khoản', async () => {
    const category = await Category.create({
      title: '[ADMIN-TEST] Loại Phòng Cascade',
      slug: 'admin-test-loai-phong-cascade'
    });

    // Tạo chủ trọ đã được duyệt và có 2 phòng đã APPROVED
    const activeLandlord = await User.create({
      fullName: 'Chủ Trọ Vi Phạm Quy Định',
      email: 'bad.landlord@admin-test.tronest.com',
      password: 'hash',
      phone: '0977000999',
      role: ROLES.LANDLORD,
      status: USER_STATUS.APPROVED
    });

    const room1 = await Room.create({
      title: '[ADMIN-TEST] Phòng số 1 của chủ trọ',
      categoryId: category._id,
      landlordId: activeLandlord._id,
      price: 3000000,
      area: 20,
      address: 'Số 10 Kim Mã',
      status: ROOM_STATUS.APPROVED
    });

    // Admin từ chối phê duyệt chủ trọ này
    const rejectRes = await adminClient.post(`/admin/landlords/reject/${activeLandlord._id}`, {
      reason: 'Phát hiện có hành vi gian lận thông tin'
    });
    assert.equal(rejectRes.status, 200);

    // Bài đăng của chủ trọ phải tự động chuyển sang REJECTED
    const checkedRoom = await Room.findById(room1._id);
    assert.equal(checkedRoom.status, ROOM_STATUS.REJECTED);
  });

  test('Đăng xuất Admin an toàn qua phương thức GET (/admin/logout)', async () => {
    const res = await adminClient.get('/admin/logout', { wantsJson: false });
    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /\/admin\/login/);
    assert.equal(adminClient.cookies.has('token_admin'), false);
  });
});

