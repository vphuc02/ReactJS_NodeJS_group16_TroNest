const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../../models/user.model');
const Favorite = require('../../models/favorite.model');
const Room = require('../../models/room.model');
const ForgotPassword = require('../../models/forgot-password.model');
const { ROLES } = require('../../configs/system.config');
const { AppError } = require('../../helpers/error.helper');
const { sendResetPasswordEmail } = require('../../helpers/mail.helper');

const hashToken = (raw) => {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
};

// [GET] /profile
module.exports.index = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').lean();

  if (!user) {
    throw new AppError(404, 'Không tìm thấy thông tin người dùng!');
  }

  // Nếu là tài khoản Chủ trọ xem dạng trình duyệt (không phải JSON) -> chuyển hướng đến Kênh Chủ Trọ
  if (user.role === ROLES.LANDLORD && !req.headers.accept?.includes('application/json') && !req.xhr) {
    return res.redirect('/landlord/profile');
  }

  const favoriteCount = await Favorite.countDocuments({ userId: req.user._id });
  let roomCount = 0;
  if (user.role === ROLES.LANDLORD) {
    roomCount = await Room.countDocuments({ landlordId: req.user._id });
  }

  return res.json({
    code: 200,
    title: 'Thông tin cá nhân - TroNest',
    user,
    favoriteCount,
    roomCount
  });
};

// [POST] /profile/edit
module.exports.editPost = async (req, res) => {
  const { fullName, phone, address, facebook, avatar } = req.body;

  let cleanFacebook = facebook ? facebook.trim() : '';
  if (cleanFacebook && !cleanFacebook.startsWith('http://') && !cleanFacebook.startsWith('https://')) {
    cleanFacebook = `https://${cleanFacebook}`;
  }

  const updateData = {
    fullName: fullName.trim(),
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    facebook: cleanFacebook
  };

  if (req.file && (req.file.storedPath || req.file.path || req.file.url)) {
    updateData.avatar = req.file.storedPath || req.file.path || req.file.url;
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
  const avatarUrl = req.file ? (req.file.storedPath || req.file.path || req.file.url) : null;
  if (!avatarUrl) {
    throw new AppError(400, 'Vui lòng chọn tệp ảnh đại diện hợp lệ từ thiết bị!');
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { returnDocument: 'after' }
  ).select('-password');

  if (!updatedUser) {
    throw new AppError(404, 'Không tìm thấy người dùng!');
  }

  return res.json({
    code: 200,
    message: 'Cập nhật ảnh đại diện thành công!',
    avatar: avatarUrl,
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

// [POST] /profile/send-reset-password-email (Gửi liên kết đổi mật khẩu qua email)
module.exports.sendResetPasswordEmailPost = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng!');
  }

  const email = user.email.toLowerCase().trim();
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresInMinutes = 15;
  const expireAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await ForgotPassword.deleteMany({ email });
  await ForgotPassword.create({
    email,
    otpHash: '',
    attempts: 0,
    verified: true,
    resetTokenHash: hashToken(resetToken),
    expireAt
  });

  const protocol = req.protocol;
  const host = req.get('host');
  const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const mailResult = await sendResetPasswordEmail({
    to: email,
    fullName: user.fullName,
    resetUrl,
    expiresInMinutes
  });

  const responsePayload = {
    code: 200,
    message: mailResult.delivered
      ? `Liên kết đổi mật khẩu đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư!`
      : `Đã tạo liên kết đổi mật khẩu cho ${email} (hiệu lực ${expiresInMinutes} phút).`,
    email,
    deliveryMode: mailResult.mode
  };

  if (mailResult.devResetUrl && process.env.NODE_ENV === 'test') {
    responsePayload.devResetUrl = mailResult.devResetUrl;
  }

  return res.json(responsePayload);
};
