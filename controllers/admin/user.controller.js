const User = require('../../models/user.model');

// [GET] /admin/users
module.exports.index = async (req, res) => {
  try {
    const { role, status, keyword } = req.query;

    const filter = {};
    if (role && ['ADMIN', 'LANDLORD', 'CUSTOMER'].includes(role)) {
      filter.role = role;
    }
    if (status && status !== '') {
      filter.status = status;
    }
    if (keyword && keyword.trim() !== '') {
      filter.$or = [
        { fullName: { $regex: keyword.trim(), $options: 'i' } },
        { email: { $regex: keyword.trim(), $options: 'i' } },
        { phone: { $regex: keyword.trim(), $options: 'i' } }
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
  } catch (error) {
    console.error('Error in admin users index:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải danh sách người dùng'
    });
  }
};

// [POST] /admin/users/toggle-status/:id
module.exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'Người dùng không tồn tại!'
      });
    }

    // Không cho phép khóa tài khoản admin chính đang dùng
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        code: 400,
        message: 'Bạn không thể tự khóa tài khoản của chính mình!'
      });
    }

    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await user.save();

    return res.json({
      code: 200,
      newStatus: user.status,
      message: `Đã ${user.status === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản ${user.fullName}!`
    });
  } catch (error) {
    console.error('Error in toggle user status:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi khi cập nhật trạng thái người dùng!'
    });
  }
};
