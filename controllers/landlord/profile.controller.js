const User = require('../../models/user.model');
const Room = require('../../models/room.model');
const { wantsJson } = require('../../helpers/http.helper');
const { AppError } = require('../../helpers/error.helper');
const clientProfileController = require('../client/profile.controller');

// [GET] /landlord/profile
module.exports.index = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').lean();

  if (!user) {
    throw new AppError(404, 'Không tìm thấy thông tin chủ trọ!');
  }

  const roomCount = await Room.countDocuments({ landlordId: req.user._id });

  if (wantsJson(req)) {
    return res.json({
      code: 200,
      user,
      roomCount
    });
  }

  res.render('landlord/pages/profile', {
    title: 'Thông tin cá nhân - Kênh Chủ Trọ TroNest',
    user,
    roomCount,
    landlordStatus: user.status,
    rejectReason: user.rejectReason
  });
};

module.exports.editPost = clientProfileController.editPost;
module.exports.uploadAvatarPost = clientProfileController.uploadAvatarPost;
module.exports.changePasswordPost = clientProfileController.changePasswordPost;
