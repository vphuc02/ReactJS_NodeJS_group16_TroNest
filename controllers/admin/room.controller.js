const Room = require('../../models/room.model');
const Category = require('../../models/category.model');

// [GET] /admin/rooms
module.exports.index = async (req, res) => {
  try {
    const { status, keyword } = req.query;

    const filter = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED', 'DRAFT'].includes(status)) {
      filter.status = status;
    }
    if (keyword && keyword.trim() !== '') {
      filter.title = { $regex: keyword.trim(), $options: 'i' };
    }

    const rooms = await Room.find(filter)
      .sort({ updatedAt: -1 })
      .populate('landlordId', 'fullName phone email')
      .populate('categoryId', 'title')
      .lean();

    const counts = {
      all: await Room.countDocuments(),
      pending: await Room.countDocuments({ status: 'PENDING' }),
      approved: await Room.countDocuments({ status: 'APPROVED' }),
      rejected: await Room.countDocuments({ status: 'REJECTED' }),
      draft: await Room.countDocuments({ status: 'DRAFT' })
    };

    res.render('admin/pages/room-list', {
      title: 'Quản lý & Duyệt bài đăng phòng trọ - TroNest',
      rooms,
      statusFilter: status || '',
      keyword: keyword || '',
      counts
    });
  } catch (error) {
    console.error('Error in admin rooms index:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải danh sách bài đăng'
    });
  }
};

// [GET] /admin/rooms/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id)
      .populate('categoryId', 'title')
      .populate('landlordId', 'fullName phone email address')
      .lean();

    if (!room) {
      return res.status(404).render('client/pages/error', {
        title: 'Không tìm thấy phòng',
        message: 'Bài đăng phòng trọ này không tồn tại!'
      });
    }

    res.render('admin/pages/room-detail', {
      title: `Thẩm định: ${room.title} - TroNest`,
      room
    });
  } catch (error) {
    console.error('Error in admin room detail:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải chi tiết bài đăng'
    });
  }
};

// [POST] /admin/rooms/approve/:id
module.exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByIdAndUpdate(
      id,
      { status: 'APPROVED', rejectReason: '' },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        code: 404,
        message: 'Bài đăng không tồn tại!'
      });
    }

    return res.json({
      code: 200,
      message: `Đã duyệt bài đăng "${room.title}"! Bài đăng hiện đã hiển thị công khai trên website.`
    });
  } catch (error) {
    console.error('Error in approve room:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi máy chủ khi duyệt bài đăng!'
    });
  }
};

// [POST] /admin/rooms/reject/:id
module.exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const room = await Room.findByIdAndUpdate(
      id,
      {
        status: 'REJECTED',
        rejectReason: reason || 'Nội dung bài đăng không đáp ứng tiêu chuẩn của TroNest.'
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        code: 404,
        message: 'Bài đăng không tồn tại!'
      });
    }

    return res.json({
      code: 200,
      message: `Đã từ chối bài đăng "${room.title}"!`
    });
  } catch (error) {
    console.error('Error in reject room:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi máy chủ khi từ chối bài đăng!'
    });
  }
};

// [POST] /admin/rooms/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return res.status(404).json({
        code: 404,
        message: 'Bài đăng không tồn tại!'
      });
    }

    return res.json({
      code: 200,
      message: 'Đã xóa bài đăng khỏi hệ thống thành công!'
    });
  } catch (error) {
    console.error('Error in delete room:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi máy chủ khi xóa bài đăng!'
    });
  }
};
