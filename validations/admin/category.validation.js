const Joi = require('joi');

module.exports.createPost = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Tên loại phòng không được để trống!',
      'string.min': 'Tên loại phòng phải có ít nhất 2 ký tự!',
      'string.max': 'Tên loại phòng không được vượt quá 100 ký tự!',
      'any.required': 'Tên loại phòng không được để trống!'
    }),
    description: Joi.string().allow('', null).optional(),
    icon: Joi.string().allow('', null).optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: true, allowUnknown: true });

  if (error) {
    return res.status(400).json({
      code: 400,
      message: error.details[0].message
    });
  }

  next();
};
