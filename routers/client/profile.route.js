const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/client/profile.controller');
const profileValidation = require('../../validations/client/profile.validation');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { uploadAvatar } = require('../../middlewares/upload.middleware');

// Khách hàng cần đăng nhập để xem và quản lý thông tin cá nhân
router.use(requireAuth());

router.get('/', profileController.index);
router.post('/avatar', uploadAvatar, profileController.uploadAvatarPost);
router.post('/edit', uploadAvatar, profileValidation.updateProfile, profileController.editPost);
router.post('/change-password', profileValidation.changePassword, profileController.changePasswordPost);

module.exports = router;
