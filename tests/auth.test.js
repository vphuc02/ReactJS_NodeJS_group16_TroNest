const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const { startTestServer, stopTestServer, clearTestData } = require('./helpers/test-setup');
const { TestClient } = require('./helpers/test-client');
const User = require('../models/user.model');
const { ROLES, USER_STATUS } = require('../configs/system.config');
const { setMockGoogleProfileResolver } = require('../helpers/google-oauth.helper');

let baseUrl;

before(async () => {
  const serverInfo = await startTestServer();
  baseUrl = serverInfo.baseUrl;
});

after(async () => {
  await clearTestData('auth-test');
  await stopTestServer();
});

beforeEach(async () => {
  await clearTestData('auth-test');
});

describe('Luồng Đăng Ký Tài Khoản (POST /register)', () => {
  test('Báo lỗi 400 khi thiếu thông tin bắt buộc (họ tên, email, mật khẩu)', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/register', {
      fullName: '',
      email: 'invalid-email',
      password: '123'
    });

    assert.equal(res.status, 400);
    assert.ok(res.body.message);
  });

  test('Báo lỗi 400 khi mật khẩu ngắn hơn 6 ký tự', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/register', {
      fullName: 'Nguyễn Văn Test',
      email: 'shortpass@auth-test.tronest.com',
      password: '123'
    });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /ít nhất 6 ký tự/i);
  });

  test('Đăng ký thành công tài khoản Khách thuê (CUSTOMER) -> status ACTIVE', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/register', {
      fullName: 'Khách Thuê Test',
      email: 'customer1@auth-test.tronest.com',
      password: 'password123',
      phone: '0912345678',
      role: ROLES.CUSTOMER
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.equal(res.body.role, ROLES.CUSTOMER);
    assert.equal(res.body.status, USER_STATUS.ACTIVE);

    const savedUser = await User.findOne({ email: 'customer1@auth-test.tronest.com' });
    assert.ok(savedUser);
    assert.equal(savedUser.role, ROLES.CUSTOMER);
    assert.equal(savedUser.status, USER_STATUS.ACTIVE);
    assert.equal(savedUser.isBlocked, false);
  });

  test('Đăng ký thành công tài khoản Chủ trọ (LANDLORD) -> status ban đầu là PENDING', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/register', {
      fullName: 'Chủ Trọ Test',
      email: 'landlord1@auth-test.tronest.com',
      password: 'password123',
      phone: '0987654321',
      role: ROLES.LANDLORD
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.equal(res.body.role, ROLES.LANDLORD);
    assert.equal(res.body.status, USER_STATUS.PENDING);

    const savedUser = await User.findOne({ email: 'landlord1@auth-test.tronest.com' });
    assert.ok(savedUser);
    assert.equal(savedUser.role, ROLES.LANDLORD);
    assert.equal(savedUser.status, USER_STATUS.PENDING);
  });

  test('Báo lỗi 400 khi đăng ký trùng email đã tồn tại', async () => {
    const client = new TestClient(baseUrl);
    await client.post('/register', {
      fullName: 'Người Dùng 1',
      email: 'duplicate@auth-test.tronest.com',
      password: 'password123'
    });

    const res2 = await client.post('/register', {
      fullName: 'Người Dùng 2',
      email: 'duplicate@auth-test.tronest.com',
      password: 'password123'
    });

    assert.equal(res2.status, 400);
    assert.match(res2.body.message, /đã được đăng ký/i);
  });
});

