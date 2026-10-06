const User = require('../../models/user.model');
const { ROLES, USER_STATUS } = require('../../configs/system.config');
const { escapeRegex } = require('../../helpers/security.helper');
const { AppError } = require('../../helpers/error.helper');
const { queryText, queryPage, pagination } = require('../../helpers/query.helper');

// [GET] /admin/users
module.exports.index = async (req, res) => {
  const role = queryText(req.query.role);
  const status = queryText(req.query.status);
  const keyword = queryText(req.query.keyword);
  const page = queryPage(req.query.page);

  const filter = {};
  if (role && Object.values(ROLES).includes(role)) {
    filter.role = role;
  }
  if (status && Object.values(USER_STATUS).includes(status)) {
    if (status === USER_STATUS.INACTIVE) {
      filter.$and = [{ $or: [{ isBlocked: true }, { status: USER_STATUS.INACTIVE }] }];
    } else {
      filter.status = status;
      filter.isBlocked = { $ne: true };
    }
  }
  if (keyword && keyword.trim() !== '') {
    const safeKeyword = escapeRegex(keyword.trim());
    filter.$or = [
      { fullName: { $regex: safeKeyword, $options: 'i' } },
      { email: { $regex: safeKeyword, $options: 'i' } },
      { phone: { $regex: safeKeyword, $options: 'i' } }
    ];
  }

  const paging = pagination(await User.countDocuments(filter), page);
  const users = await User.find(filter).select('-password')
    .sort({ createdAt: -1, _id: -1 }).skip(paging.skip).limit(paging.limit).lean();

  res.render('admin/pages/user-list', {
    title: 'Quản lý người dùng - TroNest',
    users,
    paging,
    query: { role, status, keyword },
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

  if (user.role === ROLES.ADMIN) {
    throw new AppError(403, 'Không thể khóa tài khoản Quản trị viên!');
  }

  const wasBlocked = user.isBlocked || user.status === USER_STATUS.INACTIVE;
  user.isBlocked = !wasBlocked;
  // Legacy INACTIVE records do not retain the previous landlord approval state.
  if (user.status === USER_STATUS.INACTIVE) {
    user.status = user.role === ROLES.LANDLORD ? USER_STATUS.PENDING : USER_STATUS.ACTIVE;
  }
  await user.save();

  return res.json({
    code: 200,
    newStatus: user.status,
    isBlocked: user.isBlocked,
    message: `Đã ${user.isBlocked ? 'khóa' : 'mở khóa'} tài khoản ${user.fullName}!`
  });
};
