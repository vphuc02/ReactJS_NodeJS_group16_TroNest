const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const { startTestServer, stopTestServer, clearTestData } = require('./helpers/test-setup');
const { TestClient } = require('./helpers/test-client');
const User = require('../models/user.model');
const { ROLES, USER_STATUS } = require('../configs/system.config');
const {
  isSafeLocalRedirect,
  getSafeRedirect,
  escapeRegex,
  jsonForInlineScript,
  isSafeStoredImagePath,
  getImageExtension
} = require('../helpers/security.helper');
const { queryText, queryPage, pagination } = require('../helpers/query.helper');

let baseUrl;
let landlordClient;
let landlordUser;
const uploadedFilesToCleanup = [];

before(async () => {
  const serverInfo = await startTestServer();
  baseUrl = serverInfo.baseUrl;
});

after(async () => {
  await clearTestData('sec-test');
  // Dọn dẹp bất kỳ tệp webp test nào được sinh ra trong quá trình upload
  const uploadsDir = path.join(__dirname, '../public/uploads/rooms');
  for (const file of uploadedFilesToCleanup) {
    await fs.unlink(path.join(uploadsDir, path.basename(file))).catch(() => {});
  }
  await stopTestServer();
});

beforeEach(async () => {
  await clearTestData('sec-test');

  const passwordHash = await bcrypt.hash('123456', 10);
  landlordUser = await User.create({
    fullName: 'Chủ Trọ Upload-Test',
    email: 'landlord@sec-test.tronest.com',
    password: passwordHash,
    phone: '0966555888',
    role: ROLES.LANDLORD,
    status: USER_STATUS.APPROVED
  });

  landlordClient = new TestClient(baseUrl);
  await landlordClient.post('/login', {
    email: landlordUser.email,
    password: '123456'
  });
});

describe('Chống Open Redirect & Xác Thực URL An Toàn (Security Helpers)', () => {
  test('Chấp nhận các đường dẫn nội bộ hợp lệ', () => {
    assert.equal(isSafeLocalRedirect('/'), true);
    assert.equal(isSafeLocalRedirect('/rooms'), true);
    assert.equal(isSafeLocalRedirect('/rooms/detail/650000000000000000000001'), true);
    assert.equal(isSafeLocalRedirect('/landlord/rooms/create'), true);
    assert.equal(isSafeLocalRedirect('/login?redirect=/favorites'), true);
  });

  test('Chặn đứng toàn bộ các vector tấn công Open Redirect phổ biến', () => {
    // Protocol-relative URLs
    assert.equal(isSafeLocalRedirect('//attacker.com'), false);
    assert.equal(isSafeLocalRedirect('//attacker.com/exploit'), false);

    // Backslash bypasses
    assert.equal(isSafeLocalRedirect('/\\attacker.com'), false);
    assert.equal(isSafeLocalRedirect('\\attacker.com'), false);
    assert.equal(isSafeLocalRedirect('/%5cattacker.com'), false);
    assert.equal(isSafeLocalRedirect('/%2f/attacker.com'), false);

    // Absolute URLs
    assert.equal(isSafeLocalRedirect('http://attacker.com'), false);
    assert.equal(isSafeLocalRedirect('https://google.com'), false);

    // JavaScript / Data schemes
    assert.equal(isSafeLocalRedirect('javascript:alert(1)'), false);
    assert.equal(isSafeLocalRedirect('data:text/html,<script>alert(1)</script>'), false);

    // Null/undefined/empty
    assert.equal(isSafeLocalRedirect(''), false);
    assert.equal(isSafeLocalRedirect('   '), false);
    assert.equal(isSafeLocalRedirect(null), false);
    assert.equal(isSafeLocalRedirect(undefined), false);
  });

  test('getSafeRedirect trả về URL hợp lệ hoặc fallback khi phát hiện nguy cơ', () => {
    assert.equal(getSafeRedirect('/rooms', '/'), '/rooms');
    assert.equal(getSafeRedirect('//evil.com', '/'), '/');
    assert.equal(getSafeRedirect('javascript:alert(1)', '/fallback'), '/fallback');
  });
});

