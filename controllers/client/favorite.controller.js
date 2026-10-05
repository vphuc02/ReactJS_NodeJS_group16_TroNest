const mongoose = require('mongoose');
const Favorite = require('../../models/favorite.model');
const Room = require('../../models/room.model');
const { ROOM_STATUS } = require('../../configs/system.config');
const { AppError } = require('../../helpers/error.helper');

// [GET] /favorites
module.exports.index = async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id })
    .populate({
      path: 'roomId',
      populate: [
        { path: 'categoryId', select: 'title slug' },
        { path: 'landlordId', select: 'fullName phone' }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

  // Lọc ra các phòng còn tồn tại và đã duyệt
  const favoriteRooms = favorites
    .filter((fav) => fav.roomId && fav.roomId.status === ROOM_STATUS.APPROVED)
    .map((fav) => fav.roomId);

  const favoriteRoomIds = favoriteRooms.map((r) => r._id.toString());

  res.render('client/pages/favorites', {
    title: 'Phòng trọ đã lưu yêu thích - TroNest',
    rooms: favoriteRooms,
    favoriteRoomIds
  });
};

// [POST] /favorites/toggle/:roomId
module.exports.toggle = async (req, res) => {
  const { roomId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new AppError(404, 'Phòng trọ không tồn tại!');
  }

  const existRoom = await Room.findById(roomId);
  if (!existRoom) {
    throw new AppError(404, 'Phòng trọ không tồn tại!');
  }

  const existFavorite = await Favorite.findOne({
    userId: req.user._id,
    roomId: roomId
  });

  if (existFavorite) {
    await Favorite.deleteOne({ _id: existFavorite._id });
    return res.json({
      code: 200,
      action: 'removed',
      message: 'Đã bỏ lưu phòng khỏi danh sách yêu thích!'
    });
  }

  await Favorite.create({
    userId: req.user._id,
    roomId: roomId
  });
  return res.json({
    code: 200,
    action: 'added',
    message: 'Đã lưu phòng vào danh sách yêu thích!'
  });
};
