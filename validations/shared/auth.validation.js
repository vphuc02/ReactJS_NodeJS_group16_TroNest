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

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Vui lòng nhập địa chỉ email!',
    'string.email': 'Email không đúng định dạng!',
    'any.required': 'Vui lòng nhập địa chỉ email!'
  })
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Vui lòng nhập địa chỉ email!',
    'string.email': 'Email không đúng định dạng!',
    'any.required': 'Vui lòng nhập địa chỉ email!'
  }),
  otp: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
    'string.empty': 'Vui lòng nhập mã xác thực OTP!',
    'string.pattern.base': 'Mã OTP phải gồm đúng 6 chữ số!',
    'any.required': 'Vui lòng nhập mã xác thực OTP!'
  })
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Thiếu thông tin email khôi phục!',
    'string.email': 'Email không đúng định dạng!',
    'any.required': 'Thiếu thông tin email khôi phục!'
  }),
  resetToken: Joi.string().allow('', null).optional(),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Vui lòng nhập mật khẩu mới!',
    'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự!',
    'any.required': 'Vui lòng nhập mật khẩu mới!'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Mật khẩu xác nhận không khớp!',
    'string.empty': 'Vui lòng nhập lại mật khẩu xác nhận!',
    'any.required': 'Vui lòng nhập lại mật khẩu xác nhận!'
  })
});

const validateJson = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.required().validate(req.body, { abortEarly: true, allowUnknown: true });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  loginPost: validateJson(loginSchema),
  registerPost: validateJson(registerSchema),
  forgotPasswordPost: validateJson(forgotPasswordSchema),
  verifyOtpPost: validateJson(verifyOtpSchema),
  resetPasswordPost: validateJson(resetPasswordSchema),
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema
};
