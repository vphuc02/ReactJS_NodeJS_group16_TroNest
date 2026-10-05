const Favorite = require('../../models/favorite.model');
const Room = require('../../models/room.model');

// [GET] /favorites
module.exports.index = async (req, res) => {
  try {
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
      .filter((fav) => fav.roomId && fav.roomId.status === 'APPROVED')
      .map((fav) => fav.roomId);

    const favoriteRoomIds = favoriteRooms.map((r) => r._id.toString());

    res.render('client/pages/favorites', {
      title: 'Phòng trọ đã lưu yêu thích - TroNest',
      rooms: favoriteRooms,
      favoriteRoomIds
    });
  } catch (error) {
    console.error('Error in favoriteController.index:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải danh sách phòng yêu thích'
    });
  }
};

// [POST] /favorites/toggle/:roomId
module.exports.toggle = async (req, res) => {
  try {
    const { roomId } = req.params;

    const existRoom = await Room.findById(roomId);
    if (!existRoom) {
      return res.status(404).json({
        code: 404,
        message: 'Phòng trọ không tồn tại!'
      });
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
    } else {
      await Favorite.create({
        userId: req.user._id,
        roomId: roomId
      });
      return res.json({
        code: 200,
        action: 'added',
        message: 'Đã lưu phòng vào danh sách yêu thích!'
      });
    }
  } catch (error) {
    console.error('Error in favoriteController.toggle:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi máy chủ khi thao tác yêu thích!'
    });
  }
};
