const Room = require('../../models/room.model');
const { ROOM_STATUS } = require('../../configs/system.config');
const { wantsJson } = require('../../helpers/http.helper');

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
    .populate('categoryId', 'title')
    .lean();

  if (wantsJson(req)) {
    return res.json({
      code: 200,
      data: {
        totalRooms,
        draftRooms,
        pendingRooms,
        approvedRooms,
        rejectedRooms,
        recentRooms,
        landlordStatus: req.user.status,
        rejectReason: req.user.rejectReason
      }
    });
  }

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
