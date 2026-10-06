const Room = require('../../models/room.model');
const { ROOM_STATUS } = require('../../configs/system.config');
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
    filter.title = { $regex: escapeRegex(keyword.trim()), $options: 'i' };
  }

  const paging = pagination(await Room.countDocuments(filter), page);
  const rooms = await Room.find(filter)
    .sort({ updatedAt: -1, _id: -1 }).skip(paging.skip).limit(paging.limit)
    .populate('landlordId', 'fullName phone email')
    .populate('categoryId', 'title')
    .lean();

  const counts = {
    all: await Room.countDocuments(),
    pending: await Room.countDocuments({ status: ROOM_STATUS.PENDING }),
    approved: await Room.countDocuments({ status: ROOM_STATUS.APPROVED }),
    rejected: await Room.countDocuments({ status: ROOM_STATUS.REJECTED }),
    draft: await Room.countDocuments({ status: ROOM_STATUS.DRAFT })
  };

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
  const room = await Room.findById(id)
    .populate('categoryId', 'title')
    .populate('landlordId', 'fullName phone email address')
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
  const room = await Room.findOneAndUpdate(
    { _id: id, status: ROOM_STATUS.PENDING },
    { status: ROOM_STATUS.APPROVED, rejectReason: '' },
    { new: true }
  );

  if (!room) {
    if (await Room.exists({ _id: id })) {
      throw new AppError(409, 'Chỉ được duyệt bài đang chờ. Vui lòng tải lại danh sách!');
    }
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  return res.json({
    code: 200,
    message: `Đã duyệt bài đăng "${room.title}"! Bài đăng hiện đã hiển thị công khai trên website.`
  });
};

// [POST] /admin/rooms/reject/:id
module.exports.reject = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (reason !== undefined && (typeof reason !== 'string' || reason.length > 1000)) {
    throw new AppError(400, 'Lý do từ chối không hợp lệ (tối đa 1000 ký tự)!');
  }
  const room = await Room.findOneAndUpdate(
    { _id: id, status: ROOM_STATUS.PENDING },
    {
      status: ROOM_STATUS.REJECTED,
      rejectReason: reason || 'Nội dung bài đăng không đáp ứng tiêu chuẩn của TroNest.'
    },
    { new: true }
  );

  if (!room) {
    if (await Room.exists({ _id: id })) {
      throw new AppError(409, 'Chỉ được từ chối bài đang chờ. Vui lòng tải lại danh sách!');
    }
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  return res.json({
    code: 200,
    message: `Đã từ chối bài đăng "${room.title}"!`
  });
};

// [POST] /admin/rooms/delete/:id
module.exports.delete = async (req, res) => {
  const { id } = req.params;
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
