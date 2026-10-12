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
let customerClient;
let customerUser;
let landlordUser;
let catStudio;
let catMini;
let roomCheap;
let roomMid1;
let roomMid2;
let roomLuxury;
let roomPending;

before(async () => {
  const serverInfo = await startTestServer();
  baseUrl = serverInfo.baseUrl;
});

after(async () => {
  await clearTestData('fav-test');
  await stopTestServer();
});

beforeEach(async () => {
  await clearTestData('fav-test');

  const passwordHash = await bcrypt.hash('123456', 10);

  // Tạo tài khoản Khách thuê
  customerUser = await User.create({
    fullName: 'Khách Thuê Fav-Test',
    email: 'customer@fav-test.tronest.com',
    password: passwordHash,
    phone: '0977111222',
    role: ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE
  });

  // Tạo tài khoản Chủ trọ đã duyệt
  landlordUser = await User.create({
    fullName: 'Chủ Trọ Fav-Test',
    email: 'landlord@fav-test.tronest.com',
    password: passwordHash,
    phone: '0977333444',
    role: ROLES.LANDLORD,
    status: USER_STATUS.APPROVED
  });

  // Tạo 2 danh mục loại phòng
  catStudio = await Category.create({
    title: '[FAV-TEST] Studio Hiện Đại',
    slug: 'fav-test-studio-hien-dai',
    status: USER_STATUS.ACTIVE
  });

  catMini = await Category.create({
    title: '[FAV-TEST] Chung Cư Mini',
    slug: 'fav-test-chung-cu-mini',
    status: USER_STATUS.ACTIVE
  });

  // Tạo các phòng trọ với giá, diện tích, vị trí và view khác nhau để test bộ lọc
  // Room 1: 1.8M (<2m), 18m2 (<20), Hà Nội, Phường Ba Đình, Category Studio, views: 10
  roomCheap = await Room.create({
    title: '[FAV-TEST] Phòng trọ giá rẻ sinh viên Ba Đình',
    categoryId: catStudio._id,
    landlordId: landlordUser._id,
    price: 1800000,
    area: 18,
    province: 'Thành phố Hà Nội',
    ward: 'Phường Ba Đình',
    district: 'Ba Đình',
    address: 'Số 12 Đội Cấn',
    status: ROOM_STATUS.APPROVED,
    views: 10
  });

  // Room 2: 3.5M (2-4m), 25m2 (20-30), TP.HCM, Phường Bến Nghé, Category Studio, views: 40
  roomMid1 = await Room.create({
    title: '[FAV-TEST] Phòng studio tiện nghi Bến Nghé',
    categoryId: catStudio._id,
    landlordId: landlordUser._id,
    price: 3500000,
    area: 25,
    province: 'Thành phố Hồ Chí Minh',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    address: 'Số 45 Lê Duẩn',
    status: ROOM_STATUS.APPROVED,
    views: 40
  });

  // Room 3: 5.5M (4-7m), 38m2 (30-50), Hà Nội, Phường Dịch Vọng, Category Chung cư mini, views: 20
  roomMid2 = await Room.create({
    title: '[FAV-TEST] Chung cư mini rộng rãi Cầu Giấy',
    categoryId: catMini._id,
    landlordId: landlordUser._id,
    price: 5500000,
    area: 38,
    province: 'Thành phố Hà Nội',
    ward: 'Phường Dịch Vọng',
    district: 'Cầu Giấy',
    address: 'Số 68 Cầu Giấy',
    status: ROOM_STATUS.APPROVED,
    views: 20
  });

  // Room 4: 9.0M (>7m), 65m2 (>50), Đà Nẵng, Phường Hải Châu I, Category Chung cư mini, views: 80
  roomLuxury = await Room.create({
    title: '[FAV-TEST] Căn hộ cao cấp view biển Hải Châu',
    categoryId: catMini._id,
    landlordId: landlordUser._id,
    price: 9000000,
    area: 65,
    province: 'Thành phố Đà Nẵng',
    ward: 'Phường Hải Châu I',
    district: 'Hải Châu',
    address: 'Số 88 Bạch Đằng',
    status: ROOM_STATUS.APPROVED,
    views: 80
  });

  // Room 5: Phòng PENDING chưa duyệt (để test không cho thêm yêu thích / không hiện trên kết quả)
  roomPending = await Room.create({
    title: '[FAV-TEST] Phòng đang chờ duyệt bảo mật',
    categoryId: catStudio._id,
    landlordId: landlordUser._id,
    price: 2500000,
    area: 22,
    province: 'Thành phố Hà Nội',
    address: 'Số 1 Dịch Vọng Hậu',
    status: ROOM_STATUS.PENDING
  });

  // Đăng nhập tài khoản Khách thuê
  customerClient = new TestClient(baseUrl);
  await customerClient.post('/login', {
    email: 'customer@fav-test.tronest.com',
    password: '123456'
  });
});

