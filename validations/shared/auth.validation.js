const Joi = require('joi');
const { ROLES } = require('../../configs/system.config');

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Vui lòng nhập email!',
    'string.email': 'Email không đúng định dạng!',
    'any.required': 'Vui lòng nhập email!'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Vui lòng nhập mật khẩu!',
    'any.required': 'Mật khẩu là bắt buộc!'
  }),
  rememberPassword: Joi.boolean().optional(),
  redirectUrl: Joi.string().allow('', null).optional()
});

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Vui lòng nhập họ tên!',
    'string.min': 'Họ tên phải có ít nhất 2 ký tự!',
    'string.max': 'Họ tên không được vượt quá 100 ký tự!',
    'any.required': 'Vui lòng nhập họ tên!'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Vui lòng nhập email!',
    'string.email': 'Email không đúng định dạng!',
    'any.required': 'Vui lòng nhập email!'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Vui lòng nhập mật khẩu!',
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự!',
    'any.required': 'Mật khẩu là bắt buộc!'
  }),
  phone: Joi.string().pattern(/^[0-9]{9,11}$/).allow('', null).optional().messages({
    'string.pattern.base': 'Số điện thoại không hợp lệ (phải gồm 9-11 chữ số)!'
  }),
  role: Joi.string().valid(ROLES.CUSTOMER, ROLES.LANDLORD).optional().messages({
    'any.only': 'Vai trò tài khoản không hợp lệ!'
  }),
  address: Joi.string().allow('', null).optional()
});

const validateJson = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: true, allowUnknown: true });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message
      });
    }

    next();
  };
};

module.exports = {
  loginPost: validateJson(loginSchema),
  registerPost: validateJson(registerSchema),
  loginSchema,
  registerSchema
};