describe('Luồng Đăng Nhập Client (POST /login)', () => {
  beforeEach(async () => {
    const hash = await bcrypt.hash('123456', 10);
    await User.create([
      {
        fullName: 'Khách Thuê Thường',
        email: 'customer.login@auth-test.tronest.com',
        password: hash,
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE
      },
      {
        fullName: 'Chủ Trọ Đang Chờ Duyệt',
        email: 'landlord.pending@auth-test.tronest.com',
        password: hash,
        role: ROLES.LANDLORD,
        status: USER_STATUS.PENDING
      },
      {
        fullName: 'Tài Khoản Bị Khóa',
        email: 'blocked@auth-test.tronest.com',
        password: hash,
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE,
        isBlocked: true
      },
      {
        fullName: 'Quản Trị Viên',
        email: 'admin.auth@auth-test.tronest.com',
        password: hash,
        role: ROLES.ADMIN,
        status: USER_STATUS.ACTIVE
      }
    ]);
  });

  test('Báo lỗi 400 khi đăng nhập với mật khẩu sai', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/login', {
      email: 'customer.login@auth-test.tronest.com',
      password: 'wrongpassword'
    });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /không chính xác/i);
    assert.equal(client.cookies.has('token'), false);
  });

  test('Báo lỗi 400 khi email không tồn tại trong hệ thống', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/login', {
      email: 'nonexistent@auth-test.tronest.com',
      password: '123456'
    });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /không chính xác/i);
  });

  test('Chặn tài khoản Admin không được đăng nhập tại cổng Khách hàng (/login)', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/login', {
      email: 'admin.auth@auth-test.tronest.com',
      password: '123456'
    });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /không chính xác/i);
  });

  test('Chặn tài khoản bị khóa (isBlocked = true) đăng nhập (mã 403)', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/login', {
      email: 'blocked@auth-test.tronest.com',
      password: '123456'
    });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /đã bị khóa/i);
  });

  test('Đăng nhập thành công Khách thuê -> cấp cookie token hợp lệ và redirect /', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/login', {
      email: 'customer.login@auth-test.tronest.com',
      password: '123456'
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.equal(res.body.redirectUrl, '/');
    assert.ok(client.cookies.get('token'), 'Thiếu cookie token sau khi đăng nhập');
  });

  test('Đăng nhập thành công Chủ trọ chờ duyệt -> thông báo lưu ý tài khoản PENDING', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/login', {
      email: 'landlord.pending@auth-test.tronest.com',
      password: '123456'
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.match(res.body.message, /chờ Admin duyệt/i);
    assert.equal(res.body.redirectUrl, '/landlord/dashboard');
    assert.ok(client.cookies.get('token'));
  });
});

describe('Luồng Đăng Nhập Quản Trị Viên (POST /admin/login)', () => {
  beforeEach(async () => {
    const hash = await bcrypt.hash('123456', 10);
    await User.create([
      {
        fullName: 'Admin System',
        email: 'real.admin@auth-test.tronest.com',
        password: hash,
        role: ROLES.ADMIN,
        status: USER_STATUS.ACTIVE
      },
      {
        fullName: 'Khách Thuê Thường',
        email: 'normal.user@auth-test.tronest.com',
        password: hash,
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE
      }
    ]);
  });

  test('Từ chối người dùng thông thường cố tình đăng nhập cổng Admin', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/admin/login', {
      email: 'normal.user@auth-test.tronest.com',
      password: '123456'
    });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /không chính xác/i);
    assert.equal(client.cookies.has('token_admin'), false);
  });

  test('Admin đăng nhập thành công -> cấp cookie token_admin', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/admin/login', {
      email: 'real.admin@auth-test.tronest.com',
      password: '123456'
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.ok(client.cookies.get('token_admin'), 'Thiếu cookie token_admin');
  });
});

describe('Luồng Đăng Xuất (POST /logout & POST /admin/logout)', () => {
  test('Đăng xuất phía Client xóa cookie token', async () => {
    const client = new TestClient(baseUrl);
    client.cookies.set('token', 'fake-jwt-token');

    const res = await client.post('/logout');
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.equal(client.cookies.has('token'), false, 'Cookie token chưa được xóa sạch');
  });

  test('Đăng xuất phía Admin xóa cookie token_admin', async () => {
    const client = new TestClient(baseUrl);
    client.cookies.set('token_admin', 'fake-admin-jwt-token');

    const res = await client.post('/admin/logout');
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.equal(client.cookies.has('token_admin'), false, 'Cookie token_admin chưa được xóa sạch');
  });
});

describe('Bảo Vệ Endpoint & Phân Quyền (RBAC)', () => {
  let customerClient;
  let adminClient;

  beforeEach(async () => {
    const hash = await bcrypt.hash('123456', 10);
    await User.create([
      {
        fullName: 'RBAC Customer',
        email: 'rbac.customer@auth-test.tronest.com',
        password: hash,
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE
      },
      {
        fullName: 'RBAC Admin',
        email: 'rbac.admin@auth-test.tronest.com',
        password: hash,
        role: ROLES.ADMIN,
        status: USER_STATUS.ACTIVE
      }
    ]);

    customerClient = new TestClient(baseUrl);
    await customerClient.post('/login', {
      email: 'rbac.customer@auth-test.tronest.com',
      password: '123456'
    });

    adminClient = new TestClient(baseUrl);
    await adminClient.post('/admin/login', {
      email: 'rbac.admin@auth-test.tronest.com',
      password: '123456'
    });
  });

  test('Chưa đăng nhập truy cập /favorites -> trả về lỗi 401 khi yêu cầu JSON', async () => {
    const guestClient = new TestClient(baseUrl);
    const res = await guestClient.get('/favorites', { wantsJson: true });
    assert.equal(res.status, 401);
  });

  test('Khách thuê truy cập /landlord/rooms -> trả về lỗi 403 (không đủ thẩm quyền)', async () => {
    const res = await customerClient.get('/landlord/rooms', { wantsJson: true });
    assert.equal(res.status, 403);
  });

  test('Chưa đăng nhập admin truy cập /admin/dashboard -> trả về lỗi 401', async () => {
    const guestClient = new TestClient(baseUrl);
    const res = await guestClient.get('/admin/dashboard', { wantsJson: true });
    assert.equal(res.status, 401);
  });

  test('Admin đăng nhập hợp lệ truy cập /admin/dashboard -> thành công', async () => {
    const res = await adminClient.get('/admin/dashboard', { wantsJson: false });
    assert.equal(res.status, 200);
  });
});

