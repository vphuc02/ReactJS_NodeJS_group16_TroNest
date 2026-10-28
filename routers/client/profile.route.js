const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/client/profile.controller');
const profileValidation = require('../../validations/client/profile.validation');
const { requireAuth } = require('../../middlewares/auth.middleware');

// Khách hàng cần đăng nhập để xem và quản lý thông tin cá nhân
router.use(requireAuth());

router.get('/', profileController.index);
router.post('/edit', profileValidation.updateProfile, profileController.editPost);
router.post('/change-password', profileValidation.changePassword, profileController.changePasswordPost);

module.exports = router;
