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

// Explicit add/remove operations remain stable when a request is retried.
module.exports.add = async (req, res) => {
  const { roomId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new AppError(404, 'Phòng trọ không tồn tại!');
  }

  const existRoom = await Room.exists({ _id: roomId, status: ROOM_STATUS.APPROVED });
  if (!existRoom) {
    throw new AppError(404, 'Phòng trọ không tồn tại!');
  }

  try {
    await Favorite.updateOne(
      { userId: req.user._id, roomId },
      { $setOnInsert: { userId: req.user._id, roomId } },
      { upsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  return res.json({
    code: 200,
    action: 'added',
    message: 'Đã lưu phòng vào danh sách yêu thích!'
  });
};

module.exports.remove = async (req, res) => {
  const { roomId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new AppError(404, 'Phòng trọ không tồn tại!');
  }
  await Favorite.deleteOne({ userId: req.user._id, roomId });
  return res.json({ code: 200, action: 'removed', message: 'Đã bỏ lưu phòng khỏi danh sách yêu thích!' });
};
