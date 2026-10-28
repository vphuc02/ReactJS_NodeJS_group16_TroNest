const User = require('../../models/user.model');
const Favorite = require('../../models/favorite.model');
const { AppError } = require('../../helpers/error.helper');

// [GET] /account
module.exports.index = async (req, res) => {
  const [profile, favoriteCount] = await Promise.all([
    User.findById(req.user._id).select('-password').lean(),
    Favorite.countDocuments({ userId: req.user._id })
  ]);

  if (!profile) {
    throw new AppError(404, 'Không tìm thấy thông tin tài khoản!');
  }

  res.render('client/pages/account', {
    title: 'Thông tin tài khoản - TroNest',
    profile,
    favoriteCount
  });
};
