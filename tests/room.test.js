const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const { startTestServer, stopTestServer, clearTestData } = require('./helpers/test-setup');
const { TestClient } = require('./helpers/test-client');
const User = require('../models/user.model');
const Room = require('../models/room.model');
const Category = require('../models/category.model');
const { ROLES, ROOM_STATUS, USER_STATUS } = require('../configs/system.config');

let baseUrl;
let testCategory;
let approvedLandlordClient;
let approvedLandlordUser;
let pendingLandlordClient;
let otherLandlordClient;
let adminClient;

before(async () => {
  const serverInfo = await startTestServer();
  baseUrl = serverInfo.baseUrl;
});

after(async () => {
  await clearTestData('room-test');
  await stopTestServer();
});

beforeEach(async () => {
  await clearTestData('room-test');

  // Tạo Category mẫu cho tests
  testCategory = await Category.create({
    title: '[ROOM-TEST] Phòng Trọ Studio',
    slug: 'room-test-phong-tro-studio',
    status: USER_STATUS.ACTIVE
  });

  const hash = await bcrypt.hash('123456', 10);

  // Tạo Chủ trọ đã được duyệt (APPROVED)
  approvedLandlordUser = await User.create({
    fullName: 'Chủ Trọ Đã Duyệt',
    email: 'approved.landlord@room-test.tronest.com',
    password: hash,
    phone: '0901234567',
    role: ROLES.LANDLORD,
    status: USER_STATUS.APPROVED
  });

  // Tạo Chủ trọ chưa được duyệt (PENDING)
  await User.create({
    fullName: 'Chủ Trọ Đang Chờ Duyệt',
    email: 'pending.landlord@room-test.tronest.com',
    password: hash,
    phone: '0901234568',
    role: ROLES.LANDLORD,
    status: USER_STATUS.PENDING
  });

  // Tạo Chủ trọ khác (để test IDOR chống can thiệp chéo)
  await User.create({
    fullName: 'Chủ Trọ Khác',
    email: 'other.landlord@room-test.tronest.com',
    password: hash,
    phone: '0901234569',
    role: ROLES.LANDLORD,
    status: USER_STATUS.APPROVED
  });

  // Tạo Admin
  await User.create({
    fullName: 'Admin Test',
    email: 'admin.room@room-test.tronest.com',
    password: hash,
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE
  });

  // Đăng nhập các client
  approvedLandlordClient = new TestClient(baseUrl);
  await approvedLandlordClient.post('/login', {
    email: 'approved.landlord@room-test.tronest.com',
    password: '123456'
  });

  pendingLandlordClient = new TestClient(baseUrl);
  await pendingLandlordClient.post('/login', {
    email: 'pending.landlord@room-test.tronest.com',
    password: '123456'
  });

  otherLandlordClient = new TestClient(baseUrl);
  await otherLandlordClient.post('/login', {
    email: 'other.landlord@room-test.tronest.com',
    password: '123456'
  });

  adminClient = new TestClient(baseUrl);
  await adminClient.post('/admin/login', {
    email: 'admin.room@room-test.tronest.com',
    password: '123456'
  });
});

describe('Quyền Hạn Đăng Phòng Của Chủ Trọ (Landlord Verification Check)', () => {
  test('Chủ trọ ở trạng thái PENDING bị chặn khi truy cập trang đăng phòng (/create)', async () => {
    const res = await pendingLandlordClient.get('/landlord/rooms/create', { wantsJson: true });
    assert.equal(res.status, 403);
    assert.match(res.body.message, /chờ duyệt/i);
  });

  test('Chủ trọ đã APPROVED truy cập thành công trang đăng phòng (/create)', async () => {
    const res = await approvedLandlordClient.get('/landlord/rooms/create', { wantsJson: false });
    assert.equal(res.status, 200);
  });
});

