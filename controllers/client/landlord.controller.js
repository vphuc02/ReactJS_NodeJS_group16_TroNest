const mongoose = require('mongoose');
const User = require('../../models/user.model');
const Room = require('../../models/room.model');
const Favorite = require('../../models/favorite.model');
const { ROLES, ROOM_STATUS, USER_STATUS } = require('../../configs/system.config');
const { wantsJson } = require('../../helpers/http.helper');
const { AppError } = require('../../helpers/error.helper');

// [GET] /landlords/:id
module.exports.detail = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Thông tin chủ trọ không tồn tại hoặc đường dẫn không hợp lệ!');
  }

  // Tìm chủ trọ trong cơ sở dữ liệu (hỗ trợ cả tài khoản Landlord hoặc Admin đăng phòng)
  let landlord = await User.findOne({
    _id: id,
    role: { $in: [ROLES.LANDLORD, ROLES.ADMIN] }
  })
    .select('-password')
    .lean();

  if (!landlord) {
    // Nếu phòng được đăng bởi tài khoản khác trong hệ thống
    const hasRooms = await Room.exists({ landlordId: id });
    if (hasRooms) {
      landlord = await User.findById(id).select('-password').lean();
    }
  }

  if (!landlord || landlord.isBlocked || landlord.status === USER_STATUS.INACTIVE) {
    throw new AppError(404, 'Thông tin chủ trọ không tồn tại hoặc tài khoản đã ngừng hoạt động!');
  }

  // Lấy danh sách các bài đăng phòng trọ đã được phê duyệt của chủ trọ này
  const rooms = await Room.find({
    landlordId: landlord._id,
    status: ROOM_STATUS.APPROVED
  })
    .sort({ createdAt: -1 })
    .populate('categoryId', 'title slug')
    .populate('landlordId', 'fullName phone avatar status')
    .lean();

  const totalRooms = rooms.length;

  // Lấy danh sách phòng yêu thích của khách thuê nếu đã đăng nhập
  let favoriteRoomIds = [];
  if (req.user) {
    const favorites = await Favorite.find({ userId: req.user._id }).select('roomId').lean();
    favoriteRoomIds = favorites.map((f) => f.roomId.toString());
  }

  if (wantsJson(req)) {
    return res.json({
      code: 200,
      landlord: {
        _id: landlord._id,
        fullName: landlord.fullName,
        avatar: landlord.avatar,
        phone: landlord.phone,
        email: landlord.email,
        address: landlord.address,
        facebook: landlord.facebook,
        status: landlord.status,
        createdAt: landlord.createdAt
      },
      rooms,
      totalRooms
    });
  }

  const cleanName = landlord.fullName
    ? landlord.fullName.replace(/\s*\([^)]*\)/g, '').trim()
    : 'Chủ trọ';

  res.render('client/pages/landlord-detail', {
    title: `${cleanName} - Thông tin chủ trọ | TroNest`,
    landlord,
    cleanName,
    rooms,
    totalRooms,
    favoriteRoomIds
  });
};
