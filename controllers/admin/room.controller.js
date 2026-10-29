const mongoose = require('mongoose');
const Room = require('../../models/room.model');
const User = require('../../models/user.model');
const { ROOM_STATUS, ROLES } = require('../../configs/system.config');
const { escapeRegex } = require('../../helpers/security.helper');
const { AppError } = require('../../helpers/error.helper');
const { removeUnreferencedImages } = require('../../helpers/room.helper');
const { queryText, queryPage, pagination } = require('../../helpers/query.helper');
const Favorite = require('../../models/favorite.model');

// [GET] /admin/rooms
module.exports.index = async (req, res) => {
  const status = queryText(req.query.status);
  const keyword = queryText(req.query.keyword);
  const page = queryPage(req.query.page);

  const filter = {};
  if (status && Object.values(ROOM_STATUS).includes(status)) {
    filter.status = status;
  }
  if (keyword && keyword.trim() !== '') {
    const safeKeyword = escapeRegex(keyword.trim());
    const matchedLandlords = await User.find({
      role: ROLES.LANDLORD,
      $or: [
        { fullName: { $regex: safeKeyword, $options: 'i' } },
        { phone: { $regex: safeKeyword, $options: 'i' } },
        { email: { $regex: safeKeyword, $options: 'i' } }
      ]
    }).select('_id').lean();
    const landlordIds = matchedLandlords.map((l) => l._id);

    filter.$or = [
      { title: { $regex: safeKeyword, $options: 'i' } },
      { address: { $regex: safeKeyword, $options: 'i' } },
      { district: { $regex: safeKeyword, $options: 'i' } },
      { ward: { $regex: safeKeyword, $options: 'i' } }
    ];
    if (landlordIds.length > 0) {
      filter.$or.push({ landlordId: { $in: landlordIds } });
    }
  }

  const [totalFiltered, counts] = await Promise.all([
    Room.countDocuments(filter),
    Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ status: ROOM_STATUS.PENDING }),
      Room.countDocuments({ status: ROOM_STATUS.APPROVED }),
      Room.countDocuments({ status: ROOM_STATUS.REJECTED }),
      Room.countDocuments({ status: ROOM_STATUS.DRAFT })
    ]).then(([all, pending, approved, rejected, draft]) => ({ all, pending, approved, rejected, draft }))
  ]);

  const paging = pagination(totalFiltered, page);
  const rooms = await Room.find(filter)
    .sort({ updatedAt: -1, _id: -1 })
    .skip(paging.skip)
    .limit(paging.limit)
    .populate('landlordId', 'fullName phone email')
    .populate('categoryId', 'title')
    .lean();

  res.render('admin/pages/room-list', {
    title: 'Quản lý & Duyệt bài đăng phòng trọ - TroNest',
    rooms,
    paging,
    query: { status, keyword },
    statusFilter: status || '',
    keyword: keyword || '',
    counts
  });
};

// [GET] /admin/rooms/detail/:id
module.exports.detail = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Bài đăng phòng trọ này không tồn tại!');
  }

  const room = await Room.findById(id)
    .populate('categoryId', 'title')
    .populate('landlordId', 'fullName phone email address createdAt')
    .lean();

  if (!room) {
    throw new AppError(404, 'Bài đăng phòng trọ này không tồn tại!');
  }

  res.render('admin/pages/room-detail', {
    title: `Thẩm định: ${room.title} - TroNest`,
    room
  });
};

// [POST] /admin/rooms/approve/:id
module.exports.approve = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  const room = await Room.findById(id);
  if (!room) {
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  room.status = ROOM_STATUS.APPROVED;
  room.rejectReason = '';
  await room.save();

  return res.json({
    code: 200,
    message: `Đã duyệt bài đăng "${room.title}"! Bài đăng hiện đã hiển thị công khai trên website.`
  });
};

// [POST] /admin/rooms/reject/:id
module.exports.reject = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  if (reason !== undefined && (typeof reason !== 'string' || reason.length > 1000)) {
    throw new AppError(400, 'Lý do từ chối không hợp lệ (tối đa 1000 ký tự)!');
  }

  const room = await Room.findById(id);
  if (!room) {
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  room.status = ROOM_STATUS.REJECTED;
  room.rejectReason = reason || 'Nội dung bài đăng không đáp ứng tiêu chuẩn của TroNest.';
  await room.save();

  return res.json({
    code: 200,
    message: `Đã từ chối bài đăng "${room.title}"!`
  });
};

// [POST] /admin/rooms/delete/:id
module.exports.delete = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  const room = await Room.findByIdAndDelete(id);
  if (!room) {
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  await Favorite.deleteMany({ roomId: room._id });
  await removeUnreferencedImages([...(room.images || []), room.thumbnail]);

  return res.json({
    code: 200,
    message: 'Đã xóa bài đăng khỏi hệ thống thành công!'
  });
};

