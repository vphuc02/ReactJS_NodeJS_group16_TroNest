const Joi = require('joi');
const { ROOM_STATUS, USER_STATUS } = require('../../configs/system.config');
const Category = require('../../models/category.model');
const { AppError } = require('../../helpers/error.helper');

module.exports.createPost = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(200).required().messages({
      'string.empty': 'Tiêu đề bài đăng không được để trống!',
      'string.min': 'Tiêu đề bài đăng phải từ 5 ký tự trở lên!',
      'string.max': 'Tiêu đề bài đăng không được vượt quá 200 ký tự!',
      'any.required': 'Vui lòng nhập tiêu đề bài đăng!'
    }),
    categoryId: Joi.string().hex().length(24).required().messages({
      'string.empty': 'Vui lòng chọn loại phòng trọ!',
      'any.required': 'Vui lòng chọn loại phòng trọ!'
    }),
    price: Joi.number().min(0).required().messages({
      'number.base': 'Giá thuê phải là một số hợp lệ!',
      'number.min': 'Giá thuê không thể nhỏ hơn 0!',
      'any.required': 'Vui lòng nhập giá thuê phòng!'
    }),
    deposit: Joi.number().min(0).allow(null, '').optional().messages({
      'number.base': 'Tiền cọc phải là một số hợp lệ!',
      'number.min': 'Tiền cọc không thể nhỏ hơn 0!'
    }),
    area: Joi.number().min(1).required().messages({
      'number.base': 'Diện tích phải là một số hợp lệ!',
      'number.min': 'Diện tích phải lớn hơn 0 m²!',
      'any.required': 'Vui lòng nhập diện tích phòng!'
    }),
    capacity: Joi.number().integer().min(1).allow(null, '').optional(),
    province: Joi.string().allow('', null).optional(),
    district: Joi.string().allow('', null).optional(),
    ward: Joi.string().allow('', null).optional(),
    address: Joi.string().required().messages({
      'string.empty': 'Địa chỉ chi tiết không được để trống!',
      'any.required': 'Vui lòng nhập địa chỉ chi tiết!'
    }),
    thumbnail: Joi.string().allow('', null).optional(),
    images: Joi.alternatives().try(
      Joi.array().items(Joi.string()).max(6).messages({
        'array.max': 'Chỉ được chọn tối đa 6 hình ảnh!'
      }),
      Joi.string().allow('', null)
    ).optional(),
    description: Joi.string().allow('', null).optional(),
    amenities: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
    electricityPrice: Joi.string().allow('', null).optional(),
    waterPrice: Joi.string().allow('', null).optional(),
    servicePrice: Joi.string().allow('', null).optional(),
    actionStatus: Joi.string().valid(ROOM_STATUS.DRAFT, ROOM_STATUS.PENDING).optional()
  });

  const { error, value } = schema.required().validate(req.body, { abortEarly: true, allowUnknown: true });

  if (error) {
    return res.status(400).json({
      code: 400,
      message: error.details[0].message
    });
  }

  if (!await Category.exists({ _id: value.categoryId, status: USER_STATUS.ACTIVE })) {
    throw new AppError(400, 'Loại phòng không tồn tại hoặc đã ngừng hoạt động!');
  }
  req.body = value;
  next();
};

module.exports.editPost = async (req, res, next) => {
  return module.exports.createPost(req, res, next);
};
