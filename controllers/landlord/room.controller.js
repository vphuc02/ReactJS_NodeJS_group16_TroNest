const mongoose = require('mongoose');
const Room = require('../../models/room.model');
const Category = require('../../models/category.model');
const { ROOM_DEFAULTS, ROOM_STATUS, USER_STATUS } = require('../../configs/system.config');
const { escapeRegex, isSafeStoredImagePath } = require('../../helpers/security.helper');
const { AppError } = require('../../helpers/error.helper');
const { removeUnreferencedImages } = require('../../helpers/room.helper');
const { queryText, queryPage, pagination } = require('../../helpers/query.helper');
const Favorite = require('../../models/favorite.model');

const DEFAULT_ROOM_VALUES = {
  ...ROOM_DEFAULTS
};

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim() !== '') return [value.trim()];
  return [];
};

const parseImages = ({ images, thumbnail, fallbackThumbnail }) => {
  let parsedImages = parseArrayField(images).filter(isSafeStoredImagePath).slice(0, 6);

  let chosenThumb =
    typeof thumbnail === 'string' && isSafeStoredImagePath(thumbnail.trim())
      ? thumbnail.trim()
      : parsedImages[0] || fallbackThumbnail || DEFAULT_ROOM_VALUES.thumbnail;

  if (!isSafeStoredImagePath(chosenThumb)) {
    chosenThumb = DEFAULT_ROOM_VALUES.thumbnail;
  }

  if (parsedImages.length === 0) {
    parsedImages = [chosenThumb];
  } else if (!parsedImages.includes(chosenThumb)) {
    parsedImages.unshift(chosenThumb);
    parsedImages = parsedImages.slice(0, 6);
  }

  return { parsedImages, chosenThumb };
};

const buildRoomPayload = (body, currentRoom = null) => {
  const { parsedImages, chosenThumb } = parseImages({
    images: body.images,
    thumbnail: body.thumbnail,
    fallbackThumbnail: currentRoom?.thumbnail
  });

  return {
    title: body.title.trim(),
    categoryId: body.categoryId,
    price: Number(body.price),
    deposit: Number(body.deposit) || 0,
    area: Number(body.area),
    capacity: Number(body.capacity) || 2,
    province: body.province || currentRoom?.province || DEFAULT_ROOM_VALUES.province,
    district: body.district || currentRoom?.district || DEFAULT_ROOM_VALUES.district,
    ward: body.ward || currentRoom?.ward || DEFAULT_ROOM_VALUES.ward,
    address: body.address.trim(),
    thumbnail: chosenThumb,
    images: parsedImages,
    description: body.description || '',
    amenities: parseArrayField(body.amenities),
    electricityPrice:
      body.electricityPrice ||
      currentRoom?.electricityPrice ||
      DEFAULT_ROOM_VALUES.electricityPrice,
    waterPrice: body.waterPrice || currentRoom?.waterPrice || DEFAULT_ROOM_VALUES.waterPrice,
    servicePrice: body.servicePrice || currentRoom?.servicePrice || DEFAULT_ROOM_VALUES.servicePrice
  };
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// [GET] /landlord/rooms
module.exports.index = async (req, res) => {
  const landlordId = req.user._id;
  const status = queryText(req.query.status);
  const keyword = queryText(req.query.keyword);
  const page = queryPage(req.query.page);

  const filter = { landlordId };
  if (status && Object.values(ROOM_STATUS).includes(status)) {
    filter.status = status;
  }
  if (keyword && keyword.trim() !== '') {
    filter.title = { $regex: escapeRegex(keyword.trim()), $options: 'i' };
  }

  const paging = pagination(await Room.countDocuments(filter), page);
  const rooms = await Room.find(filter)
    .sort({ updatedAt: -1, _id: -1 }).skip(paging.skip).limit(paging.limit)
    .populate('categoryId', 'title')
    .lean();

  res.render('landlord/pages/room-list', {
    title: 'Quản lý bài đăng phòng trọ - TroNest',
    rooms,
    paging,
    query: { status, keyword },
    statusFilter: status || '',
    keyword: keyword || '',
    landlordStatus: req.user.status
  });
};

// [GET] /landlord/rooms/create
module.exports.createGet = async (req, res) => {
  const categories = await Category.find({ status: USER_STATUS.ACTIVE }).lean();

  res.render('landlord/pages/room-create', {
    title: 'Đăng tin phòng trọ mới - TroNest',
    categories
  });
};

// [POST] /landlord/rooms/create
module.exports.createPost = async (req, res) => {
  const { title, categoryId, price, area, address, actionStatus } = req.body;

  if (!title || !categoryId || price == null || !area || !address) {
    return res.status(400).json({
      code: 400,
      message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!'
    });
  }

  const chosenStatus =
    actionStatus === ROOM_STATUS.PENDING ? ROOM_STATUS.PENDING : ROOM_STATUS.DRAFT;
  const newRoom = new Room({
    ...buildRoomPayload(req.body),
    landlordId: req.user._id,
    status: chosenStatus
  });

  await newRoom.save();

  return res.json({
    code: 200,
    message:
      chosenStatus === ROOM_STATUS.PENDING
        ? 'Bài đăng đã được gửi đi và đang chờ Admin phê duyệt!'
        : 'Bài đăng đã được lưu vào bản nháp (DRAFT)!',
    roomId: newRoom._id
  });
};

// [GET] /landlord/rooms/edit/:id
module.exports.editGet = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new AppError(404, 'Bài đăng không tồn tại hoặc bạn không có quyền chỉnh sửa!');
  }

  const room = await Room.findOne({
    _id: id,
    landlordId: req.user._id
  }).lean();

  if (!room) {
    throw new AppError(404, 'Bài đăng không tồn tại hoặc bạn không có quyền chỉnh sửa!');
  }

  const categories = await Category.find({ status: USER_STATUS.ACTIVE }).lean();

  res.render('landlord/pages/room-edit', {
    title: 'Chỉnh sửa bài đăng - TroNest',
    room,
    categories
  });
};

