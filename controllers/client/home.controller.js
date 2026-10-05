const Category = require('../../models/category.model');
const Room = require('../../models/room.model');
const Favorite = require('../../models/favorite.model');
const { ROOM_STATUS, USER_STATUS } = require('../../configs/system.config');

// [GET] /
module.exports.index = async (req, res) => {
  const categories = await Category.find({ status: USER_STATUS.ACTIVE }).lean();

  const featuredRooms = await Room.find({
    status: ROOM_STATUS.APPROVED,
    isFeatured: true
  })
    .populate('categoryId', 'title slug')
    .populate('landlordId', 'fullName phone')
    .limit(6)
    .lean();

  const latestRooms = await Room.find({
    status: ROOM_STATUS.APPROVED
  })
    .sort({ createdAt: -1 })
    .populate('categoryId', 'title slug')
    .populate('landlordId', 'fullName phone')
    .limit(8)
    .lean();

  let favoriteRoomIds = [];
  if (req.user) {
    const favorites = await Favorite.find({ userId: req.user._id }).select('roomId').lean();
    favoriteRoomIds = favorites.map((f) => f.roomId.toString());
  }

  res.render('client/pages/index', {
    title: 'TroNest - Hệ thống tìm kiếm và đăng tin phòng trọ uy tín',
    categories,
    featuredRooms,
    latestRooms,
    favoriteRoomIds
  });
};
