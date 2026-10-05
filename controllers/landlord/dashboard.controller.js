const Room = require('../../models/room.model');
const { ROOM_STATUS } = require('../../configs/system.config');

// [GET] /landlord/dashboard
module.exports.index = async (req, res) => {
  const landlordId = req.user._id;

  const totalRooms = await Room.countDocuments({ landlordId });
  const draftRooms = await Room.countDocuments({ landlordId, status: ROOM_STATUS.DRAFT });
  const pendingRooms = await Room.countDocuments({ landlordId, status: ROOM_STATUS.PENDING });
  const approvedRooms = await Room.countDocuments({ landlordId, status: ROOM_STATUS.APPROVED });
  const rejectedRooms = await Room.countDocuments({ landlordId, status: ROOM_STATUS.REJECTED });

  const recentRooms = await Room.find({ landlordId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('categoryId', 'title')
    .lean();

  res.render('landlord/pages/dashboard', {
    title: 'Bảng điều khiển Chủ trọ - TroNest',
    totalRooms,
    draftRooms,
    pendingRooms,
    approvedRooms,
    rejectedRooms,
    recentRooms,
    landlordStatus: req.user.status,
    rejectReason: req.user.rejectReason
  });
};
