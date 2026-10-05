const mongoose = require('mongoose');
const Room = require('../../models/room.model');
const Category = require('../../models/category.model');
const Favorite = require('../../models/favorite.model');
const { ROOM_STATUS, USER_STATUS } = require('../../configs/system.config');
const { escapeRegex } = require('../../helpers/security.helper');
const { AppError } = require('../../helpers/error.helper');

// [GET] /rooms
module.exports.index = async (req, res) => {
  const {
    keyword,
    category,
    district,
    priceRange,
    areaRange,
    sort,
    page = 1
  } = req.query;

  const filter = {
    status: ROOM_STATUS.APPROVED
  };

  if (keyword && keyword.trim() !== '') {
    const safeKeyword = escapeRegex(keyword.trim());
    filter.$or = [
      { title: { $regex: safeKeyword, $options: 'i' } },
      { address: { $regex: safeKeyword, $options: 'i' } },
      { district: { $regex: safeKeyword, $options: 'i' } }
    ];
  }

  if (category && category !== '') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.categoryId = category;
    } else {
      const foundCategory = await Category.findOne({ slug: category });
      if (foundCategory) {
        filter.categoryId = foundCategory._id;
      }
    }
  }

  if (district && district.trim() !== '') {
    filter.district = { $regex: escapeRegex(district.trim()), $options: 'i' };
  }

  if (priceRange === '<2m') {
    filter.price = { $lt: 2000000 };
  } else if (priceRange === '2-4m') {
    filter.price = { $gte: 2000000, $lte: 4000000 };
  } else if (priceRange === '4-7m') {
    filter.price = { $gte: 4000000, $lte: 7000000 };
  } else if (priceRange === '>7m') {
    filter.price = { $gt: 7000000 };
  }

  if (areaRange === '<20') {
    filter.area = { $lt: 20 };
  } else if (areaRange === '20-30') {
    filter.area = { $gte: 20, $lte: 30 };
  } else if (areaRange === '30-50') {
    filter.area = { $gte: 30, $lte: 50 };
  } else if (areaRange === '>50') {
    filter.area = { $gt: 50 };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price-asc') {
    sortOption = { price: 1 };
  } else if (sort === 'price-desc') {
    sortOption = { price: -1 };
  } else if (sort === 'area-desc') {
    sortOption = { area: -1 };
  } else if (sort === 'views-desc') {
    sortOption = { views: -1 };
  }

  const currentPage = parseInt(page, 10) || 1;
  const limit = 9;
  const skip = (currentPage - 1) * limit;

  const totalRooms = await Room.countDocuments(filter);
  const totalPages = Math.ceil(totalRooms / limit) || 1;

  const rooms = await Room.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('categoryId', 'title slug')
    .populate('landlordId', 'fullName phone')
    .lean();

  const categories = await Category.find({ status: USER_STATUS.ACTIVE }).lean();

  let favoriteRoomIds = [];
  if (req.user) {
    const favorites = await Favorite.find({ userId: req.user._id }).select('roomId').lean();
    favoriteRoomIds = favorites.map((f) => f.roomId.toString());
  }

  res.render('client/pages/room-list', {
    title: 'Danh sách phòng trọ - TroNest',
    rooms,
    categories,
    totalRooms,
    currentPage,
    totalPages,
    query: req.query,
    favoriteRoomIds
  });
};

// [GET] /rooms/detail/:id
module.exports.detail = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Phòng trọ này không tồn tại hoặc chưa được kiểm duyệt phê duyệt!');
  }

  const room = await Room.findOne({
    _id: id,
    status: ROOM_STATUS.APPROVED
  })
    .populate('categoryId', 'title slug')
    .populate('landlordId', 'fullName phone email address avatar createdAt');

  if (!room) {
    throw new AppError(404, 'Phòng trọ này không tồn tại hoặc chưa được kiểm duyệt phê duyệt!');
  }

  await Room.updateOne({ _id: room._id }, { $inc: { views: 1 } });
  room.views = (room.views || 0) + 1;

  let isFavorited = false;
  if (req.user) {
    const fav = await Favorite.findOne({
      userId: req.user._id,
      roomId: room._id
    });
    isFavorited = Boolean(fav);
  }

  const relatedRooms = await Room.find({
    _id: { $ne: room._id },
    status: ROOM_STATUS.APPROVED,
    $or: [{ categoryId: room.categoryId._id }, { district: room.district }]
  })
    .limit(3)
    .populate('categoryId', 'title slug')
    .lean();

  res.render('client/pages/room-detail', {
    title: `${room.title} - TroNest`,
    room,
    isFavorited,
    relatedRooms
  });
};