describe('Luồng Quên Mật Khẩu & Đặt Lại Mật Khẩu Bằng OTP (Forgot Password)', () => {
  beforeEach(async () => {
    const hash = await bcrypt.hash('oldpassword123', 10);
    await User.create([
      {
        fullName: 'Khách Quên Mật Khẩu',
        email: 'forgot.user@auth-test.tronest.com',
        password: hash,
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE
      },
      {
        fullName: 'Khách Bị Khóa',
        email: 'forgot.blocked@auth-test.tronest.com',
        password: hash,
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE,
        isBlocked: true
      }
    ]);
  });

  test('Hiển thị trang Quên mật khẩu (GET /forgot-password)', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.get('/forgot-password', { wantsJson: false });
    assert.equal(res.status, 200);
    assert.match(res.body, /Khôi phục mật khẩu/i);
  });

  test('Báo lỗi 404 khi yêu cầu OTP cho email chưa đăng ký', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/forgot-password', {
      email: 'notfound@auth-test.tronest.com'
    });

    assert.equal(res.status, 404);
    assert.match(res.body.message, /Không tìm thấy tài khoản/i);
  });

  test('Chặn yêu cầu OTP cho tài khoản đã bị khóa (Mã 403)', async () => {
    const client = new TestClient(baseUrl);
    const res = await client.post('/forgot-password', {
      email: 'forgot.blocked@auth-test.tronest.com'
    });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /đã bị khóa/i);
  });

  test('Chặn brute-force OTP sau 5 lần nhập sai liên tiếp', async () => {
    const client = new TestClient(baseUrl);
    const reqRes = await client.post('/forgot-password', {
      email: 'forgot.user@auth-test.tronest.com'
    });
    assert.equal(reqRes.status, 200);

    for (let i = 1; i <= 5; i++) {
      const wrongRes = await client.post('/forgot-password/verify-otp', {
        email: 'forgot.user@auth-test.tronest.com',
        otp: '000000'
      });
      assert.equal(wrongRes.status, 400);
    }

    // Lần thứ 6 kể cả nhập đúng OTP cũ cũng bị từ chối vì bản ghi OTP đã bị hủy
    const afterLockRes = await client.post('/forgot-password/verify-otp', {
      email: 'forgot.user@auth-test.tronest.com',
      otp: reqRes.body.devOtp
    });
    assert.equal(afterLockRes.status, 400);
    assert.match(afterLockRes.body.message, /hết hạn hoặc không tồn tại/i);
  });

  test('Hoàn tất luồng 3 bước: Nhận OTP -> Xác thực OTP -> Đặt mật khẩu mới và Đăng nhập thành công', async () => {
    const client = new TestClient(baseUrl);

    // Bước 1: Gửi yêu cầu OTP
    const step1 = await client.post('/forgot-password', {
      email: 'forgot.user@auth-test.tronest.com'
    });
    assert.equal(step1.status, 200);
    assert.equal(step1.body.code, 200);
    assert.match(step1.body.devOtp, /^[0-9]{6}$/);

    // Bước 2: Xác thực OTP
    const step2 = await client.post('/forgot-password/verify-otp', {
      email: 'forgot.user@auth-test.tronest.com',
      otp: step1.body.devOtp
    });
    assert.equal(step2.status, 200);
    assert.equal(step2.body.code, 200);
    assert.ok(step2.body.resetToken);

    // Bước 3: Đặt mật khẩu mới
    const step3 = await client.post('/forgot-password/reset-password', {
      email: 'forgot.user@auth-test.tronest.com',
      resetToken: step2.body.resetToken,
      password: 'newpassword999',
      confirmPassword: 'newpassword999'
    });
    assert.equal(step3.status, 200);
    assert.equal(step3.body.code, 200);
    assert.equal(step3.body.redirectUrl, '/login');

    // Kiểm tra đăng nhập bằng mật khẩu cũ phải thất bại
    const oldLogin = await client.post('/login', {
      email: 'forgot.user@auth-test.tronest.com',
      password: 'oldpassword123'
    });
    assert.equal(oldLogin.status, 400);

    // Kiểm tra đăng nhập bằng mật khẩu mới thành công
    const newLogin = await client.post('/login', {
      email: 'forgot.user@auth-test.tronest.com',
      password: 'newpassword999'
    });
    assert.equal(newLogin.status, 200);
    assert.ok(client.cookies.get('token'));
  });
});

