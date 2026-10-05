const Joi = require('joi');

module.exports.loginPost = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Vui lòng nhập email của bạn!',
      'string.email': 'Email không đúng định dạng!',
      'any.required': 'Vui lòng nhập email!'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Mật khẩu không được để trống.',
      'any.required': 'Mật khẩu là bắt buộc.'
    }),
    rememberPassword: Joi.boolean().optional(),
    redirectUrl: Joi.string().allow('', null).optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: true, allowUnknown: true });

  if (error) {
    return res.json({
      code: 400,
      message: error.details[0].message
    });
  }

  next();
};

module.exports.registerPost = async (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Vui lòng nhập họ tên!',
      'string.min': 'Họ tên phải có ít nhất 2 ký tự!',
      'string.max': 'Họ tên không được vượt quá 100 ký tự!',
      'any.required': 'Vui lòng nhập họ tên!'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Vui lòng nhập email của bạn!',
      'string.email': 'Email không đúng định dạng!',
      'any.required': 'Vui lòng nhập email!'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Mật khẩu không được để trống.',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự!',
      'any.required': 'Mật khẩu là bắt buộc.'
    }),
    phone: Joi.string().pattern(/^[0-9]{9,11}$/).allow('', null).optional().messages({
      'string.pattern.base': 'Số điện thoại không đúng định dạng!'
    }),
    role: Joi.string().valid('CUSTOMER', 'LANDLORD').optional(),
    address: Joi.string().allow('', null).optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: true, allowUnknown: true });

  if (error) {
    return res.json({
      code: 400,
      message: error.details[0].message
    });
  }

  next();
};