describe('Chống Regex Injection & XSS & Kiểm Tra Đường Dẫn File (Sanitization)', () => {
  test('escapeRegex vô hiệu hóa các ký tự đặc biệt của regex, ngăn chặn lỗi ReDoS', () => {
    const maliciousInput = '.*+?^${}()|[]\\test';
    const escaped = escapeRegex(maliciousInput);
    // Tạo regex từ chuỗi đã escape không được văng lỗi
    const regex = new RegExp(escaped);
    assert.ok(regex.test(maliciousInput), 'Phải khớp đúng chuỗi nguyên bản');
    assert.equal(regex.test('arbitrary_string'), false);
  });

  test('jsonForInlineScript chuyển đổi thẻ < thành \\u003c để chống XSS breakout', () => {
    const payload = { input: '</script><script>alert("xss")</script>' };
    const safeString = jsonForInlineScript(payload);
    assert.equal(safeString.includes('<'), false, 'Không được chứa ký tự < trần');
    assert.match(safeString, /\\u003c/);
  });

  test('isSafeStoredImagePath chỉ chấp nhận đường dẫn ảnh hợp lệ trong phạm vi cho phép', () => {
    // Hợp lệ
    assert.equal(isSafeStoredImagePath('/uploads/rooms/room-123-abc.webp'), true);
    assert.equal(isSafeStoredImagePath('/uploads/rooms/room-xyz.jpg'), true);
    assert.equal(isSafeStoredImagePath('/client/assets/images/default.png'), true);

    // Bất hợp lệ (Path traversal, file script, định dạng cấm)
    assert.equal(isSafeStoredImagePath('../../etc/passwd'), false);
    assert.equal(isSafeStoredImagePath('/uploads/rooms/shell.php'), false);
    assert.equal(isSafeStoredImagePath('/uploads/rooms/script.js'), false);
    assert.equal(isSafeStoredImagePath('/uploads/rooms/room-123.svg'), false);
    assert.equal(isSafeStoredImagePath('/etc/shadow'), false);
  });

  test('getImageExtension kiểm tra khớp đôi giữa mimetype và phần mở rộng', () => {
    assert.equal(getImageExtension({ originalname: 'avatar.jpg', mimetype: 'image/jpeg' }), '.jpg');
    assert.equal(getImageExtension({ originalname: 'photo.png', mimetype: 'image/png' }), '.png');
    assert.equal(getImageExtension({ originalname: 'image.webp', mimetype: 'image/webp' }), '.webp');

    // Giả mạo phần mở rộng (mime không khớp extension)
    assert.equal(getImageExtension({ originalname: 'trojan.exe', mimetype: 'image/jpeg' }), null);
    assert.equal(getImageExtension({ originalname: 'script.php', mimetype: 'application/x-php' }), null);
  });
});

describe('Xử Lý Tham Số Truy Vấn & Phân Trang (Query Helpers)', () => {
  test('queryText cắt khoảng trắng và giới hạn độ dài an toàn', () => {
    assert.equal(queryText('  Ba Đình  '), 'Ba Đình');
    assert.equal(queryText(undefined), '');

    assert.throws(() => {
      queryText('a'.repeat(201)); // Vượt quá 200 ký tự
    }, /Tham số tìm kiếm không hợp lệ/);

    assert.throws(() => {
      queryText(12345); // Không phải string
    }, /Tham số tìm kiếm không hợp lệ/);
  });

  test('queryPage kiểm tra số trang hợp lệ và chặn số âm / ký tự bất thường', () => {
    assert.equal(queryPage(undefined), 1);
    assert.equal(queryPage(''), 1);
    assert.equal(queryPage('3'), 3);

    assert.throws(() => queryPage('0'), /Số trang phải là số nguyên dương hợp lệ/);
    assert.throws(() => queryPage('-5'), /Số trang phải là số nguyên dương hợp lệ/);
    assert.throws(() => queryPage('abc'), /Số trang phải là số nguyên dương hợp lệ/);
  });

  test('pagination tính toán skip, limit và giới hạn trang tối đa', () => {
    // 45 bản ghi, limit 20
    const page1 = pagination(45, 1, 20);
    assert.equal(page1.totalPages, 3);
    assert.equal(page1.currentPage, 1);
    assert.equal(page1.skip, 0);

    const page2 = pagination(45, 2, 20);
    assert.equal(page2.currentPage, 2);
    assert.equal(page2.skip, 20);

    // Yêu cầu trang 99 nhưng chỉ có 3 trang -> kẹp về trang 3
    const pageExceeded = pagination(45, 99, 20);
    assert.equal(pageExceeded.currentPage, 3);
  });
});

