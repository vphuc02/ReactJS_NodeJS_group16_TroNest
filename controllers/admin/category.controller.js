const Category = require('../../models/category.model');
const Room = require('../../models/room.model');
const { AppError } = require('../../helpers/error.helper');
const { queryPage, pagination } = require('../../helpers/query.helper');

// [GET] /admin/categories
module.exports.index = async (req, res) => {
  const paging = pagination(await Category.countDocuments(), queryPage(req.query.page));
  const categories = await Category.find().sort({ createdAt: -1, _id: -1 })
    .skip(paging.skip).limit(paging.limit).lean();

  const roomCounts = await Room.aggregate([
    { $match: { categoryId: { $in: categories.map((category) => category._id) } } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } }
  ]);
  const countById = new Map(roomCounts.map((item) => [String(item._id), item.count]));
  categories.forEach((category) => { category.roomCount = countById.get(String(category._id)) || 0; });

  res.render('admin/pages/category-list', {
    title: 'Quản lý loại phòng trọ - TroNest',
    categories,
    paging,
    query: {}
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
  if (await Room.exists({ categoryId: id })) {
    throw new AppError(409, 'Không thể xóa loại phòng đang được sử dụng!');
  }
  const deleted = await Category.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError(404, 'Loại phòng không tồn tại!');
  }

  return res.json({
    code: 200,
    message: 'Đã xóa loại phòng thành công!'
  });
};