describe('Quản Lý Danh Sách Yêu Thích (Favorite Management Flow)', () => {
  test('Khách vãng lai chưa đăng nhập bị chặn khi thêm yêu thích (Mã 401)', async () => {
    const guestClient = new TestClient(baseUrl);
    const res = await guestClient.post(`/favorites/add/${roomCheap._id}`, {}, { wantsJson: true });
    assert.equal(res.status, 401);
  });

  test('Báo lỗi 404 khi lưu phòng không tồn tại hoặc phòng chưa được phê duyệt', async () => {
    // 1. Thử lưu phòng chưa duyệt
    const pendingRes = await customerClient.post(`/favorites/add/${roomPending._id}`, {}, { wantsJson: true });
    assert.equal(pendingRes.status, 404);

    // 2. Thử lưu ID không tồn tại
    const fakeId = '507f1f77bcf86cd799439011';
    const fakeRes = await customerClient.post(`/favorites/add/${fakeId}`, {}, { wantsJson: true });
    assert.equal(fakeRes.status, 404);
  });

  test('Lưu phòng vào danh sách yêu thích thành công & Đảm bảo tính Idempotent (không bị lỗi trùng lặp)', async () => {
    // Lần 1: Lưu phòng
    const res1 = await customerClient.post(`/favorites/add/${roomCheap._id}`);
    assert.equal(res1.status, 200);
    assert.equal(res1.body.code, 200);
    assert.equal(res1.body.action, 'added');

    const favRecord = await Favorite.findOne({
      userId: customerUser._id,
      roomId: roomCheap._id
    });
    assert.ok(favRecord, 'Bản ghi yêu thích phải tồn tại trong database');

    // Lần 2: Thao tác lại cùng một phòng -> hệ thống upsert an toàn, không văng lỗi 11000
    const res2 = await customerClient.post(`/favorites/add/${roomCheap._id}`);
    assert.equal(res2.status, 200);
    assert.equal(res2.body.code, 200);
    assert.equal(res2.body.action, 'added');
  });

  test('Hiển thị phòng đã lưu trên trang Yêu thích (GET /favorites)', async () => {
    await customerClient.post(`/favorites/add/${roomCheap._id}`);
    await customerClient.post(`/favorites/add/${roomMid1._id}`);

    const res = await customerClient.get('/favorites', { wantsJson: false });
    assert.equal(res.status, 200);
    assert.match(res.body, /\[FAV-TEST\] Phòng trọ giá rẻ sinh viên Ba Đình/);
    assert.match(res.body, /\[FAV-TEST\] Phòng studio tiện nghi Bến Nghé/);
  });

  test('Bỏ lưu phòng khỏi danh sách yêu thích (POST /favorites/remove/:id)', async () => {
    // Lưu phòng trước
    await customerClient.post(`/favorites/add/${roomCheap._id}`);

    // Bỏ lưu phòng
    const removeRes = await customerClient.post(`/favorites/remove/${roomCheap._id}`);
    assert.equal(removeRes.status, 200);
    assert.equal(removeRes.body.code, 200);
    assert.equal(removeRes.body.action, 'removed');

    const favRecord = await Favorite.findOne({
      userId: customerUser._id,
      roomId: roomCheap._id
    });
    assert.equal(favRecord, null, 'Bản ghi yêu thích phải bị xóa');

    // Kiểm tra trang /favorites không còn phòng này
    const pageRes = await customerClient.get('/favorites', { wantsJson: false });
    assert.doesNotMatch(pageRes.body, /\[FAV-TEST\] Phòng trọ giá rẻ sinh viên Ba Đình/);
  });
});

