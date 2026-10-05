const Category = require('../../models/category.model');
const Room = require('../../models/room.model');

// [GET] /admin/categories
module.exports.index = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();

    for (let cat of categories) {
      cat.roomCount = await Room.countDocuments({ categoryId: cat._id });
    }

    res.render('admin/pages/category-list', {
      title: 'Quản lý loại phòng trọ - TroNest',
      categories
    });
  } catch (error) {
    console.error('Error in category index:', error);
    res.status(500).render('client/pages/error', {
      title: 'Lỗi',
      message: 'Không thể tải danh sách loại phòng'
    });
  }
};

// [POST] /admin/categories/create
module.exports.createPost = async (req, res) => {
  try {
    const { title, description, icon } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: 'Tên loại phòng không được để trống!'
      });
    }

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const newCategory = new Category({
      title: title.trim(),
      slug,
      description: description || '',
      icon: icon || 'fa-solid fa-house-chimney'
    });

    await newCategory.save();

    return res.json({
      code: 200,
      message: 'Tạo loại phòng mới thành công!'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi máy chủ khi tạo loại phòng!'
    });
  }
};

// [POST] /admin/categories/delete/:id
module.exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);

    return res.json({
      code: 200,
      message: 'Đã xóa loại phòng thành công!'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      code: 500,
      message: 'Lỗi máy chủ khi xóa loại phòng!'
    });
  }
};
