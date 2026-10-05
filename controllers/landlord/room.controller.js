const Room = require('../../models/room.model');
const Category = require('../../models/category.model');

// [GET] /landlord/rooms
module.exports.index = async (req, res) => {
  try {
    const landlordId = req.user._id;
    const { status, keyword } = req.query;

    const filter = { landlordId };
    if (status && ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      filter.status = status;
    }
    if (keyword && keyword.trim() !== '') {
      filter.title = { $regex: keyword.trim(), $options: 'i' };
    }

    const rooms = await Room.find(filter)
      .sort({ updatedAt: -1 })
      .populate('categoryId', 'title')
      .lean();

    res.render('landlord/pages/room-list', {
      title: 'Quản lý bài đăng phòng trọ - TroNest',
      rooms,
      statusFilter: status || '',
      keyword: keyword || '',
      landlordStatus: req.user.status
    });
  } catch (error) {
    console.error('Error in landlord room index:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải danh sách bài đăng'
    });
  }
};

// [GET] /landlord/rooms/create
module.exports.createGet = async (req, res) => {
  try {
    // Chỉ chủ trọ được duyệt mới có quyền đăng phòng
    if (req.user.status !== 'APPROVED') {
      return res.render('landlord/pages/pending-approval', {
        title: 'Tài khoản chưa được duyệt',
        status: req.user.status,
        rejectReason: req.user.rejectReason
      });
    }

    const categories = await Category.find({ status: 'ACTIVE' }).lean();

    res.render('landlord/pages/room-create', {
      title: 'Đăng tin phòng trọ mới - TroNest',
      categories
    });
  } catch (error) {
    console.error('Error in landlord room createGet:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải form tạo bài đăng'
    });
  }
};

// [POST] /landlord/rooms/create
module.exports.createPost = async (req, res) => {
  try {
    if (req.user.status !== 'APPROVED') {
      return res.status(403).json({
        code: 403,
        message: 'Tài khoản của bạn chưa được duyệt, không thể đăng bài!'
      });
    }

    const {
      title,
      categoryId,
      price,
      deposit,
      area,
      capacity,
      province,
      district,
      ward,
      address,
      thumbnail,
      images,
      description,
      amenities,
      electricityPrice,
      waterPrice,
      servicePrice,
      actionStatus // "DRAFT" hoặc "PENDING"
    } = req.body;

    if (!title || !categoryId || !price || !area || !address) {
      return res.status(400).json({
        code: 400,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!'
      });
    }

    // Xử lý amenities (mảng hoặc chuỗi)
    let parsedAmenities = [];
    if (Array.isArray(amenities)) {
      parsedAmenities = amenities;
    } else if (typeof amenities === 'string' && amenities.trim() !== '') {
      parsedAmenities = [amenities];
    }

    const chosenStatus = actionStatus === 'PENDING' ? 'PENDING' : 'DRAFT';

    // Xử lý danh sách hình ảnh (tối đa 6 ảnh)
    let parsedImages = [];
    if (Array.isArray(images)) {
      parsedImages = images.map(img => String(img).trim()).filter(Boolean);
    } else if (typeof images === 'string' && images.trim() !== '') {
      parsedImages = [images.trim()];
    }

    if (parsedImages.length > 6) {
      parsedImages = parsedImages.slice(0, 6);
    }

    let chosenThumb = thumbnail && typeof thumbnail === 'string' && thumbnail.trim() !== ''
      ? thumbnail.trim()
      : (parsedImages.length > 0 ? parsedImages[0] : '/client/assets/images/product-1.jpg');

    if (parsedImages.length === 0) {
      parsedImages = [chosenThumb];
    } else if (!parsedImages.includes(chosenThumb)) {
      parsedImages.unshift(chosenThumb);
      if (parsedImages.length > 6) {
        parsedImages = parsedImages.slice(0, 6);
      }
    }

    const newRoom = new Room({
      title: title.trim(),
      categoryId,
      landlordId: req.user._id,
      price: Number(price),
      deposit: Number(deposit) || 0,
      area: Number(area),
      capacity: Number(capacity) || 2,
      province: province || 'Hà Nội',
      district: district || 'Cầu Giấy',
      ward: ward || '',
      address: address.trim(),
      thumbnail: chosenThumb,
      images: parsedImages,
      description: description || '',
      amenities: parsedAmenities,
      electricityPrice: electricityPrice || '3.800 đ/kWh',
      waterPrice: waterPrice || '30.000 đ/m³',
      servicePrice: servicePrice || '100.000 đ/tháng',
      status: chosenStatus
    });

    await newRoom.save();

    const message =
      chosenStatus === 'PENDING'
        ? 'Bài đăng đã được gửi đi và đang chờ Admin phê duyệt!'
        : 'Bài đăng đã được lưu vào bản nháp (DRAFT)!';

    return res.json({
      code: 200,
      message,
      roomId: newRoom._id
    });
  } catch (error) {
    console.error('Error in landlord room createPost:', error);
    return res.status(500).json({
      code: 500,
      message: 'Không thể tạo bài đăng, vui lòng kiểm tra lại thông tin!'
    });
  }
};

// [GET] /landlord/rooms/edit/:id
module.exports.editGet = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOne({
      _id: id,
      landlordId: req.user._id
    }).lean();

    if (!room) {
      return res.status(404).render('client/pages/error', {
        title: 'Không tìm thấy bài đăng',
        message: 'Bài đăng không tồn tại hoặc bạn không có quyền chỉnh sửa!'
      });
    }

    const categories = await Category.find({ status: 'ACTIVE' }).lean();

    res.render('landlord/pages/room-edit', {
      title: 'Chỉnh sửa bài đăng - TroNest',
      room,
      categories
    });
  } catch (error) {
    console.error('Error in landlord room editGet:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải thông tin chỉnh sửa'
    });
  }
};

