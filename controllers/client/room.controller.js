const mongoose = require('mongoose');
const Room = require('../../models/room.model');
const Category = require('../../models/category.model');
const Favorite = require('../../models/favorite.model');
const User = require('../../models/user.model');
const { ROOM_STATUS, USER_STATUS, ROLES } = require('../../configs/system.config');
const { escapeRegex } = require('../../helpers/security.helper');
const { AppError } = require('../../helpers/error.helper');
const { queryText, queryPage, pagination } = require('../../helpers/query.helper');
const { stripUnitPrefix } = require('../../helpers/geo.helper');

// [GET] /rooms
module.exports.index = async (req, res) => {
  const query = Object.fromEntries(
    ['keyword', 'category', 'province', 'ward', 'district', 'priceRange', 'areaRange', 'sort']
      .map((key) => [key, queryText(req.query[key])])
  );
  const { keyword, category, province, ward, district, priceRange, areaRange, sort } = query;
  const page = queryPage(req.query.page);

  const filter = {
    status: ROOM_STATUS.APPROVED
  };

  // Chỉ hiển thị phòng thuộc về các Chủ trọ đã được phê duyệt và không bị khóa
  const invalidLandlords = await User.find({
    role: ROLES.LANDLORD,
    $or: [
      { status: { $ne: USER_STATUS.APPROVED } },
      { isBlocked: true }
    ]
  }).select('_id').lean();

  if (invalidLandlords.length > 0) {
    const invalidIds = invalidLandlords.map((u) => u._id);
    filter.landlordId = { $nin: invalidIds };
  }

  const andConditions = [];

  // Province filter, e.g. ?province=Hà Nội
  if (province && province.trim() !== '') {
    filter.province = { $regex: escapeRegex(stripUnitPrefix(province)), $options: 'i' };
  }

  // Ward filter, e.g. ?ward=Phường Ba Đình
  if (ward && ward.trim() !== '') {
    const safeWard = escapeRegex(stripUnitPrefix(ward));
    andConditions.push({
      $or: [
        { ward: { $regex: safeWard, $options: 'i' } },
        { district: { $regex: safeWard, $options: 'i' } },
        { address: { $regex: safeWard, $options: 'i' } }
      ]
    });
  }

  if (keyword && keyword.trim() !== '') {
    const safeKeyword = escapeRegex(keyword.trim());
    andConditions.push({
      $or: [
        { title: { $regex: safeKeyword, $options: 'i' } },
        { address: { $regex: safeKeyword, $options: 'i' } },
        { ward: { $regex: safeKeyword, $options: 'i' } },
        { district: { $regex: safeKeyword, $options: 'i' } },
        { province: { $regex: safeKeyword, $options: 'i' } }
      ]
    });
  }

  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  if (category && category !== '') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.categoryId = category;
    } else {
      const foundCategory = await Category.findOne({ slug: category });
      if (foundCategory) {
        filter.categoryId = foundCategory._id;
      } else {
        filter._id = { $in: [] };
      }
    }
  }

  // Legacy ?district= links
  if (district && district.trim() !== '') {
    filter.district = { $regex: escapeRegex(district.trim()), $options: 'i' };
  }

  if (priceRange === '<2m' || priceRange === 'under-2m') {
    filter.price = { $lt: 2000000 };
  } else if (priceRange === '2-4m' || priceRange === '2m-4m') {
    filter.price = { $gte: 2000000, $lte: 4000000 };
  } else if (priceRange === '4-7m' || priceRange === '4m-7m') {
    filter.price = { $gte: 4000000, $lte: 7000000 };
  } else if (priceRange === '>7m' || priceRange === 'above-7m') {
    filter.price = { $gt: 7000000 };
  }

  if (areaRange === '<20' || areaRange === 'under-20') {
    filter.area = { $lt: 20 };
  } else if (areaRange === '20-30') {
    filter.area = { $gte: 20, $lte: 30 };
  } else if (areaRange === '30-50') {
    filter.area = { $gte: 30, $lte: 50 };
  } else if (areaRange === '>50' || areaRange === 'above-50') {
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

  const limit = 9;

  const totalRooms = await Room.countDocuments(filter);
  const paging = pagination(totalRooms, page, limit);
  const { currentPage, totalPages, skip } = paging;

  const rooms = await Room.find(filter)
    .sort({ ...sortOption, _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate('categoryId', 'title slug')
    .populate('landlordId', 'fullName phone avatar status')
    .lean();

  const categories = await Category.find({ status: USER_STATUS.ACTIVE }).lean();

  let favoriteRoomIds = [];
  if (req.user) {
    const favorites = await Favorite.find({ userId: req.user._id }).select('roomId').lean();
    favoriteRoomIds = favorites.map((f) => f.roomId.toString());
  }

  return res.json({
    code: 200,
    data: {
      rooms,
      categories,
      totalRooms,
      currentPage,
      totalPages,
      paging,
      query,
      favoriteRoomIds
    }
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
    .populate('landlordId', 'fullName phone email address avatar facebook status isBlocked createdAt');

  if (!room || !room.landlordId || room.landlordId.status !== USER_STATUS.APPROVED || room.landlordId.isBlocked) {
    throw new AppError(404, 'Phòng trọ này không tồn tại hoặc chưa được kiểm duyệt phê duyệt!');
  }

  await Room.updateOne({ _id: room._id }, { $inc: { views: 1 } });
  room.views = (room.views || 0) + 1;

  let isFavorited = false;
  let favoriteRoomIds = [];
  if (req.user) {
    const userFavorites = await Favorite.find({
      userId: req.user._id
    }).select('roomId').lean();
    favoriteRoomIds = userFavorites.map((f) => f.roomId.toString());
    isFavorited = favoriteRoomIds.includes(room._id.toString());
  }

  // 1. Lọc bỏ các chủ trọ bị khóa hoặc chưa được phê duyệt
  const invalidLandlords = await User.find({
    role: ROLES.LANDLORD,
    $or: [
      { status: { $ne: USER_STATUS.APPROVED } },
      { isBlocked: true }
    ]
  }).select('_id').lean();
  const invalidIds = invalidLandlords.map((u) => u._id);

  // 2. Thuật toán gợi ý phòng trọ tương tự trong khu vực:
  // - Ưu tiên chuẩn xác theo khu vực địa lý: Cùng Quận/Huyện -> Cùng Tỉnh/Thành
  // - Ưu tiên độ tương đồng: Cùng Loại phòng -> Mức giá gần nhất
  const baseFilter = {
    _id: { $ne: room._id },
    status: ROOM_STATUS.APPROVED,
    ...(invalidIds.length > 0 ? { landlordId: { $nin: invalidIds } } : {})
  };

  const TARGET_LIMIT = 6;
  const relatedRooms = [];
  const addedIds = new Set();

  const cleanDistrict = (room.district || '').replace(/^(quận|huyện|thị xã|thành phố|tp\.?)\s+/i, '').trim();
  const cleanProvince = (room.province || '').replace(/^(thành phố|tỉnh|tp\.?)\s+/i, '').trim();
  const districtRegex = cleanDistrict ? new RegExp(escapeRegex(cleanDistrict), 'i') : null;
  const provinceRegex = cleanProvince ? new RegExp(escapeRegex(cleanProvince), 'i') : null;
  const categoryId = room.categoryId?._id || room.categoryId;

  // TẦNG 1: CÙNG QUẬN/HUYỆN + CÙNG LOẠI PHÒNG (Ưu tiên cao nhất)
  if (districtRegex) {
    const tier1Filter = {
      ...baseFilter,
      district: districtRegex,
      ...(provinceRegex ? { province: provinceRegex } : {}),
      ...(categoryId ? { categoryId } : {})
    };

    const tier1 = await Room.find(tier1Filter)
      .populate('categoryId', 'title slug')
      .populate('landlordId', 'fullName phone avatar status')
      .limit(TARGET_LIMIT)
      .lean();

    for (const r of tier1) {
      relatedRooms.push(r);
      addedIds.add(r._id.toString());
    }
  }

  // TẦNG 2: CÙNG QUẬN/HUYỆN (Các loại phòng khác trong cùng quận/huyện)
  if (relatedRooms.length < TARGET_LIMIT && districtRegex) {
    const tier2Filter = {
      ...baseFilter,
      _id: { $nin: [room._id, ...Array.from(addedIds)] },
      district: districtRegex,
      ...(provinceRegex ? { province: provinceRegex } : {})
    };

    const tier2 = await Room.find(tier2Filter)
      .populate('categoryId', 'title slug')
      .populate('landlordId', 'fullName phone avatar status')
      .limit(TARGET_LIMIT - relatedRooms.length)
      .lean();

    for (const r of tier2) {
      relatedRooms.push(r);
      addedIds.add(r._id.toString());
    }
  }

  // TẦNG 3: CÙNG TỈNH/THÀNH PHỐ + CÙNG LOẠI PHÒNG (Mở rộng sang các quận khác trong cùng tỉnh/thành)
  if (relatedRooms.length < TARGET_LIMIT && provinceRegex) {
    const tier3Filter = {
      ...baseFilter,
      _id: { $nin: [room._id, ...Array.from(addedIds)] },
      province: provinceRegex,
      ...(categoryId ? { categoryId } : {})
    };

    const tier3 = await Room.find(tier3Filter)
      .populate('categoryId', 'title slug')
      .populate('landlordId', 'fullName phone avatar status')
      .limit(TARGET_LIMIT - relatedRooms.length)
      .lean();

    for (const r of tier3) {
      relatedRooms.push(r);
      addedIds.add(r._id.toString());
    }
  }

  // TẦNG 4: CÙNG TỈNH/THÀNH PHỐ (Bất kỳ loại phòng nào trong cùng tỉnh/thành)
  if (relatedRooms.length < TARGET_LIMIT && provinceRegex) {
    const tier4Filter = {
      ...baseFilter,
      _id: { $nin: [room._id, ...Array.from(addedIds)] },
      province: provinceRegex
    };

    const tier4 = await Room.find(tier4Filter)
      .populate('categoryId', 'title slug')
      .populate('landlordId', 'fullName phone avatar status')
      .limit(TARGET_LIMIT - relatedRooms.length)
      .lean();

    for (const r of tier4) {
      relatedRooms.push(r);
      addedIds.add(r._id.toString());
    }
  }

  // SẮP XẾP ĐỘ TƯƠNG ĐỒNG:
  // 1. Cùng quận lên đầu
  // 2. Cùng loại phòng lên đầu
  // 3. Mức giá gần với giá phòng hiện tại nhất
  if (relatedRooms.length > 0) {
    relatedRooms.sort((a, b) => {
      const aSameDistrict = districtRegex ? districtRegex.test(a.district || '') : false;
      const bSameDistrict = districtRegex ? districtRegex.test(b.district || '') : false;
      if (aSameDistrict && !bSameDistrict) return -1;
      if (!aSameDistrict && bSameDistrict) return 1;

      const aSameCat = categoryId ? String(a.categoryId?._id || a.categoryId) === String(categoryId) : false;
      const bSameCat = categoryId ? String(b.categoryId?._id || b.categoryId) === String(categoryId) : false;
      if (aSameCat && !bSameCat) return -1;
      if (!aSameCat && bSameCat) return 1;

      if (room.price) {
        const diffA = Math.abs((a.price || 0) - room.price);
        const diffB = Math.abs((b.price || 0) - room.price);
        return diffA - diffB;
      }
      return 0;
    });
  }

  const roomObj = typeof room.toObject === 'function' ? room.toObject() : room;
  if (roomObj.landlordId && roomObj.landlordId._id) {
    roomObj.landlordProfileUrl = `/landlords/${roomObj.landlordId._id}`;
  }

  return res.json({
    code: 200,
    message: 'Xem thông tin chi tiết phòng trọ',
    data: {
      room: roomObj,
      isFavorited,
      favoriteRoomIds,
      relatedRooms
    }
  });
};
