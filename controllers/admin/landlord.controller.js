const User = require('../../models/user.model');
const Room = require('../../models/room.model');
const { ROLES, USER_STATUS } = require('../../configs/system.config');
const { escapeRegex } = require('../../helpers/security.helper');
const { AppError } = require('../../helpers/error.helper');

// [GET] /admin/landlords
module.exports.index = async (req, res) => {
  const { status, keyword } = req.query;

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

  const landlords = await User.find(filter).sort({ createdAt: -1 }).lean();

  // Thống kê số phòng của từng chủ trọ
  for (let l of landlords) {
    l.roomCount = await Room.countDocuments({ landlordId: l._id });
  }

  const counts = {
    all: await User.countDocuments({ role: ROLES.LANDLORD }),
    pending: await User.countDocuments({ role: ROLES.LANDLORD, status: USER_STATUS.PENDING }),
    approved: await User.countDocuments({ role: ROLES.LANDLORD, status: USER_STATUS.APPROVED }),
    rejected: await User.countDocuments({ role: ROLES.LANDLORD, status: USER_STATUS.REJECTED })
  };

  res.render('admin/pages/landlord-list', {
    title: 'Quản lý duyệt Chủ trọ - TroNest',
    landlords,
    statusFilter: status || '',
    keyword: keyword || '',
    counts
  });
};

// [POST] /admin/landlords/approve/:id
module.exports.approve = async (req, res) => {
  const { id } = req.params;
  const landlord = await User.findOneAndUpdate(
    { _id: id, role: ROLES.LANDLORD },
    { status: USER_STATUS.APPROVED, rejectReason: '' },
    { new: true }
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

  const landlord = await User.findOneAndUpdate(
    { _id: id, role: ROLES.LANDLORD },
    {
      status: USER_STATUS.REJECTED,
      rejectReason: reason || 'Thông tin chủ trọ chưa chính xác hoặc không đủ điều kiện.'
    },
    { new: true }
  );

  if (!landlord) {
    throw new AppError(404, 'Không tìm thấy tài khoản Chủ trọ!');
  }

  return res.json({
    code: 200,
    message: `Đã từ chối tài khoản Chủ trọ ${landlord.fullName}!`
  });
};
