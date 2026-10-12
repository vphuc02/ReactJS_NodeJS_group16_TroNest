const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const { startTestServer, stopTestServer, clearTestData } = require('./helpers/test-setup');
const { TestClient } = require('./helpers/test-client');
const User = require('../models/user.model');
const { ROLES, USER_STATUS } = require('../configs/system.config');

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
