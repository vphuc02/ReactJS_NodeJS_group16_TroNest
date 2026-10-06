require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Room = require('../models/room.model');
const Favorite = require('../models/favorite.model');
const { connectDB } = require('../configs/database.config');
const { ROLES, ROOM_STATUS, USER_STATUS } = require('../configs/system.config');

const seedData = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Refusing to run seed in production because it deletes existing data.');
    }

    if (!process.argv.includes('--reset')) {
      throw new Error('Seed deletes existing data. Use yarn seed --reset only against a development database.');
    }

    await connectDB();
    console.log('--- Đang xóa dữ liệu cũ để khởi tạo mới ---');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Room.deleteMany({});
    await Favorite.deleteMany({});

    const passwordHash = await bcrypt.hash('123456', 10);

    console.log('--- Đang tạo tài khoản người dùng ---');
    await User.create({
      fullName: 'Quản Trị Viên (Admin)',
      email: 'admin@tronest.com',
      password: passwordHash,
      phone: '0901234567',
      address: 'Hà Nội',
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
      avatar: '/admin/assets/images/avatar.jpg'
    });

    const landlordApproved = await User.create({
      fullName: 'Nguyễn Văn Việt (Chủ trọ)',
      email: 'chutro.viet@tronest.com',
      password: passwordHash,
      phone: '0987654321',
      address: 'Số 15 Cầu Giấy, Hà Nội',
      role: ROLES.LANDLORD,
      status: USER_STATUS.APPROVED,
      avatar: '/admin/assets/images/avatar.jpg'
    });

    await User.create({
      fullName: 'Trần Quang Hùng (Chủ trọ mới)',
      email: 'chutro.hung@tronest.com',
      password: passwordHash,
      phone: '0912345678',
      address: 'Số 88 Giải Phóng, Hai Bà Trưng, Hà Nội',
      role: ROLES.LANDLORD,
      status: USER_STATUS.PENDING,
      avatar: '/admin/assets/images/avatar.jpg'
    });

    const customer = await User.create({
      fullName: 'Lê Thị Mai (Khách thuê)',
      email: 'khachhang@tronest.com',
      password: passwordHash,
      phone: '0905123456',
      address: 'Thanh Xuân, Hà Nội',
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE,
      avatar: '/admin/assets/images/avatar.jpg'
    });

    console.log('--- Đang tạo danh mục phòng trọ ---');
    const catKhepKin = await Category.create({
      title: 'Phòng trọ khép kín',
      slug: 'phong-tro-khep-kin',
      description: 'Phòng trọ có vệ sinh riêng biệt, tiện nghi đầy đủ, giờ giấc tự do.',
      icon: 'fa-solid fa-door-closed',
      status: USER_STATUS.ACTIVE
    });

    const catStudio = await Category.create({
      title: 'Căn hộ mini / Studio',
      slug: 'can-ho-mini-studio',
      description: 'Phòng dạng studio đầy đủ nội thất cao cấp: bếp, ban công, máy giặt.',
      icon: 'fa-solid fa-building-user',
      status: USER_STATUS.ACTIVE
    });

    const catChungCuMini = await Category.create({
      title: 'Chung cư mini',
      slug: 'chung-cu-mini',
      description: 'Căn hộ chung cư mini 1-2 phòng ngủ, thang máy, bảo vệ 24/7.',
      icon: 'fa-solid fa-city',
      status: USER_STATUS.ACTIVE
    });

    const catKTX = await Category.create({
      title: 'Ký túc xá / Sleepbox',
      slug: 'ky-tuc-xa-sleepbox',
      description: 'Giường tầng cao cấp hoặc hộp ngủ riêng tư, đầy đủ máy lạnh, giá siêu tiết kiệm cho sinh viên.',
      icon: 'fa-solid fa-bed',
      status: USER_STATUS.ACTIVE
    });

    await Category.create({
      title: 'Nhà nguyên căn',
      slug: 'nha-nguyen-can',
      description: 'Nhà riêng nhiều tầng, thích hợp cho nhóm bạn hoặc hộ gia đình ở lâu dài.',
      icon: 'fa-solid fa-house-chimney',
      status: USER_STATUS.ACTIVE
    });

    console.log('--- Đang tạo các bài đăng phòng trọ ---');
    const rooms = await Room.create([
      // Bài APPROVED 1
      {
        title: 'Phòng trọ khép kín full nội thất gần ĐH Quốc Gia Cầu Giấy',
        slug: 'phong-tro-khep-kin-full-noi-that-cau-giay',
        categoryId: catKhepKin._id,
        landlordId: landlordApproved._id,
        price: 3500000,
        deposit: 3500000,
        area: 25,
        capacity: 2,
        province: 'Hà Nội',
        district: 'Cầu Giấy',
        ward: 'Dịch Vọng Hậu',
        address: 'Số 18, Ngõ 175 Xuân Thủy, Cầu Giấy, Hà Nội',
        thumbnail: '/client/assets/images/product-1.jpg',
        images: [
          '/client/assets/images/product-1.jpg',
          '/client/assets/images/product-2.jpg',
          '/client/assets/images/product-3.jpg'
        ],
        description: 'Phòng mới xây 100%, thoáng mát, có cửa sổ lớn đón ánh sáng tự nhiên. Đầy đủ: Điều hòa, bình nóng lạnh, giường đệm, tủ quần áo 3 cánh, bàn học. Ra cổng ĐHQG chỉ 200m, gần bến xe buýt, chợ Sinh Viên.',
        amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Tủ lạnh', 'Máy giặt', 'Chỗ để xe', 'Tự do giờ giấc', 'Camera an ninh'],
        electricityPrice: '3.800 đ/kWh',
        waterPrice: '30.000 đ/m³',
        servicePrice: '100.000 đ/tháng/người',
        status: ROOM_STATUS.APPROVED,
        views: 245,
        isFeatured: true
      },
      // Bài APPROVED 2
      {
        title: 'Studio ban công cực chill ngõ 102 Trường Chinh - Đống Đa',
        slug: 'studio-ban-cong-truong-chinh-dong-da',
        categoryId: catStudio._id,
        landlordId: landlordApproved._id,
        price: 5200000,
        deposit: 5200000,
        area: 32,
        capacity: 3,
        province: 'Hà Nội',
        district: 'Đống Đa',
        ward: 'Phương Mai',
        address: 'Số 25, Ngách 102/15 Trường Chinh, Đống Đa, Hà Nội',
        thumbnail: '/client/assets/images/product-2.jpg',
        images: [
          '/client/assets/images/product-2.jpg',
          '/client/assets/images/product-3.jpg',
          '/client/assets/images/product-1.jpg'
        ],
        description: 'Căn hộ Studio thoáng đãng với ban công ngập nắng, view cây xanh cực chill. Khu bếp riêng biệt có bếp từ, hút mùi, tủ bếp trên dưới. Vệ sinh khép kín vách kính sang trọng. Khóa vân tay, thang máy hiện đại.',
        amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Tủ lạnh', 'Máy giặt', 'Ban công', 'Thang máy', 'Khóa vân tay'],
        electricityPrice: '3.800 đ/kWh',
        waterPrice: '100.000 đ/người',
        servicePrice: '150.000 đ/phòng',
        status: ROOM_STATUS.APPROVED,
        views: 310,
        isFeatured: true
      },
      // Bài APPROVED 3
      {
        title: 'Chung cư mini 1 ngủ 1 khách cao cấp gần Mỹ Đình',
        slug: 'chung-cu-mini-1n1k-my-dinh',
        categoryId: catChungCuMini._id,
        landlordId: landlordApproved._id,
        price: 6500000,
        deposit: 6500000,
        area: 45,
        capacity: 4,
        province: 'Hà Nội',
        district: 'Nam Từ Liêm',
        ward: 'Mỹ Đình 1',
        address: 'Số 42 Đình Thôn, Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
        thumbnail: '/client/assets/images/product-3.jpg',
        images: [
          '/client/assets/images/product-3.jpg',
          '/client/assets/images/product-1.jpg',
          '/client/assets/images/product-2.jpg'
        ],
        description: 'Thiết kế hiện đại 1 phòng khách + 1 phòng ngủ riêng biệt. Ban công thoáng phơi đồ, máy giặt riêng. Khu vực an ninh cao, ngõ ô tô đỗ cửa, gần Keangnam và bến xe Mỹ Đình.',
        amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Tủ lạnh', 'Máy giặt', 'Chỗ để ô tô', 'Thang máy', 'Bảo vệ 24/7'],
        electricityPrice: '3.500 đ/kWh',
        waterPrice: '28.000 đ/m³',
        servicePrice: '120.000 đ/phòng',
        status: ROOM_STATUS.APPROVED,
        views: 180,
        isFeatured: false
      },
      // Bài APPROVED 4
      {
        title: 'Sleepbox cao cấp riêng tư, đầy đủ máy lạnh tại Bạch Mai',
        slug: 'sleepbox-cao-cap-bach-mai-hai-ba-trung',
        categoryId: catKTX._id,
        landlordId: landlordApproved._id,
        price: 1600000,
        deposit: 1000000,
        area: 12,
        capacity: 1,
        province: 'Hà Nội',
        district: 'Hai Bà Trưng',
        ward: 'Bạch Mai',
        address: 'Số 310 Bạch Mai, Hai Bà Trưng, Hà Nội',
        thumbnail: '/client/assets/images/banner-1.png',
        images: [
          '/client/assets/images/banner-1.png',
          '/client/assets/images/product-1.jpg'
        ],
        description: 'Mô hình Sleepbox riêng tư có cửa khóa riêng từng box, đèn đọc sách, bàn học gập thông minh, nệm êm ái. Giá đã bao gồm toàn bộ tiền điện, nước, điều hòa 24/24, wifi tốc độ cao. Gần ĐH Bách Khoa, Kinh Tế, Xây Dựng.',
        amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Máy giặt', 'Tủ lạnh chung', 'Bao trọn chi phí điện nước'],
        electricityPrice: 'Miễn phí',
        waterPrice: 'Miễn phí',
        servicePrice: 'Đã bao gồm',
        status: ROOM_STATUS.APPROVED,
        views: 420,
        isFeatured: true
      },
      // Bài PENDING 1 (Chờ duyệt)
      {
        title: 'Phòng trọ giá rẻ cho sinh viên gần ĐH Thương Mại',
        slug: 'phong-tro-gia-re-dai-hoc-thuong-mai',
        categoryId: catKhepKin._id,
        landlordId: landlordApproved._id,
        price: 2800000,
        deposit: 2800000,
        area: 20,
        capacity: 2,
        province: 'Hà Nội',
        district: 'Cầu Giấy',
        ward: 'Mai Dịch',
        address: 'Số 72 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy, Hà Nội',
        thumbnail: '/client/assets/images/product-2.jpg',
        images: ['/client/assets/images/product-2.jpg'],
        description: 'Phòng trọ khép kín, có gác xép lửng để đồ hoặc ngủ, ban công phơi đồ thoáng. Nằm ngay sau ĐH Thương Mại, đi bộ 3 phút.',
        amenities: ['Nóng lạnh', 'Wifi', 'Gác xép', 'Tự do giờ giấc'],
        electricityPrice: '4.000 đ/kWh',
        waterPrice: '35.000 đ/m³',
        servicePrice: '50.000 đ/tháng',
        status: ROOM_STATUS.PENDING,
        views: 12
      },
      // Bài PENDING 2 (Chờ duyệt)
      {
        title: 'Căn hộ mini 2 ngủ gia đình ngõ Nguyễn Trãi - Thanh Xuân',
        slug: 'can-ho-mini-2-ngu-nguyen-trai-thanh-xuan',
        categoryId: catChungCuMini._id,
        landlordId: landlordApproved._id,
        price: 7000000,
        deposit: 7000000,
        area: 50,
        capacity: 4,
        province: 'Hà Nội',
        district: 'Thanh Xuân',
        ward: 'Thanh Xuân Bắc',
        address: 'Ngõ 190 Nguyễn Trãi, Thanh Xuân, Hà Nội',
        thumbnail: '/client/assets/images/product-3.jpg',
        images: ['/client/assets/images/product-3.jpg'],
        description: 'Căn hộ 2 phòng ngủ riêng, 1 phòng khách và bếp. Đầy đủ tiện nghi: 2 điều hòa, tủ lạnh lớn, sofa, bàn ăn.',
        amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Tủ lạnh', 'Máy giặt', 'Thang máy'],
        electricityPrice: '3.600 đ/kWh',
        waterPrice: '30.000 đ/m³',
        servicePrice: '150.000 đ/phòng',
        status: ROOM_STATUS.PENDING,
        views: 5
      },
      // Bài DRAFT (Bản nháp của chủ trọ)
      {
        title: 'Phòng trọ cao cấp ngõ Chùa Láng - Đang chuẩn bị setup',
        slug: 'phong-tro-chua-lang-draft',
        categoryId: catKhepKin._id,
        landlordId: landlordApproved._id,
        price: 4000000,
        deposit: 4000000,
        area: 28,
        capacity: 2,
        province: 'Hà Nội',
        district: 'Đống Đa',
        ward: 'Láng Thượng',
        address: 'Ngõ 84 Chùa Láng, Đống Đa, Hà Nội',
        thumbnail: '/client/assets/images/product-1.jpg',
        images: ['/client/assets/images/product-1.jpg'],
        description: 'Bản thảo bài đăng phòng mới tại Chùa Láng, đang sửa chữa thêm sơn tường và lắp điều hòa mới.',
        amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi'],
        electricityPrice: '3.800 đ/kWh',
        waterPrice: '30.000 đ/m³',
        servicePrice: '100.000 đ/người',
        status: ROOM_STATUS.DRAFT,
        views: 0
      },
      // Bài REJECTED (Bị Admin từ chối kèm lý do)
      {
        title: 'Cho thuê phòng trọ giá siêu rẻ 1 triệu đồng',
        slug: 'phong-tro-gia-sieu-re-1-trieu',
        categoryId: catKhepKin._id,
        landlordId: landlordApproved._id,
        price: 1000000,
        deposit: 500000,
        area: 10,
        capacity: 1,
        province: 'Hà Nội',
        district: 'Cầu Giấy',
        ward: 'Nghĩa Đô',
        address: 'Khu vực Cầu Giấy (chưa rõ địa chỉ)',
        thumbnail: '/client/assets/images/product-2.jpg',
        images: ['/client/assets/images/product-2.jpg'],
        description: 'Phòng trọ giá rẻ nhất khu vực...',
        amenities: ['Wifi'],
        electricityPrice: 'Giá dân',
        waterPrice: 'Giá dân',
        servicePrice: '0',
        status: ROOM_STATUS.REJECTED,
        rejectReason: 'Địa chỉ bài đăng chưa cụ thể (thiếu số nhà, tên đường rõ ràng) và hình ảnh chưa rõ nét. Vui lòng cập nhật lại thông tin chính xác để được duyệt!',
        views: 3
      }
    ]);

    console.log('--- Đang tạo danh sách yêu thích mẫu ---');
    await Favorite.create({
      userId: customer._id,
      roomId: rooms[0]._id
    });

    console.log('=== SEED DỮ LIỆU THÀNH CÔNG ===');
    console.log('Tài khoản test:');
    console.log('1. Admin: admin@tronest.com / 123456');
    console.log('2. Chủ trọ đã duyệt: chutro.viet@tronest.com / 123456');
    console.log('3. Chủ trọ chờ duyệt: chutro.hung@tronest.com / 123456');
    console.log('4. Khách thuê: khachhang@tronest.com / 123456');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed data:', error);
    process.exit(1);
  }
};

seedData();
