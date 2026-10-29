const User = require('../../models/user.model');
const Room = require('../../models/room.model');
const Category = require('../../models/category.model');
const { ROLES, ROOM_STATUS, USER_STATUS } = require('../../configs/system.config');

// [GET] /admin/dashboard
module.exports.index = async (req, res) => {
  const [
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
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.LANDLORD }),
    User.countDocuments({ role: ROLES.LANDLORD, status: USER_STATUS.PENDING }),
    User.countDocuments({ role: ROLES.LANDLORD, status: USER_STATUS.APPROVED }),
    Room.countDocuments(),
    Room.countDocuments({ status: ROOM_STATUS.PENDING }),
    Room.countDocuments({ status: ROOM_STATUS.APPROVED }),
    User.countDocuments({ role: ROLES.CUSTOMER }),
    Category.countDocuments(),
    User.find({ role: ROLES.LANDLORD, status: USER_STATUS.PENDING })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Room.find({ status: ROOM_STATUS.PENDING })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('landlordId', 'fullName phone email')
      .populate('categoryId', 'title')
      .lean()
  ]);

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

