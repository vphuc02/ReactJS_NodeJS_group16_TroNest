const User = require('../../models/user.model');
const Room = require('../../models/room.model');
const { ROLES } = require('../../configs/system.config');

// [GET] /admin/landlords
module.exports.index = async (req, res) => {
  try {
    const { status, keyword } = req.query;

    const filter = { role: ROLES.LANDLORD };
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      filter.status = status;
    }
    if (keyword && keyword.trim() !== '') {
      filter.$or = [
        { fullName: { $regex: keyword.trim(), $options: 'i' } },
        { email: { $regex: keyword.trim(), $options: 'i' } },
        { phone: { $regex: keyword.trim(), $options: 'i' } }
      ];
    }

    const landlords = await User.find(filter).sort({ createdAt: -1 }).lean();

    // Thống kê số phòng của từng chủ trọ
    for (let l of landlords) {
      l.roomCount = await Room.countDocuments({ landlordId: l._id });
    }

    const counts = {
      all: await User.countDocuments({ role: ROLES.LANDLORD }),
      pending: await User.countDocuments({ role: ROLES.LANDLORD, status: 'PENDING' }),
      approved: await User.countDocuments({ role: ROLES.LANDLORD, status: 'APPROVED' }),
      rejected: await User.countDocuments({ role: ROLES.LANDLORD, status: 'REJECTED' })
    };

    res.render('admin/pages/landlord-list', {
      title: 'Quản lý duyệt Chủ trọ - TroNest',
      landlords,
      statusFilter: status || '',
      keyword: keyword || '',
      counts
    });
  } catch (error) {
    console.error('Error in admin landlords index:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải danh sách Chủ trọ'
    });
  }
};

// [POST] /admin/landlords/approve/:id
module.exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const landlord = await User.findOneAndUpdate(
      { _id: id, role: ROLES.LANDLORD },
      { status: 'APPROVED', rejectReason: '' },
      { new: true }
    );

    if (!landlord) {
      return res.status(404).json({
        code: 404,
        message: 'Không tìm thấy tài khoản Chủ trọ!'
      });
    }

    return res.json({
      code: 200,
      message: `Đã phê duyệt tài khoản Chủ trọ ${landlord.fullName}! Bây giờ chủ trọ đã có thể đăng phòng.`
    });
  } catch (error) {
    console.error('Error in approve landlord:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi máy chủ khi duyệt tài khoản!'
    });
  }
};

// [POST] /admin/landlords/reject/:id
module.exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const landlord = await User.findOneAndUpdate(
      { _id: id, role: ROLES.LANDLORD },
      {
        status: 'REJECTED',
        rejectReason: reason || 'Thông tin chủ trọ chưa chính xác hoặc không đủ điều kiện.'
      },
      { new: true }
    );

    if (!landlord) {
      return res.status(404).json({
        code: 404,
        message: 'Không tìm thấy tài khoản Chủ trọ!'
      });
    }

    return res.json({
      code: 200,
      message: `Đã từ chối tài khoản Chủ trọ ${landlord.fullName}!`
    });
  } catch (error) {
    console.error('Error in reject landlord:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi máy chủ khi từ chối tài khoản!'
    });
  }
};
