const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const { startTestServer, stopTestServer, clearTestData } = require('./helpers/test-setup');
const { TestClient } = require('./helpers/test-client');
const User = require('../models/user.model');
const Room = require('../models/room.model');
const Category = require('../models/category.model');
const { ROLES, USER_STATUS } = require('../configs/system.config');

const sharp = require('sharp');

let baseUrl;

before(async () => {
  const serverInfo = await startTestServer();
  baseUrl = serverInfo.baseUrl;
});

after(async () => {
  await clearTestData('profile-test');
  await stopTestServer();
});

beforeEach(async () => {
  await clearTestData('profile-test');
});

describe('Xem & Quản Lý Thông Tin Cá Nhân Khách Hàng (Client Profile)', () => {
  test('Chưa đăng nhập truy cập /profile dạng HTML -> chuyển hướng đến trang /login', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.get('/profile', { wantsJson: false });

    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /\/login/);
  });

  test('Chưa đăng nhập truy cập /profile dạng JSON -> trả về mã 401 Unauthorized', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.get('/profile', { wantsJson: true });

    assert.equal(res.status, 401);
    assert.match(res.body.message, /Vui lòng đăng nhập/i);
  });

  test('Khách thuê (CUSTOMER) đăng nhập và xem thông tin cá nhân thành công (HTML & JSON)', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const customer = await User.create({
      fullName: 'Nguyễn Văn Khách',
      email: 'khachhang@profile-test.tronest.com',
      password: passwordHash,
      phone: '0987654321',
      address: 'Cầu Giấy, Hà Nội',
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE
    });

    const client = new TestClient(baseUrl);
    const loginRes = await client.post('/login', {
      email: customer.email,
      password: 'password123'
    });
    assert.equal(loginRes.status, 200);

    // 1. Kiểm tra xem HTML
    const htmlRes = await client.get('/profile', { wantsJson: false });
    assert.equal(htmlRes.status, 200);
    assert.match(htmlRes.body, /Thông tin cá nhân/);
    assert.match(htmlRes.body, /Nguyễn Văn Khách/);
    assert.match(htmlRes.body, /khachhang@profile-test\.tronest\.com/);
    assert.match(htmlRes.body, /0987654321/);
    assert.match(htmlRes.body, /Cầu Giấy, Hà Nội/);

    // 2. Kiểm tra xem JSON
    const jsonRes = await client.get('/profile', { wantsJson: true });
    assert.equal(jsonRes.status, 200);
    assert.equal(jsonRes.body.code, 200);
    assert.equal(jsonRes.body.user.fullName, 'Nguyễn Văn Khách');
    assert.equal(jsonRes.body.user.email, 'khachhang@profile-test.tronest.com');
    assert.equal(jsonRes.body.user.phone, '0987654321');
    assert.equal(jsonRes.body.user.address, 'Cầu Giấy, Hà Nội');
    assert.equal(jsonRes.body.user.role, ROLES.CUSTOMER);
    assert.equal(jsonRes.body.favoriteCount, 0);
  });

  test('Cập nhật thông tin cá nhân thành công (POST /profile/edit)', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const customer = await User.create({
      fullName: 'Khách Cũ',
      email: 'khachhang2@profile-test.tronest.com',
      password: passwordHash,
      phone: '0911111111',
      address: 'Đống Đa, Hà Nội',
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE
    });

    const client = new TestClient(baseUrl);
    await client.post('/login', {
      email: customer.email,
      password: 'password123'
    });

    const editRes = await client.post('/profile/edit', {
      fullName: 'Khách Mới Đã Đổi Tên',
      phone: '0988888888',
      address: 'Ba Đình, Hà Nội',
      facebook: 'https://facebook.com/khachmoi'
    });

    assert.equal(editRes.status, 200);
    assert.equal(editRes.body.code, 200);
    assert.equal(editRes.body.user.fullName, 'Khách Mới Đã Đổi Tên');
    assert.equal(editRes.body.user.phone, '0988888888');
    assert.equal(editRes.body.user.address, 'Ba Đình, Hà Nội');
    assert.equal(editRes.body.user.facebook, 'https://facebook.com/khachmoi');

    // Kiểm tra DB thực tế
    const updatedInDb = await User.findById(customer._id);
    assert.equal(updatedInDb.fullName, 'Khách Mới Đã Đổi Tên');
    assert.equal(updatedInDb.phone, '0988888888');
    assert.equal(updatedInDb.address, 'Ba Đình, Hà Nội');
    assert.equal(updatedInDb.facebook, 'https://facebook.com/khachmoi');

    // Kiểm tra HTML trang cá nhân render đúng thẻ <a> chuyển hướng sang Facebook với target="_blank"
    const profileHtmlRes = await client.get('/profile', { wantsJson: false });
    assert.equal(profileHtmlRes.status, 200);
    assert.match(profileHtmlRes.body, /id="profile-facebook-link"[^>]*href="https:\/\/facebook\.com\/khachmoi"/);
    assert.match(profileHtmlRes.body, /target="_blank"/);
    assert.match(profileHtmlRes.body, /rel="noopener noreferrer"/);
  });

  test('Thêm link Facebook dạng username hoặc domain không tiền tố -> chuẩn hóa href để click chuyển hướng sang Facebook', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const customer = await User.create({
      fullName: 'Khách Test Facebook',
      email: 'khachfb@profile-test.tronest.com',
      password: passwordHash,
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE
    });

    const client = new TestClient(baseUrl);
    await client.post('/login', {
      email: customer.email,
      password: 'password123'
    });

    // 1. Thêm dạng username thuần túy
    const editRes1 = await client.post('/profile/edit', {
      fullName: 'Khách Test Facebook',
      facebook: 'trungnguyen.profile'
    });
    assert.equal(editRes1.status, 200);

    const htmlRes1 = await client.get('/profile', { wantsJson: false });
    assert.equal(htmlRes1.status, 200);
    assert.match(htmlRes1.body, /href="https:\/\/facebook\.com\/trungnguyen\.profile"/);
    assert.match(htmlRes1.body, /target="_blank"/);

    // 2. Thêm dạng facebook.com/username
    const editRes2 = await client.post('/profile/edit', {
      fullName: 'Khách Test Facebook',
      facebook: 'facebook.com/trungnguyen.profile'
    });
    assert.equal(editRes2.status, 200);

    const htmlRes2 = await client.get('/profile', { wantsJson: false });
    assert.equal(htmlRes2.status, 200);
    assert.match(htmlRes2.body, /href="https:\/\/facebook\.com\/trungnguyen\.profile"/);
  });

  test('Tải lên ảnh đại diện từ máy tính thành công (POST /profile/avatar)', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const customer = await User.create({
      fullName: 'Khách Đổi Avatar',
      email: 'khachavatar@profile-test.tronest.com',
      password: passwordHash,
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE
    });

    const client = new TestClient(baseUrl);
    await client.post('/login', {
      email: customer.email,
      password: 'password123'
    });

    // Tạo buffer ảnh PNG thật 20x20 pixel bằng Sharp
    const pngBuffer = await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 4,
        background: { r: 234, g: 88, b: 12, alpha: 1 }
      }
    }).png().toBuffer();

    const formData = new FormData();
    const imageBlob = new Blob([pngBuffer], { type: 'image/png' });
    formData.append('avatar', imageBlob, 'my-avatar.png');

    const res = await client.post('/profile/avatar', formData);
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.ok(res.body.avatar);
    assert.match(res.body.avatar, /^\/uploads\/avatars\/avatar-[a-zA-Z0-9-]+\.webp$/);

    // Kiểm tra DB lưu đúng ảnh đại diện mới
    const userInDb = await User.findById(customer._id);
    assert.equal(userInDb.avatar, res.body.avatar);
  });

  test('Báo lỗi 400 khi cập nhật thông tin không hợp lệ', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const customer = await User.create({
      fullName: 'Khách Kiểm Tra',
      email: 'khachhang3@profile-test.tronest.com',
      password: passwordHash,
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE
    });

    const client = new TestClient(baseUrl);
    await client.post('/login', {
      email: customer.email,
      password: 'password123'
    });

    // Họ tên rỗng
    const resEmptyName = await client.post('/profile/edit', {
      fullName: '',
      phone: '0912345678'
    });
    assert.equal(resEmptyName.status, 400);

    // Số điện thoại không đúng định dạng
    const resBadPhone = await client.post('/profile/edit', {
      fullName: 'Tên Hợp Lệ',
      phone: '12345'
    });
    assert.equal(resBadPhone.status, 400);
    assert.match(resBadPhone.body.message, /số điện thoại không hợp lệ/i);
  });

  test('Đổi mật khẩu thành công và xác thực mật khẩu mới (POST /profile/change-password)', async () => {
    const passwordHash = await bcrypt.hash('oldPassword123', 10);
    const customer = await User.create({
      fullName: 'Khách Đổi Mật Khẩu',
      email: 'khachhang4@profile-test.tronest.com',
      password: passwordHash,
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE
    });

    const client = new TestClient(baseUrl);
    await client.post('/login', {
      email: customer.email,
      password: 'oldPassword123'
    });

    // 1. Thử đổi mật khẩu với mật khẩu cũ sai
    const resWrongOld = await client.post('/profile/change-password', {
      oldPassword: 'wrongPassword',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    });
    assert.equal(resWrongOld.status, 400);
    assert.match(resWrongOld.body.message, /không chính xác/i);

    // 2. Thử đổi mật khẩu với xác nhận không khớp
    const resMismatch = await client.post('/profile/change-password', {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'differentPassword'
    });
    assert.equal(resMismatch.status, 400);
    assert.match(resMismatch.body.message, /không khớp/i);

    // 3. Đổi mật khẩu hợp lệ
    const resSuccess = await client.post('/profile/change-password', {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    });
    assert.equal(resSuccess.status, 200);
    assert.equal(resSuccess.body.code, 200);

    // 4. Kiểm tra đăng nhập bằng mật khẩu mới
    const newClient = new TestClient(baseUrl);
    const newLoginRes = await newClient.post('/login', {
      email: customer.email,
      password: 'newPassword123'
    });
    assert.equal(newLoginRes.status, 200);
  });

  test('Chủ trọ (LANDLORD) đăng nhập và xem thông tin cá nhân thành công (HTML & JSON) kèm số phòng quản lý', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const landlord = await User.create({
      fullName: 'Trần Văn Chủ Trọ',
      email: 'chutro@profile-test.tronest.com',
      password: passwordHash,
      phone: '0933333333',
      address: 'Thanh Xuân, Hà Nội',
      role: ROLES.LANDLORD,
      status: USER_STATUS.APPROVED
    });

    const category = await Category.create({
      title: '[PROFILE-TEST] Phòng Trọ Landlord',
      slug: 'profile-test-phong-tro-landlord',
      status: USER_STATUS.ACTIVE
    });

    await Room.create({
      title: '[PROFILE-TEST] Phòng trọ 1',
      categoryId: category._id,
      landlordId: landlord._id,
      price: 3500000,
      area: 25,
      address: 'Số 10 Thanh Xuân, Hà Nội'
    });

    await Room.create({
      title: '[PROFILE-TEST] Phòng trọ 2',
      categoryId: category._id,
      landlordId: landlord._id,
      price: 4500000,
      area: 30,
      address: 'Số 12 Thanh Xuân, Hà Nội'
    });

    const client = new TestClient(baseUrl);
    const loginRes = await client.post('/login', {
      email: landlord.email,
      password: 'password123'
    });
    assert.equal(loginRes.status, 200);

    // 1. Kiểm tra HTML trên kênh chủ trọ (/landlord/profile)
    const htmlRes = await client.get('/landlord/profile', { wantsJson: false });
    assert.equal(htmlRes.status, 200);
    assert.match(htmlRes.body, /Trần Văn Chủ Trọ/);
    assert.match(htmlRes.body, /chutro@profile-test\.tronest\.com/);
    assert.match(htmlRes.body, /Chủ trọ cho thuê/);
    assert.match(htmlRes.body, /Hồ sơ chủ trọ/);
    assert.match(htmlRes.body, /Kênh Chủ Trọ/i);

    // 2. Kiểm tra JSON trên kênh chủ trọ (/landlord/profile)
    const jsonRes = await client.get('/landlord/profile', { wantsJson: true });
    assert.equal(jsonRes.status, 200);
    assert.equal(jsonRes.body.code, 200);
    assert.equal(jsonRes.body.user.fullName, 'Trần Văn Chủ Trọ');
    assert.equal(jsonRes.body.user.role, ROLES.LANDLORD);
    assert.equal(jsonRes.body.roomCount, 2);
  });

  test('Chủ trọ truy cập /profile dạng HTML tự động chuyển hướng sang /landlord/profile', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const landlord = await User.create({
      fullName: 'Chủ Trọ Redirect',
      email: 'redirect@profile-test.tronest.com',
      password: passwordHash,
      role: ROLES.LANDLORD,
      status: USER_STATUS.APPROVED
    });

    const client = new TestClient(baseUrl);
    await client.post('/login', {
      email: landlord.email,
      password: 'password123'
    });

    const res = await client.get('/profile', { wantsJson: false });
    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /\/landlord\/profile/);
  });

  test('Chủ trọ (LANDLORD) cập nhật thông tin cá nhân và link Facebook thành công (POST /landlord/profile/edit)', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const landlord = await User.create({
      fullName: 'Chủ Trọ Ban Đầu',
      email: 'chutroedit@profile-test.tronest.com',
      password: passwordHash,
      phone: '0944444444',
      role: ROLES.LANDLORD,
      status: USER_STATUS.APPROVED
    });

    const client = new TestClient(baseUrl);
    await client.post('/login', {
      email: landlord.email,
      password: 'password123'
    });

    const editRes = await client.post('/landlord/profile/edit', {
      fullName: 'Chủ Trọ Đã Đổi Tên',
      phone: '0955555555',
      address: 'Số 8 Hoàng Cầu, Hà Nội',
      facebook: 'chutro.facebook.profile'
    });

    assert.equal(editRes.status, 200);
    assert.equal(editRes.body.code, 200);
    assert.equal(editRes.body.user.fullName, 'Chủ Trọ Đã Đổi Tên');
    assert.equal(editRes.body.user.phone, '0955555555');
    assert.equal(editRes.body.user.address, 'Số 8 Hoàng Cầu, Hà Nội');
    assert.equal(editRes.body.user.facebook, 'chutro.facebook.profile');

    const updatedUser = await User.findById(landlord._id);
    assert.equal(updatedUser.fullName, 'Chủ Trọ Đã Đổi Tên');
    assert.equal(updatedUser.facebook, 'chutro.facebook.profile');
  });
});
