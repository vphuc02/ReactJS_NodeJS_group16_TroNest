const Room = require('../../models/room.model');
const Category = require('../../models/category.model');
const Favorite = require('../../models/favorite.model');

// [GET] /rooms
module.exports.index = async (req, res) => {
  try {
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
      status: 'APPROVED'
    };

    if (keyword && keyword.trim() !== '') {
      filter.$or = [
        { title: { $regex: keyword.trim(), $options: 'i' } },
        { address: { $regex: keyword.trim(), $options: 'i' } },
        { district: { $regex: keyword.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== '') {
      // Có thể là slug hoặc ObjectId
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.categoryId = category;
      } else {
        const foundCategory = await Category.findOne({ slug: category });
        if (foundCategory) {
          filter.categoryId = foundCategory._id;
        }
      }
    }

    if (district && district.trim() !== '') {
      filter.district = { $regex: district.trim(), $options: 'i' };
    }

    if (priceRange) {
      if (priceRange === '<2m') {
        filter.price = { $lt: 2000000 };
      } else if (priceRange === '2-4m') {
        filter.price = { $gte: 2000000, $lte: 4000000 };
      } else if (priceRange === '4-7m') {
        filter.price = { $gte: 4000000, $lte: 7000000 };
      } else if (priceRange === '>7m') {
        filter.price = { $gt: 7000000 };
      }
    }

    if (areaRange) {
      if (areaRange === '<20') {
        filter.area = { $lt: 20 };
      } else if (areaRange === '20-30') {
        filter.area = { $gte: 20, $lte: 30 };
      } else if (areaRange === '30-50') {
        filter.area = { $gte: 30, $lte: 50 };
      } else if (areaRange === '>50') {
        filter.area = { $gt: 50 };
      }
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

    const currentPage = parseInt(page) || 1;
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

    const categories = await Category.find({ status: 'ACTIVE' }).lean();

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
  } catch (error) {
    console.error('Error in roomController.index:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải danh sách phòng'
    });
  }
};

// [GET] /rooms/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findOne({
      _id: id,
      status: 'APPROVED'
    })
      .populate('categoryId', 'title slug')
      .populate('landlordId', 'fullName phone email address avatar createdAt');

    if (!room) {
      return res.status(404).render('client/pages/error', {
        title: 'Không tìm thấy phòng',
        message: 'Phòng trọ này không tồn tại hoặc chưa được kiểm duyệt phê duyệt!'
      });
    }

    // Tăng lượt xem
    room.views += 1;
    await room.save();

    // Kiểm tra phòng yêu thích của user
    let isFavorited = false;
    if (req.user) {
      const fav = await Favorite.findOne({
        userId: req.user._id,
        roomId: room._id
      });
      isFavorited = !!fav;
    }

    // Phòng liên quan cùng khu vực hoặc danh mục
    const relatedRooms = await Room.find({
      _id: { $ne: room._id },
      status: 'APPROVED',
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
  } catch (error) {
    console.error('Error in roomController.detail:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải thông tin phòng trọ'
    });
  }
};