describe('Tải Lên Hình Ảnh & Xử Lý Định Dạng Sharp (Upload Middleware Integration)', () => {
  test('Báo lỗi 400 khi gọi endpoint upload mà không đính kèm tệp nào', async () => {
    const res = await landlordClient.post('/landlord/rooms/upload-images');
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 400);
    assert.match(res.body.message, /Vui lòng chọn ít nhất một hình ảnh để tải lên/);
  });

  test('Từ chối tệp không phải ảnh (chỉ chấp nhận jpg, jpeg, png, webp, gif)', async () => {
    const formData = new FormData();
    const textBlob = new Blob(['console.log("hello");'], { type: 'text/plain' });
    formData.append('images', textBlob, 'script.txt');

    const res = await landlordClient.post('/landlord/rooms/upload-images', formData);
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Chỉ chấp nhận ảnh jpg, jpeg, png, webp, gif/);
  });

  test('Tải lên thành công ảnh thật -> Tự động nén và chuyển đổi sang định dạng .webp chuẩn', async () => {
    // Tạo 1 buffer ảnh PNG thật 10x10 pixel bằng Sharp
    const pngBuffer = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 4,
        background: { r: 0, g: 150, b: 255, alpha: 1 }
      }
    }).png().toBuffer();

    const formData = new FormData();
    const imageBlob = new Blob([pngBuffer], { type: 'image/png' });
    formData.append('images', imageBlob, 'room-test-photo.png');

    const res = await landlordClient.post('/landlord/rooms/upload-images', formData);
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 200);
    assert.ok(Array.isArray(res.body.urls) && res.body.urls.length === 1);

    const uploadedUrl = res.body.urls[0];
    uploadedFilesToCleanup.push(uploadedUrl);

    // Xác nhận file sinh ra có đuôi .webp và có prefix room-<userId>
    assert.match(uploadedUrl, /^\/uploads\/rooms\/room-[a-zA-Z0-9-]+[a-zA-Z0-9-]+\.webp$/);

    // Xác nhận file thực sự tồn tại trên ổ cứng
    const localFilePath = path.join(__dirname, '../public', uploadedUrl);
    const stat = await fs.stat(localFilePath);
    assert.ok(stat.size > 0, 'Tệp tải lên phải có dung lượng lớn hơn 0');
  });
});

describe('Xử Lý Lỗi Tập Trung & Trang 404 (Error Handling Middleware)', () => {
  let guestClient;
  let adminClient;

  beforeEach(async () => {
    guestClient = new TestClient(baseUrl);

    // Tạo admin để kiểm tra 404 admin
    const passwordHash = await bcrypt.hash('123456', 10);
    await User.create({
      fullName: 'Admin Error Test',
      email: 'admin.error@sec-test.tronest.com',
      password: passwordHash,
      phone: '0966999111',
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE
    });

    adminClient = new TestClient(baseUrl);
    await adminClient.post('/admin/login', {
      email: 'admin.error@sec-test.tronest.com',
      password: '123456'
    });
  });

  test('Truy cập endpoint không tồn tại với yêu cầu JSON trả về 404 JSON', async () => {
    const res = await guestClient.get('/api/not-found-endpoint', { wantsJson: true });
    assert.equal(res.status, 404);
    assert.equal(res.body.code, 404);
    assert.match(res.body.message, /không tồn tại hoặc đã được chuyển hướng/);
  });

  test('Truy cập trang không tồn tại bằng trình duyệt (HTML) trả về trang 404 Client', async () => {
    const res = await guestClient.get('/not-found-page', { wantsJson: false });
    assert.equal(res.status, 404);
    assert.match(res.body, /404 - Không tìm thấy trang/);
  });

  test('Truy cập trang quản trị không tồn tại trả về trang 404 của Admin', async () => {
    const res = await adminClient.get('/admin/non-existent-panel', { wantsJson: false });
    assert.equal(res.status, 404);
    assert.match(res.body, /404 Not Found/);
  });

  test('Mongoose CastError (ObjectId không đúng định dạng) được bắt thành 404 chuẩn', async () => {
    const res = await guestClient.get('/rooms/detail/invalid-mongodb-object-id', { wantsJson: true });
    assert.equal(res.status, 404);
    assert.equal(res.body.code, 404);
  });
});
