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

before(async () => {
  const serverInfo = await startTestServer();
  baseUrl = serverInfo.baseUrl;
});

after(async () => {
  await User.deleteMany({ email: /landlord-pub-test/ });
  await clearTestData('landlord-pub-test');
  await stopTestServer();
});

beforeEach(async () => {
  await User.deleteMany({ email: /landlord-pub-test/ });
  await clearTestData('landlord-pub-test');
});

describe('Khách thuê xem thông tin hồ sơ công khai của Chủ trọ trên Web chính (Client Landlord Profile)', () => {
  test('Khách thuê hoặc vãng lai truy cập /landlords/:id dạng HTML -> 200 OK, hiển thị đầy đủ thông tin và danh sách phòng trọ', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    const landlord = await User.create({
      fullName: 'Bác Ba Chủ Trọ (landlord-pub-test)',
      email: 'bacba@landlord-pub-test.tronest.com',
      password: passwordHash,
      phone: '0988776655',
      address: 'Số 123 Đường Cầu Giấy, Hà Nội',
      facebook: 'https://facebook.com/bacbachutro',
      role: ROLES.LANDLORD,
      status: USER_STATUS.APPROVED
    });

    const category = await Category.create({
      title: 'Phòng trọ khép kín (landlord-pub-test)',
      slug: 'phong-tro-khep-kin-landlord-pub-test',
      status: USER_STATUS.ACTIVE
    });

    await Room.create({
      title: 'Phòng trọ ban công thoáng mát Cầu Giấy (landlord-pub-test)',
      price: 3500000,
      area: 28,
      address: '123 Cầu Giấy, Hà Nội',
      ward: 'Dịch Vọng',
      district: 'Cầu Giấy',
      province: 'Hà Nội',
      categoryId: category._id,
      landlordId: landlord._id,
      status: ROOM_STATUS.APPROVED,
      amenities: ['Điều hòa', 'Nóng lạnh', 'Ban công']
    });

    const client = new TestClient(baseUrl);
    const res = await client.get(`/landlords/${landlord._id}`, { wantsJson: false });

    assert.equal(res.status, 200);
    // Xác thực hiển thị trên web chính, không điều hướng sang kênh chủ trọ
    assert.doesNotMatch(res.headers.get('location') || '', /\/landlord\//);
    assert.match(res.body, /Bác Ba Chủ Trọ/);
    assert.match(res.body, /0988776655/);
    assert.match(res.body, /Số 123 Đường Cầu Giấy/);
    assert.match(res.body, /Phòng trọ ban công thoáng mát Cầu Giấy/);
    assert.match(res.body, /3\.500\.000/);

    // Xác thực KHÔNG CÓ các thành phần chỉnh sửa (read-only tuyệt đối cho khách thuê)
    assert.doesNotMatch(res.body, /form.*action.*\/edit/i);
    assert.doesNotMatch(res.body, /avatar-file-input/i);
    assert.doesNotMatch(res.body, /change-password/i);
    assert.doesNotMatch(res.body, /Đổi mật khẩu/i);
  });

  test('Khách thuê truy cập /landlords/:id dạng JSON -> trả về 200 OK kèm dữ liệu chủ trọ và danh sách phòng', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    const landlord = await User.create({
      fullName: 'Cô Bảy Nhà Trọ (landlord-pub-test)',
      email: 'cobay@landlord-pub-test.tronest.com',
      password: passwordHash,
      phone: '0911223344',
      address: 'Bình Thạnh, TP.HCM',
      role: ROLES.LANDLORD,
      status: USER_STATUS.APPROVED
    });

    const client = new TestClient(baseUrl);
    const res = await client.get(`/landlords/${landlord._id}`, { wantsJson: true });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.equal(res.body.landlord.fullName, 'Cô Bảy Nhà Trọ (landlord-pub-test)');
    assert.equal(res.body.landlord.phone, '0911223344');
    assert.equal(typeof res.body.totalRooms, 'number');
    assert.ok(Array.isArray(res.body.rooms));
  });

  test('Báo lỗi 404 khi truy cập ID chủ trọ không hợp lệ hoặc không tồn tại', async () => {
    const client = new TestClient(baseUrl);

    // ID không đúng định dạng ObjectId
    const resInvalid = await client.get('/landlords/invalid-id-123', { wantsJson: true });
    assert.equal(resInvalid.status, 404);

    // ObjectId hợp lệ nhưng không có trong cơ sở dữ liệu
    const resNotFound = await client.get('/landlords/507f1f77bcf86cd799439011', {
      wantsJson: true
    });
    assert.equal(resNotFound.status, 404);
  });

  test('Không cho phép xem ID người dùng là Khách thuê (CUSTOMER) dưới danh nghĩa chủ trọ -> 404', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    const customer = await User.create({
      fullName: 'Khách Hàng (landlord-pub-test)',
      email: 'khachhang@landlord-pub-test.tronest.com',
      password: passwordHash,
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE
    });

    const client = new TestClient(baseUrl);
    const res = await client.get(`/landlords/${customer._id}`, { wantsJson: true });
    assert.equal(res.status, 404);
  });

  test('Trang chi tiết bài đăng phòng (/rooms/detail/:id) chứa liên kết dẫn tới hồ sơ chủ trọ (/landlords/:id)', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    const landlord = await User.create({
      fullName: 'Anh Năm Phòng Trọ (landlord-pub-test)',
      email: 'anhnam@landlord-pub-test.tronest.com',
      password: passwordHash,
      phone: '0977889900',
      role: ROLES.LANDLORD,
      status: USER_STATUS.APPROVED
    });

    const category = await Category.create({
      title: 'Chung cư mini (landlord-pub-test)',
      slug: 'chung-cu-mini-landlord-pub-test',
      status: USER_STATUS.ACTIVE
    });

    const room = await Room.create({
      title: 'Phòng trọ mini full đồ Đống Đa (landlord-pub-test)',
      price: 4200000,
      area: 32,
      address: 'Tôn Đức Thắng, Đống Đa, Hà Nội',
      categoryId: category._id,
      landlordId: landlord._id,
      status: ROOM_STATUS.APPROVED
    });

    const client = new TestClient(baseUrl);
    const res = await client.get(`/rooms/detail/${room._id}`, { wantsJson: false });

    assert.equal(res.status, 200);
    // Kiểm tra có link dẫn tới /landlords/:id của chủ trọ
    assert.match(res.body, new RegExp(`/landlords/${landlord._id}`));
    assert.match(res.body, /Xem thông tin chi tiết chủ trọ|Xem hồ sơ chủ trọ/);
  });

  test('Truy cập nhầm /landlord/:id (không có chữ s) tự động chuyển hướng 302 sang /landlords/:id', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    const landlord = await User.create({
      fullName: 'Chủ Trọ Test Redirect (landlord-pub-test)',
      email: 'redirect@landlord-pub-test.tronest.com',
      password: passwordHash,
      role: ROLES.LANDLORD,
      status: USER_STATUS.APPROVED
    });

    const client = new TestClient(baseUrl);
    const res = await client.get(`/landlord/${landlord._id}`, { wantsJson: false });

    assert.equal(res.status, 302);
    assert.equal(res.headers.get('location'), `/landlords/${landlord._id}`);
  });

  test('Xem được thông tin người đăng phòng khi tài khoản là Quản trị viên (ADMIN)', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    const admin = await User.create({
      fullName: 'Quản Trị Đăng Phòng (landlord-pub-test)',
      email: 'adminpost@landlord-pub-test.tronest.com',
      password: passwordHash,
      phone: '0900112233',
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE
    });

    const client = new TestClient(baseUrl);
    const res = await client.get(`/landlords/${admin._id}`, { wantsJson: true });

    assert.equal(res.status, 200);
    assert.equal(res.body.landlord.fullName, 'Quản Trị Đăng Phòng (landlord-pub-test)');
    assert.equal(res.body.landlord.phone, '0900112233');
  });
});
