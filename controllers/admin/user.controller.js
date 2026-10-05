const User = require('../../models/user.model');
const { ROLES, USER_STATUS } = require('../../configs/system.config');
const { escapeRegex } = require('../../helpers/security.helper');
const { AppError } = require('../../helpers/error.helper');

// [GET] /admin/users
module.exports.index = async (req, res) => {
  const { role, status, keyword } = req.query;

  const filter = {};
  if (role && Object.values(ROLES).includes(role)) {
    filter.role = role;
  }
  if (status && Object.values(USER_STATUS).includes(status)) {
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

  const users = await User.find(filter).sort({ createdAt: -1 }).lean();

  res.render('admin/pages/user-list', {
    title: 'Quản lý người dùng - TroNest',
    users,
    roleFilter: role || '',
    statusFilter: status || '',
    keyword: keyword || ''
  });
};

// [POST] /admin/users/toggle-status/:id
module.exports.toggleStatus = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(404, 'Người dùng không tồn tại!');
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      code: 400,
      message: 'Bạn không thể tự khóa tài khoản của chính mình!'
    });
  }

  user.status = user.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
  await user.save();

  return res.json({
    code: 200,
    newStatus: user.status,
    message: `Đã ${user.status === USER_STATUS.ACTIVE ? 'mở khóa' : 'khóa'} tài khoản ${user.fullName}!`
  });
};