// [POST] /landlord/rooms/edit/:id
module.exports.editPost = async (req, res) => {
  const { id } = req.params;
  const { actionStatus } = req.body;

  if (!isValidId(id)) {
    throw new AppError(404, 'Bài đăng không tồn tại hoặc bạn không có quyền sửa!');
  }

  const room = await Room.findOne({
    _id: id,
    landlordId: req.user._id
  });

  if (!room) {
    throw new AppError(404, 'Bài đăng không tồn tại hoặc bạn không có quyền sửa!');
  }

  const previousImages = [...(room.images || []), room.thumbnail];
  Object.assign(room, buildRoomPayload(req.body, room));

  if (actionStatus === ROOM_STATUS.PENDING) {
    room.status = ROOM_STATUS.PENDING;
    room.rejectReason = '';
  } else if (actionStatus === ROOM_STATUS.DRAFT) {
    room.status = ROOM_STATUS.DRAFT;
  } else if (room.status === ROOM_STATUS.APPROVED) {
    room.status = ROOM_STATUS.PENDING;
    room.rejectReason = '';
  }

  await room.save();

  const currentImages = new Set([room.thumbnail, ...(room.images || [])]);
  const removedImages = previousImages.filter((img) => img && !currentImages.has(img));

  if (removedImages.length > 0) {
    await removeUnreferencedImages(removedImages);
  }

  return res.json({
    code: 200,
    message:
      room.status === ROOM_STATUS.PENDING
        ? 'Bài đăng đã được cập nhật và gửi Admin phê duyệt!'
        : 'Cập nhật bài đăng thành công!'
  });
};

// [POST] /landlord/rooms/delete/:id
module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new AppError(404, 'Bài đăng không tồn tại hoặc bạn không có quyền xóa!');
  }

  const room = await Room.findOneAndDelete({
    _id: id,
    landlordId: req.user._id
  });

  if (!room) {
    throw new AppError(404, 'Bài đăng không tồn tại hoặc bạn không có quyền xóa!');
  }

  await Favorite.deleteMany({ roomId: room._id });
  await removeUnreferencedImages([...(room.images || []), room.thumbnail]);

  return res.json({
    code: 200,
    message: 'Đã xóa bài đăng thành công!'
  });
};

// [POST] /landlord/rooms/submit/:id
module.exports.submitPost = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  const room = await Room.findOne({
    _id: id,
    landlordId: req.user._id
  });

  if (!room) {
    throw new AppError(404, 'Bài đăng không tồn tại!');
  }

  room.status = ROOM_STATUS.PENDING;
  room.rejectReason = '';
  await room.save();

  return res.json({
    code: 200,
    message: 'Bài đăng đã được gửi tới Admin để phê duyệt!'
  });
};

// [POST] /landlord/rooms/upload-images
module.exports.uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      code: 400,
      message: 'Vui lòng chọn ít nhất một hình ảnh để tải lên!'
    });
  }

  const fileUrls = req.files.map((file) => `/uploads/rooms/${file.filename}`);
  return res.json({
    code: 200,
    message: `Đã tải lên thành công ${fileUrls.length} ảnh!`,
    urls: fileUrls
  });
};
