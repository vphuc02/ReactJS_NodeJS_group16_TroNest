const Category = require('../../models/category.model');
const Room = require('../../models/room.model');
const { AppError } = require('../../helpers/error.helper');

// [GET] /admin/categories
module.exports.index = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();

  for (let cat of categories) {
    cat.roomCount = await Room.countDocuments({ categoryId: cat._id });
  }

  res.render('admin/pages/category-list', {
    title: 'Quản lý loại phòng trọ - TroNest',
    categories
  });
};

// [POST] /admin/categories/create
module.exports.createPost = async (req, res) => {
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
};

// [POST] /admin/categories/delete/:id
module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const deleted = await Category.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError(404, 'Loại phòng không tồn tại!');
  }

  return res.json({
    code: 200,
    message: 'Đã xóa loại phòng thành công!'
  });
};
