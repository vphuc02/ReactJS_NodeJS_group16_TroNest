const Joi = require('joi');

module.exports.loginPost = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Vui lòng nhập Email!',
      'string.email': 'Email không đúng định dạng!',
      'any.required': 'Vui lòng nhập Email!'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Vui lòng nhập Mật khẩu!',
      'any.required': 'Mật khẩu là bắt buộc!'
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
      'string.empty': 'Vui lòng nhập Họ và tên!',
      'string.min': 'Họ và tên phải có ít nhất 2 ký tự!',
      'string.max': 'Họ và tên không được vượt quá 100 ký tự!',
      'any.required': 'Vui lòng nhập Họ và tên!'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Vui lòng nhập Email!',
      'string.email': 'Email không đúng định dạng!',
      'any.required': 'Vui lòng nhập Email!'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Vui lòng nhập Mật khẩu!',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự!',
      'any.required': 'Mật khẩu là bắt buộc!'
    }),
    phone: Joi.string().pattern(/^[0-9]{9,11}$/).allow('', null).optional().messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ (phải gồm 9-11 chữ số)!'
    }),
    role: Joi.string().valid('CUSTOMER', 'LANDLORD').optional().messages({
      'any.only': 'Vai trò tài khoản không hợp lệ!'
    }),
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
