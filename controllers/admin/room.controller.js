const Room = require('../../models/room.model');
const { ROOM_STATUS } = require('../../configs/system.config');
const { escapeRegex } = require('../../helpers/security.helper');
const { AppError } = require('../../helpers/error.helper');
const { removeUnreferencedImages } = require('../../helpers/room.helper');

// [GET] /admin/rooms
module.exports.index = async (req, res) => {
  const { status, keyword } = req.query;

  const filter = {};
  if (status && Object.values(ROOM_STATUS).includes(status)) {
    filter.status = status;
  }
  if (keyword && keyword.trim() !== '') {
    filter.title = { $regex: escapeRegex(keyword.trim()), $options: 'i' };
  }

  const rooms = await Room.find(filter)
    .sort({ updatedAt: -1 })
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
  const room = await Room.findByIdAndUpdate(
    id,
    { status: ROOM_STATUS.APPROVED, rejectReason: '' },
    { new: true }
  );

  if (!room) {
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

  const room = await Room.findByIdAndUpdate(
    id,
    {
      status: ROOM_STATUS.REJECTED,
      rejectReason: reason || 'Nội dung bài đăng không đáp ứng tiêu chuẩn của TroNest.'
    },
    { new: true }
  );

  if (!room) {
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

  await removeUnreferencedImages([...(room.images || []), room.thumbnail]);

  return res.json({
    code: 200,
    message: 'Đã xóa bài đăng khỏi hệ thống thành công!'
  });
};