let guestClient;

describe('Bộ Lọc Tìm Kiếm Nâng Cao & Chuẩn Hóa Hành Chính (Advanced Room Filters)', () => {
  beforeEach(() => {
    guestClient = new TestClient(baseUrl);
  });

  test('Lọc theo khoảng giá: <2m, 2-4m, 4-7m, >7m', async () => {
    // 1. Khoảng <2m (Dưới 2 triệu)
    const resLt2m = await guestClient.get('/rooms?priceRange=<2m', { wantsJson: false });
    assert.match(resLt2m.body, /Phòng trọ giá rẻ sinh viên Ba Đình/);
    assert.doesNotMatch(resLt2m.body, /Căn hộ cao cấp view biển Hải Châu/);

    // 2. Khoảng 2-4m (Từ 2 đến 4 triệu)
    const res2to4m = await guestClient.get('/rooms?priceRange=2-4m', { wantsJson: false });
    assert.match(res2to4m.body, /Phòng studio tiện nghi Bến Nghé/);
    assert.doesNotMatch(res2to4m.body, /Phòng trọ giá rẻ sinh viên Ba Đình/);

    // 3. Khoảng 4-7m (Từ 4 đến 7 triệu)
    const res4to7m = await guestClient.get('/rooms?priceRange=4-7m', { wantsJson: false });
    assert.match(res4to7m.body, /Chung cư mini rộng rãi Cầu Giấy/);
    assert.doesNotMatch(res4to7m.body, /Phòng studio tiện nghi Bến Nghé/);

    // 4. Khoảng >7m (Trên 7 triệu)
    const resGt7m = await guestClient.get('/rooms?priceRange=>7m', { wantsJson: false });
    assert.match(resGt7m.body, /Căn hộ cao cấp view biển Hải Châu/);
    assert.doesNotMatch(resGt7m.body, /Chung cư mini rộng rãi Cầu Giấy/);
  });

  test('Lọc theo diện tích: <20m², 20-30m², 30-50m², >50m²', async () => {
    // 1. <20m²
    const resLt20 = await guestClient.get('/rooms?areaRange=<20', { wantsJson: false });
    assert.match(resLt20.body, /Phòng trọ giá rẻ sinh viên Ba Đình/);
    assert.doesNotMatch(resLt20.body, /Căn hộ cao cấp view biển Hải Châu/);

    // 2. 20-30m²
    const res20to30 = await guestClient.get('/rooms?areaRange=20-30', { wantsJson: false });
    assert.match(res20to30.body, /Phòng studio tiện nghi Bến Nghé/);
    assert.doesNotMatch(res20to30.body, /Phòng trọ giá rẻ sinh viên Ba Đình/);

    // 3. 30-50m²
    const res30to50 = await guestClient.get('/rooms?areaRange=30-50', { wantsJson: false });
    assert.match(res30to50.body, /Chung cư mini rộng rãi Cầu Giấy/);

    // 4. >50m²
    const resGt50 = await guestClient.get('/rooms?areaRange=>50', { wantsJson: false });
    assert.match(resGt50.body, /Căn hộ cao cấp view biển Hải Châu/);
  });

  test('Lọc theo Tỉnh/Thành phố và Phường/Xã (hỗ trợ chuẩn hóa hành chính 2025)', async () => {
    // 1. Lọc theo tỉnh 'Hà Nội'
    const resHN = await guestClient.get('/rooms?province=Hà Nội', { wantsJson: false });
    assert.match(resHN.body, /Phòng trọ giá rẻ sinh viên Ba Đình/);
    assert.match(resHN.body, /Chung cư mini rộng rãi Cầu Giấy/);
    assert.doesNotMatch(resHN.body, /Phòng studio tiện nghi Bến Nghé/);
    assert.doesNotMatch(resHN.body, /Căn hộ cao cấp view biển Hải Châu/);

    // 2. Lọc theo phường 'Ba Đình' (hoặc 'Phường Ba Đình')
    const resWard = await guestClient.get('/rooms?province=Hà Nội&ward=Phường Ba Đình', { wantsJson: false });
    assert.match(resWard.body, /Phòng trọ giá rẻ sinh viên Ba Đình/);
    assert.doesNotMatch(resWard.body, /Chung cư mini rộng rãi Cầu Giấy/);
  });

  test('Lọc theo Danh mục (bằng Slug và bằng ObjectId)', async () => {
    // 1. Lọc theo Category Slug
    const resSlug = await guestClient.get(`/rooms?category=${catStudio.slug}`, { wantsJson: false });
    assert.match(resSlug.body, /Phòng trọ giá rẻ sinh viên Ba Đình/);
    assert.match(resSlug.body, /Phòng studio tiện nghi Bến Nghé/);
    assert.doesNotMatch(resSlug.body, /Chung cư mini rộng rãi Cầu Giấy/);

    // 2. Lọc theo Category ObjectId
    const resId = await guestClient.get(`/rooms?category=${catMini._id}`, { wantsJson: false });
    assert.match(resId.body, /Chung cư mini rộng rãi Cầu Giấy/);
    assert.match(resId.body, /Căn hộ cao cấp view biển Hải Châu/);
    assert.doesNotMatch(resId.body, /Phòng trọ giá rẻ sinh viên Ba Đình/);
  });

  test('Sắp xếp phòng trọ: Giá tăng dần, Giá giảm dần, Lượt xem nhiều nhất', async () => {
    // Giá tăng dần (price-asc): 1.8M -> 3.5M -> 5.5M -> 9M
    const resAsc = await guestClient.get('/rooms?sort=price-asc', { wantsJson: false });
    const idxCheapAsc = resAsc.body.indexOf('Phòng trọ giá rẻ sinh viên Ba Đình');
    const idxLuxAsc = resAsc.body.indexOf('Căn hộ cao cấp view biển Hải Châu');
    assert.ok(idxCheapAsc !== -1 && idxLuxAsc !== -1 && idxCheapAsc < idxLuxAsc, 'Giá rẻ phải đứng trước giá đắt');

    // Giá giảm dần (price-desc): 9M -> 5.5M -> 3.5M -> 1.8M
    const resDesc = await guestClient.get('/rooms?sort=price-desc', { wantsJson: false });
    const idxCheapDesc = resDesc.body.indexOf('Phòng trọ giá rẻ sinh viên Ba Đình');
    const idxLuxDesc = resDesc.body.indexOf('Căn hộ cao cấp view biển Hải Châu');
    assert.ok(idxLuxDesc < idxCheapDesc, 'Giá đắt phải đứng trước giá rẻ');

    // Lượt xem nhiều nhất (views-desc): Hải Châu (80 views) -> Bến Nghé (40 views) -> Cầu Giấy (20 views)
    const resViews = await guestClient.get('/rooms?sort=views-desc', { wantsJson: false });
    const idxLuxViews = resViews.body.indexOf('Căn hộ cao cấp view biển Hải Châu');
    const idxMidViews = resViews.body.indexOf('Phòng studio tiện nghi Bến Nghé');
    assert.ok(idxLuxViews < idxMidViews, 'Nhiều lượt xem hơn phải đứng trước');
  });
});
