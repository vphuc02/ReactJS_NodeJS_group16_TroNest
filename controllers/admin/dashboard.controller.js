const User = require('../../models/user.model');
const Room = require('../../models/room.model');
const Category = require('../../models/category.model');
const { ROLES } = require('../../configs/system.config');

// [GET] /admin/dashboard
module.exports.index = async (req, res) => {
  try {
    const totalLandlords = await User.countDocuments({ role: ROLES.LANDLORD });
    const pendingLandlordsCount = await User.countDocuments({
      role: ROLES.LANDLORD,
      status: 'PENDING'
    });
    const approvedLandlordsCount = await User.countDocuments({
      role: ROLES.LANDLORD,
      status: 'APPROVED'
    });

    const totalRooms = await Room.countDocuments();
    const pendingRoomsCount = await Room.countDocuments({ status: 'PENDING' });
    const approvedRoomsCount = await Room.countDocuments({ status: 'APPROVED' });

    const totalCustomers = await User.countDocuments({ role: ROLES.CUSTOMER });
    const totalCategories = await Category.countDocuments();

    // 5 chủ trọ mới cần duyệt
    const pendingLandlords = await User.find({
      role: ROLES.LANDLORD,
      status: 'PENDING'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 5 phòng mới cần duyệt
    const pendingRooms = await Room.find({ status: 'PENDING' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('landlordId', 'fullName phone email')
      .populate('categoryId', 'title')
      .lean();

    res.render('admin/pages/dashboard', {
      title: 'Bảng điều khiển Admin - TroNest',
      totalLandlords,
      pendingLandlordsCount,
      approvedLandlordsCount,
      totalRooms,
      pendingRoomsCount,
      approvedRoomsCount,
      totalCustomers,
      totalCategories,
      pendingLandlords,
      pendingRooms
    });
  } catch (error) {
    console.error('Error in admin dashboard index:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải dữ liệu bảng điều khiển quản trị'
    });
  }
};
