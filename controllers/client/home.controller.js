const Category = require('../../models/category.model');
const Room = require('../../models/room.model');
const Favorite = require('../../models/favorite.model');
const User = require('../../models/user.model');
const { ROOM_STATUS, USER_STATUS, ROLES } = require('../../configs/system.config');

// [GET] /
module.exports.index = async (req, res) => {
  const invalidLandlords = await User.find({
    role: ROLES.LANDLORD,
    $or: [
      { status: { $ne: USER_STATUS.APPROVED } },
      { isBlocked: true }
    ]
  }).select('_id').lean();
  const invalidIds = invalidLandlords.map((u) => u._id);

  const roomFilter = {
    status: ROOM_STATUS.APPROVED,
    ...(invalidIds.length > 0 ? { landlordId: { $nin: invalidIds } } : {})
  };

  const categories = await Category.find({ status: USER_STATUS.ACTIVE }).lean();

  const featuredRooms = await Room.find({
    ...roomFilter,
    isFeatured: true
  })
    .populate('categoryId', 'title slug')
    .populate('landlordId', 'fullName phone avatar status')
    .limit(6)
    .lean();

  const latestRooms = await Room.find(roomFilter)
    .sort({ createdAt: -1 })
    .populate('categoryId', 'title slug')
    .populate('landlordId', 'fullName phone avatar status')
    .limit(8)
    .lean();

  let favoriteRoomIds = [];
  if (req.user) {
    const favorites = await Favorite.find({ userId: req.user._id }).select('roomId').lean();
    favoriteRoomIds = favorites.map((f) => f.roomId.toString());
  }

  return res.json({
    code: 200,
    data: {
      categories,
      featuredRooms,
      latestRooms,
      favoriteRoomIds
    }
  });
};
