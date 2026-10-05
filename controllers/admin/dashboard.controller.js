const User = require('../../models/user.model');
const Room = require('../../models/room.model');
const Category = require('../../models/category.model');
const { ROLES, ROOM_STATUS, USER_STATUS } = require('../../configs/system.config');

// [GET] /admin/dashboard
module.exports.index = async (req, res) => {
  const totalLandlords = await User.countDocuments({ role: ROLES.LANDLORD });
  const pendingLandlordsCount = await User.countDocuments({
    role: ROLES.LANDLORD,
    status: USER_STATUS.PENDING
  });
  const approvedLandlordsCount = await User.countDocuments({
    role: ROLES.LANDLORD,
    status: USER_STATUS.APPROVED
  });

  const totalRooms = await Room.countDocuments();
  const pendingRoomsCount = await Room.countDocuments({ status: ROOM_STATUS.PENDING });
  const approvedRoomsCount = await Room.countDocuments({ status: ROOM_STATUS.APPROVED });

  const totalCustomers = await User.countDocuments({ role: ROLES.CUSTOMER });
  const totalCategories = await Category.countDocuments();

  // 5 chủ trọ mới cần duyệt
  const pendingLandlords = await User.find({
    role: ROLES.LANDLORD,
    status: USER_STATUS.PENDING
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // 5 phòng mới cần duyệt
  const pendingRooms = await Room.find({ status: ROOM_STATUS.PENDING })
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
};
