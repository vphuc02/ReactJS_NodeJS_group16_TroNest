const Joi = require('joi');

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Vui lòng nhập họ tên!',
    'string.min': 'Họ tên phải có ít nhất 2 ký tự!',
    'string.max': 'Họ tên không được vượt quá 100 ký tự!',
    'any.required': 'Vui lòng nhập họ tên!'
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{9,11}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ (phải gồm 9-11 chữ số)!'
    }),
  address: Joi.string().allow('', null).optional(),
  avatar: Joi.string().allow('', null).optional()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Vui lòng nhập mật khẩu hiện tại!',
    'any.required': 'Mật khẩu hiện tại là bắt buộc!'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.empty': 'Vui lòng nhập mật khẩu mới!',
    'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự!',
    'any.required': 'Mật khẩu mới là bắt buộc!'
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Mật khẩu xác nhận không khớp với mật khẩu mới!',
      'string.empty': 'Vui lòng xác nhận lại mật khẩu mới!',
      'any.required': 'Vui lòng xác nhận lại mật khẩu mới!'
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
  updateProfile: validateJson(updateProfileSchema),
  changePassword: validateJson(changePasswordSchema),
  updateProfileSchema,
  changePasswordSchema
};
