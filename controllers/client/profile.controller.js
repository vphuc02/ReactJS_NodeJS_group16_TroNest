const bcrypt = require('bcryptjs');
const User = require('../../models/user.model');
const Favorite = require('../../models/favorite.model');
const { wantsJson } = require('../../helpers/http.helper');
const { AppError } = require('../../helpers/error.helper');

// [GET] /profile
module.exports.index = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').lean();

  if (!user) {
    throw new AppError(404, 'Không tìm thấy thông tin người dùng!');
  }

  const favoriteCount = await Favorite.countDocuments({ userId: req.user._id });

  if (wantsJson(req)) {
    return res.json({
      code: 200,
      user,
      favoriteCount
    });
  }

  res.render('client/pages/profile', {
    title: 'Thông tin cá nhân - TroNest',
    user,
    favoriteCount
  });
};

// [POST] /profile/edit
module.exports.editPost = async (req, res) => {
  const { fullName, phone, address, facebook, avatar } = req.body;

  const updateData = {
    fullName: fullName.trim(),
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    facebook: facebook ? facebook.trim() : ''
  };

  if (req.file && req.file.storedPath) {
    updateData.avatar = req.file.storedPath;
  } else if (avatar && avatar.trim()) {
    updateData.avatar = avatar.trim();
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { returnDocument: 'after' }).select('-password');

  if (!updatedUser) {
    throw new AppError(404, 'Không tìm thấy người dùng!');
  }

  return res.json({
    code: 200,
    message: 'Cập nhật thông tin cá nhân thành công!',
    user: updatedUser
  });
};

// [POST] /profile/avatar
module.exports.uploadAvatarPost = async (req, res) => {
  if (!req.file || !req.file.storedPath) {
    throw new AppError(400, 'Vui lòng chọn tệp ảnh đại diện hợp lệ từ thiết bị!');
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.storedPath },
    { returnDocument: 'after' }
  ).select('-password');

  if (!updatedUser) {
    throw new AppError(404, 'Không tìm thấy người dùng!');
  }

  return res.json({
    code: 200,
    message: 'Cập nhật ảnh đại diện thành công!',
    avatar: req.file.storedPath,
    user: updatedUser
  });
};

// [POST] /profile/change-password
module.exports.changePasswordPost = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng!');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({
      code: 400,
      message: 'Mật khẩu hiện tại không chính xác!'
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.json({
    code: 200,
    message: 'Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.'
  });
};