// [POST] /landlord/rooms/edit/:id
module.exports.editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      categoryId,
      price,
      deposit,
      area,
      capacity,
      province,
      district,
      ward,
      address,
      thumbnail,
      images,
      description,
      amenities,
      electricityPrice,
      waterPrice,
      servicePrice,
      actionStatus
    } = req.body;

    const room = await Room.findOne({
      _id: id,
      landlordId: req.user._id
    });

    if (!room) {
      return res.status(404).json({
        code: 404,
        message: 'Bài đăng không tồn tại hoặc bạn không có quyền sửa!'
      });
    }

    let parsedAmenities = [];
    if (Array.isArray(amenities)) {
      parsedAmenities = amenities;
    } else if (typeof amenities === 'string' && amenities.trim() !== '') {
      parsedAmenities = [amenities];
    }

    // Xử lý danh sách hình ảnh (tối đa 6 ảnh)
    let parsedImages = [];
    if (Array.isArray(images)) {
      parsedImages = images.map(img => String(img).trim()).filter(Boolean);
    } else if (typeof images === 'string' && images.trim() !== '') {
      parsedImages = [images.trim()];
    }

    if (parsedImages.length > 6) {
      parsedImages = parsedImages.slice(0, 6);
    }

    let chosenThumb = thumbnail && typeof thumbnail === 'string' && thumbnail.trim() !== ''
      ? thumbnail.trim()
      : (parsedImages.length > 0 ? parsedImages[0] : (room.thumbnail || '/client/assets/images/product-1.jpg'));

    if (parsedImages.length === 0) {
      parsedImages = [chosenThumb];
    } else if (!parsedImages.includes(chosenThumb)) {
      parsedImages.unshift(chosenThumb);
      if (parsedImages.length > 6) {
        parsedImages = parsedImages.slice(0, 6);
      }
    }

    room.title = title.trim();
    room.categoryId = categoryId;
    room.price = Number(price);
    room.deposit = Number(deposit) || 0;
    room.area = Number(area);
    room.capacity = Number(capacity) || 2;
    room.province = province || room.province;
    room.district = district || room.district;
    room.ward = ward || room.ward;
    room.address = address.trim();
    room.thumbnail = chosenThumb;
    room.images = parsedImages;
    room.description = description || '';
    room.amenities = parsedAmenities;
    room.electricityPrice = electricityPrice || room.electricityPrice;
    room.waterPrice = waterPrice || room.waterPrice;
    room.servicePrice = servicePrice || room.servicePrice;

    // Cập nhật trạng thái bài đăng:
    // Nếu chọn gửi duyệt hoặc bài đang REJECTED mà bấm gửi duyệt lại -> chuyển thành PENDING
    if (actionStatus === 'PENDING') {
      room.status = 'PENDING';
      room.rejectReason = ''; // Xóa lý do từ chối cũ
    } else if (actionStatus === 'DRAFT') {
      room.status = 'DRAFT';
    }

    await room.save();

    return res.json({
      code: 200,
      message:
        room.status === 'PENDING'
          ? 'Bài đăng đã được cập nhật và gửi Admin phê duyệt!'
          : 'Cập nhật bài đăng thành công!'
    });
  } catch (error) {
    console.error('Error in landlord room editPost:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi cập nhật bài đăng!'
    });
  }
};

// [POST] /landlord/rooms/delete/:id
module.exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOneAndDelete({
      _id: id,
      landlordId: req.user._id
    });

    if (!room) {
      return res.status(404).json({
        code: 404,
        message: 'Bài đăng không tồn tại hoặc bạn không có quyền xóa!'
      });
    }

    return res.json({
      code: 200,
      message: 'Đã xóa bài đăng thành công!'
    });
  } catch (error) {
    console.error('Error in landlord room deletePost:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi máy chủ khi xóa bài đăng!'
    });
  }
};

// [POST] /landlord/rooms/submit/:id
module.exports.submitPost = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.status !== 'APPROVED') {
      return res.status(403).json({
        code: 403,
        message: 'Tài khoản Chủ trọ của bạn chưa được duyệt, không thể gửi bài!'
      });
    }

    const room = await Room.findOne({
      _id: id,
      landlordId: req.user._id
    });

    if (!room) {
      return res.status(404).json({
        code: 404,
        message: 'Bài đăng không tồn tại!'
      });
    }

    room.status = 'PENDING';
    room.rejectReason = '';
    await room.save();

    return res.json({
      code: 200,
      message: 'Bài đăng đã được gửi tới Admin để phê duyệt!'
    });
  } catch (error) {
    console.error('Error in landlord room submitPost:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi gửi bài đăng!'
    });
  }
};

// [POST] /landlord/rooms/upload-images
module.exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Vui lòng chọn ít nhất một hình ảnh để tải lên!'
      });
    }

    const fileUrls = req.files.map(file => `/uploads/rooms/${file.filename}`);
    return res.json({
      code: 200,
      message: `Đã tải lên thành công ${fileUrls.length} ảnh!`,
      urls: fileUrls
    });
  } catch (error) {
    console.error('Error in landlord room uploadImages:', error);
    return res.status(500).json({
      code: 500,
      message: 'Không thể xử lý hình ảnh tải lên!'
    });
  }
};
