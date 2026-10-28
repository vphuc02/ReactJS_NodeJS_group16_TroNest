const mongoose = require('mongoose');
const User = require('../../models/user.model');
const Room = require('../../models/room.model');
const { ROLES, USER_STATUS, ROOM_STATUS } = require('../../configs/system.config');
const { escapeRegex } = require('../../helpers/security.helper');
const { AppError } = require('../../helpers/error.helper');
const { queryText, queryPage, pagination } = require('../../helpers/query.helper');

// [GET] /admin/landlords
module.exports.index = async (req, res) => {
  const status = queryText(req.query.status);
  const keyword = queryText(req.query.keyword);
  const page = queryPage(req.query.page);

  const filter = { role: ROLES.LANDLORD };
  if (status && [USER_STATUS.PENDING, USER_STATUS.APPROVED, USER_STATUS.REJECTED].includes(status)) {
    filter.status = status;
  }
  if (keyword && keyword.trim() !== '') {
    const safeKeyword = escapeRegex(keyword.trim());
    filter.$or = [
      { fullName: { $regex: safeKeyword, $options: 'i' } },
      { email: { $regex: safeKeyword, $options: 'i' } },
      { phone: { $regex: safeKeyword, $options: 'i' } }
    ];
  }

  const [totalFiltered, counts] = await Promise.all([
    User.countDocuments(filter),
    Promise.all([
      User.countDocuments({ role: ROLES.LANDLORD }),
      User.countDocuments({ role: ROLES.LANDLORD, status: USER_STATUS.PENDING }),
      User.countDocuments({ role: ROLES.LANDLORD, status: USER_STATUS.APPROVED }),
      User.countDocuments({ role: ROLES.LANDLORD, status: USER_STATUS.REJECTED })
    ]).then(([all, pending, approved, rejected]) => ({ all, pending, approved, rejected }))
  ]);

  const paging = pagination(totalFiltered, page);
  const landlords = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1, _id: -1 })
    .skip(paging.skip)
    .limit(paging.limit)
    .lean();

  // Thống kê số phòng của từng chủ trọ
  if (landlords.length > 0) {
    const roomCounts = await Room.aggregate([
      { $match: { landlordId: { $in: landlords.map((landlord) => landlord._id) } } },
      { $group: { _id: '$landlordId', count: { $sum: 1 } } }
    ]);
    const countById = new Map(roomCounts.map((item) => [String(item._id), item.count]));
    landlords.forEach((landlord) => {
      landlord.roomCount = countById.get(String(landlord._id)) || 0;
    });
  }

  res.render('admin/pages/landlord-list', {
    title: 'Quản lý duyệt Chủ trọ - TroNest',
    landlords,
    paging,
    query: { status, keyword },
    statusFilter: status || '',
    keyword: keyword || '',
    counts
  });
};

// [POST] /admin/landlords/approve/:id
module.exports.approve = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Không tìm thấy tài khoản Chủ trọ!');
  }

  const landlord = await User.findOneAndUpdate(
    { _id: id, role: ROLES.LANDLORD },
    { status: USER_STATUS.APPROVED, rejectReason: '', isBlocked: false },
    { returnDocument: 'after' }
  );

  if (!landlord) {
    throw new AppError(404, 'Không tìm thấy tài khoản Chủ trọ!');
  }

  return res.json({
    code: 200,
    message: `Đã phê duyệt tài khoản Chủ trọ ${landlord.fullName}! Bây giờ chủ trọ đã có thể đăng phòng.`
  });
};

// [POST] /admin/landlords/reject/:id
module.exports.reject = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Không tìm thấy tài khoản Chủ trọ!');
  }

  const landlord = await User.findOneAndUpdate(
    { _id: id, role: ROLES.LANDLORD },
    {
      status: USER_STATUS.REJECTED,
      rejectReason: reason || 'Thông tin chủ trọ chưa chính xác hoặc không đủ điều kiện.'
    },
    { returnDocument: 'after' }
  );

  if (!landlord) {
    throw new AppError(404, 'Không tìm thấy tài khoản Chủ trọ!');
  }

  // Tự động gỡ các phòng đã xuất bản của chủ trọ bị từ chối
  await Room.updateMany(
    { landlordId: landlord._id, status: ROOM_STATUS.APPROVED },
    {
      status: ROOM_STATUS.REJECTED,
      rejectReason: 'Tài khoản chủ trọ chưa được phê duyệt hoặc đã bị từ chối bởi Quản trị viên.'
    }
  );

  return res.json({
    code: 200,
    message: `Đã từ chối tài khoản Chủ trọ ${landlord.fullName}!`
  });
};