describe('Tạo Mới Bài Đăng Phòng Trọ (POST /landlord/rooms/create)', () => {
  test('Báo lỗi 400 khi thiếu các trường bắt buộc (title, categoryId, price, area, address)', async () => {
    const res = await approvedLandlordClient.post('/landlord/rooms/create', {
      title: '',
      price: '',
      area: ''
    });

    assert.equal(res.status, 400);
    assert.ok(res.body.message);
  });

  test('Báo lỗi 400 khi categoryId không tồn tại hoặc không hợp lệ', async () => {
    const res = await approvedLandlordClient.post('/landlord/rooms/create', {
      title: '[ROOM-TEST] Phòng trọ mới xây',
      categoryId: '600000000000000000000001',
      price: 3500000,
      area: 25,
      address: 'Số 123 Đường Cầu Giấy'
    });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /loại phòng không tồn tại/i);
  });

  test('Tạo phòng với chế độ Lưu nháp (actionStatus = DRAFT)', async () => {
    const res = await approvedLandlordClient.post('/landlord/rooms/create', {
      title: '[ROOM-TEST] Phòng trọ sinh viên Cầu Giấy',
      categoryId: testCategory._id.toString(),
      price: 3000000,
      deposit: 1000000,
      area: 20,
      capacity: 2,
      province: 'Hà Nội',
      district: 'Cầu Giấy',
      ward: 'Phường Dịch Vọng Hậu',
      address: 'Số 10 Ngõ 123 Cầu Giấy',
      actionStatus: ROOM_STATUS.DRAFT
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.ok(res.body.roomId);

    const saved = await Room.findById(res.body.roomId);
    assert.ok(saved);
    assert.equal(saved.status, ROOM_STATUS.DRAFT);
    assert.equal(saved.landlordId.toString(), approvedLandlordUser._id.toString());
  });

  test('Tạo phòng và Gửi duyệt ngay (actionStatus = PENDING)', async () => {
    const res = await approvedLandlordClient.post('/landlord/rooms/create', {
      title: '[ROOM-TEST] Căn hộ mini Studio ban công thoáng',
      categoryId: testCategory._id.toString(),
      price: 4500000,
      deposit: 4500000,
      area: 32,
      capacity: 3,
      province: 'Hà Nội',
      district: 'Đống Đa',
      ward: 'Phường Láng Thượng',
      address: 'Số 50 Chùa Láng',
      actionStatus: ROOM_STATUS.PENDING
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.match(res.body.message, /chờ Admin phê duyệt/i);

    const saved = await Room.findById(res.body.roomId);
    assert.ok(saved);
    assert.equal(saved.status, ROOM_STATUS.PENDING);
  });
});

describe('Chỉnh Sửa & Xóa Bài Đăng (Kiểm Tra Chống IDOR)', () => {
  let createdRoom;

  beforeEach(async () => {
    createdRoom = await Room.create({
      title: '[ROOM-TEST] Phòng trọ ban đầu của Chủ trọ 1',
      categoryId: testCategory._id,
      landlordId: approvedLandlordUser._id,
      price: 2500000,
      area: 20,
      address: 'Ngõ 20 Cầu Giấy',
      status: ROOM_STATUS.APPROVED
    });
  });

  test('Chủ trọ chỉnh sửa thành công bài đăng của chính mình', async () => {
    const res = await approvedLandlordClient.post(`/landlord/rooms/edit/${createdRoom._id}`, {
      title: '[ROOM-TEST] Phòng trọ đã được nâng cấp tiện nghi',
      categoryId: testCategory._id.toString(),
      price: 3200000,
      area: 22,
      address: 'Ngõ 20 Cầu Giấy (mới)',
      actionStatus: ROOM_STATUS.PENDING
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);

    const updated = await Room.findById(createdRoom._id);
    assert.equal(updated.title, '[ROOM-TEST] Phòng trọ đã được nâng cấp tiện nghi');
    assert.equal(updated.price, 3200000);
    // Khi chỉnh sửa bài đã duyệt, hệ thống tự động đưa về PENDING để Admin duyệt lại
    assert.equal(updated.status, ROOM_STATUS.PENDING);
  });

  test('Ngăn chặn IDOR: Chủ trọ B không thể chỉnh sửa bài đăng của Chủ trọ A', async () => {
    const res = await otherLandlordClient.post(`/landlord/rooms/edit/${createdRoom._id}`, {
      title: '[ROOM-TEST] Hacked title by other landlord',
      categoryId: testCategory._id.toString(),
      price: 1000,
      area: 20,
      address: 'Hacked address'
    });

    assert.equal(res.status, 404);

    const unhacked = await Room.findById(createdRoom._id);
    assert.equal(unhacked.title, '[ROOM-TEST] Phòng trọ ban đầu của Chủ trọ 1');
  });

  test('Ngăn chặn IDOR: Chủ trọ B không thể xóa bài đăng của Chủ trọ A', async () => {
    const res = await otherLandlordClient.post(`/landlord/rooms/delete/${createdRoom._id}`);
    assert.equal(res.status, 404);

    const stillExists = await Room.findById(createdRoom._id);
    assert.ok(stillExists, 'Bài đăng không được bị xóa bởi người khác');
  });

  test('Chủ trọ A xóa thành công bài đăng của chính mình', async () => {
    const res = await approvedLandlordClient.post(`/landlord/rooms/delete/${createdRoom._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);

    const deleted = await Room.findById(createdRoom._id);
    assert.equal(deleted, null);
  });
});

describe('Hiển Thị Công Khai Phía Khách Hàng (Client Views & Search)', () => {
  let approvedRoom;
  let pendingRoom;
  let draftRoom;

  beforeEach(async () => {
    approvedRoom = await Room.create({
      title: '[ROOM-TEST] Phòng trọ công khai view đẹp',
      categoryId: testCategory._id,
      landlordId: approvedLandlordUser._id,
      price: 3000000,
      area: 25,
      province: 'Hà Nội',
      district: 'Cầu Giấy',
      address: 'Số 10 Dịch Vọng',
      status: ROOM_STATUS.APPROVED,
      views: 5
    });

    pendingRoom = await Room.create({
      title: '[ROOM-TEST] Phòng trọ đang chờ duyệt chưa hiển thị',
      categoryId: testCategory._id,
      landlordId: approvedLandlordUser._id,
      price: 2500000,
      area: 20,
      address: 'Số 20 Dịch Vọng',
      status: ROOM_STATUS.PENDING
    });

    draftRoom = await Room.create({
      title: '[ROOM-TEST] Phòng trọ bản nháp bí mật',
      categoryId: testCategory._id,
      landlordId: approvedLandlordUser._id,
      price: 2000000,
      area: 18,
      address: 'Số 30 Dịch Vọng',
      status: ROOM_STATUS.DRAFT
    });
  });

  test('Trang danh sách phòng (/rooms) chỉ hiển thị phòng APPROVED, ẩn DRAFT và PENDING', async () => {
    const guestClient = new TestClient(baseUrl);
    const res = await guestClient.get('/rooms', { wantsJson: false });

    assert.equal(res.status, 200);
    assert.match(res.body, /\[ROOM-TEST\] Phòng trọ công khai view đẹp/);
    assert.doesNotMatch(res.body, /\[ROOM-TEST\] Phòng trọ đang chờ duyệt chưa hiển thị/);
    assert.doesNotMatch(res.body, /\[ROOM-TEST\] Phòng trọ bản nháp bí mật/);
  });

  test('Xem chi tiết phòng APPROVED (/rooms/detail/:id) -> thành công và tăng view count', async () => {
    const guestClient = new TestClient(baseUrl);
    const res = await guestClient.get(`/rooms/detail/${approvedRoom._id}`, { wantsJson: false });

    assert.equal(res.status, 200);
    assert.match(res.body, /\[ROOM-TEST\] Phòng trọ công khai view đẹp/);

    const reloaded = await Room.findById(approvedRoom._id);
    assert.equal(reloaded.views, 6, 'Lượt xem không được tăng sau khi truy cập');
  });

  test('Xem chi tiết phòng PENDING hoặc DRAFT -> trả về 404 (chưa được phép xuất bản)', async () => {
    const guestClient = new TestClient(baseUrl);
    const res1 = await guestClient.get(`/rooms/detail/${pendingRoom._id}`, { wantsJson: true });
    assert.equal(res1.status, 404);

    const res2 = await guestClient.get(`/rooms/detail/${draftRoom._id}`, { wantsJson: true });
    assert.equal(res2.status, 404);
  });
});

describe('Quy Trình Phê Duyệt Của Quản Trị Viên (Admin Room Approval Flow)', () => {
  let pendingRoom;

  beforeEach(async () => {
    pendingRoom = await Room.create({
      title: '[ROOM-TEST] Phòng trọ chờ Admin thẩm định',
      categoryId: testCategory._id,
      landlordId: approvedLandlordUser._id,
      price: 3500000,
      area: 28,
      address: 'Số 88 Xuân Thủy',
      status: ROOM_STATUS.PENDING
    });
  });

  test('Admin từ chối bài đăng kèm lý do cụ thể (POST /admin/rooms/reject/:id)', async () => {
    const res = await adminClient.post(`/admin/rooms/reject/${pendingRoom._id}`, {
      reason: 'Thiếu hình ảnh thực tế phòng vệ sinh khép kín.'
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);

    const rejected = await Room.findById(pendingRoom._id);
    assert.equal(rejected.status, ROOM_STATUS.REJECTED);
    assert.equal(rejected.rejectReason, 'Thiếu hình ảnh thực tế phòng vệ sinh khép kín.');
  });

  test('Chủ trọ gửi duyệt lại sau khi bị từ chối (POST /landlord/rooms/submit/:id)', async () => {
    pendingRoom.status = ROOM_STATUS.REJECTED;
    pendingRoom.rejectReason = 'Cần bổ sung ảnh';
    await pendingRoom.save();

    const res = await approvedLandlordClient.post(`/landlord/rooms/submit/${pendingRoom._id}`);
    assert.equal(res.status, 200);

    const resubmitted = await Room.findById(pendingRoom._id);
    assert.equal(resubmitted.status, ROOM_STATUS.PENDING);
    assert.equal(resubmitted.rejectReason, '');
  });

  test('Admin phê duyệt bài đăng (POST /admin/rooms/approve/:id) -> xuất bản ra website', async () => {
    const res = await adminClient.post(`/admin/rooms/approve/${pendingRoom._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);

    const approved = await Room.findById(pendingRoom._id);
    assert.equal(approved.status, ROOM_STATUS.APPROVED);
    assert.equal(approved.rejectReason, '');

    // Sau khi duyệt, kiểm tra phòng đã xuất hiện ở danh sách công khai
    const guestClient = new TestClient(baseUrl);
    const listRes = await guestClient.get('/rooms', { wantsJson: false });
    assert.equal(listRes.status, 200);
    assert.match(listRes.body, /\[ROOM-TEST\] Phòng trọ chờ Admin thẩm định/);
  });
});