describe('Luồng Đăng Nhập & Đăng Ký Bằng Google OAuth 2.0 (/auth/google)', () => {
  after(() => {
    setMockGoogleProfileResolver(null);
  });

  test('Khởi tạo Google OAuth (GET /auth/google) -> cấp cookie state và redirect sang Google', async () => {
    setMockGoogleProfileResolver(async () => ({}));
    const client = new TestClient(baseUrl);
    const res = await client.get('/auth/google', { wantsJson: false });

    assert.equal(res.status, 302);
    const location = res.headers.get('location') || '';
    assert.match(location, /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth/);
    assert.ok(client.cookies.get('google_oauth_state'), 'Thiếu cookie google_oauth_state');
  });

  test('Chặn callback khi CSRF state không khớp', async () => {
    setMockGoogleProfileResolver(async () => ({
      sub: 'google-123',
      email: 'csrf.google@auth-test.tronest.com',
      email_verified: true,
      name: 'CSRF Google'
    }));

    const client = new TestClient(baseUrl);
    await client.get('/auth/google', { wantsJson: false });

    const cbRes = await client.get('/auth/google/callback?code=fake-code&state=wrong-state', {
      wantsJson: false
    });
    assert.equal(cbRes.status, 302);
    assert.match(cbRes.headers.get('location') || '', /^\/login\?error=/);
    assert.equal(client.cookies.has('token'), false);
  });

  test('Người dùng mới đăng nhập Google mặc định -> tạo tài khoản CUSTOMER (ACTIVE) và cấp token', async () => {
    setMockGoogleProfileResolver(async () => ({
      sub: 'google-sub-customer-001',
      email: 'new.google.customer@auth-test.tronest.com',
      email_verified: true,
      name: 'Google Khách Thuê',
      picture: 'https://lh3.googleusercontent.com/a/default-user'
    }));

    const client = new TestClient(baseUrl);
    const startRes = await client.get('/auth/google', { wantsJson: false });
    const redirectUrl = new URL(startRes.headers.get('location'));
    const state = redirectUrl.searchParams.get('state');

    const cbRes = await client.get(
      `/auth/google/callback?code=valid-google-code&state=${encodeURIComponent(state)}`,
      { wantsJson: false }
    );

    assert.equal(cbRes.status, 302);
    assert.equal(cbRes.headers.get('location'), '/');
    assert.ok(client.cookies.get('token'));

    const createdUser = await User.findOne({ email: 'new.google.customer@auth-test.tronest.com' });
    assert.ok(createdUser);
    assert.equal(createdUser.role, ROLES.CUSTOMER);
    assert.equal(createdUser.status, USER_STATUS.ACTIVE);
    assert.equal(createdUser.authProvider, 'google');
    assert.equal(createdUser.googleId, 'google-sub-customer-001');
  });

  test('Người dùng mới chọn tab Chủ trọ (/auth/google?role=LANDLORD) -> tạo tài khoản LANDLORD (PENDING)', async () => {
    setMockGoogleProfileResolver(async () => ({
      sub: 'google-sub-landlord-002',
      email: 'new.google.landlord@auth-test.tronest.com',
      email_verified: true,
      name: 'Google Chủ Trọ'
    }));

    const client = new TestClient(baseUrl);
    const startRes = await client.get('/auth/google?role=LANDLORD', { wantsJson: false });
    const redirectUrl = new URL(startRes.headers.get('location'));
    const state = redirectUrl.searchParams.get('state');

    const cbRes = await client.get(
      `/auth/google/callback?code=valid-landlord-code&state=${encodeURIComponent(state)}`,
      { wantsJson: false }
    );

    assert.equal(cbRes.status, 302);
    assert.equal(cbRes.headers.get('location'), '/landlord/dashboard');
    assert.ok(client.cookies.get('token'));

    const createdLandlord = await User.findOne({ email: 'new.google.landlord@auth-test.tronest.com' });
    assert.ok(createdLandlord);
    assert.equal(createdLandlord.role, ROLES.LANDLORD);
    assert.equal(createdLandlord.status, USER_STATUS.PENDING);
    assert.equal(createdLandlord.googleId, 'google-sub-landlord-002');
  });
});
