const Category = require('../../models/category.model');
const Room = require('../../models/room.model');
const Favorite = require('../../models/favorite.model');

// [GET] /
module.exports.index = async (req, res) => {
  try {
    const categories = await Category.find({ status: 'ACTIVE' }).lean();

    const featuredRooms = await Room.find({
      status: 'APPROVED',
      isFeatured: true
    })
      .populate('categoryId', 'title slug')
      .populate('landlordId', 'fullName phone')
      .limit(6)
      .lean();

    const latestRooms = await Room.find({
      status: 'APPROVED'
    })
      .sort({ createdAt: -1 })
      .populate('categoryId', 'title slug')
      .populate('landlordId', 'fullName phone')
      .limit(8)
      .lean();

    // Lấy danh sách ID phòng yêu thích nếu user đã đăng nhập
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
  } catch (error) {
    console.error('Error in homeController.index:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải dữ liệu trang chủ'
    });
  }
};
