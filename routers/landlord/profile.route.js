const express = require('express');
const router = express.Router();

const profileController = require('../../controllers/landlord/profile.controller');
const profileValidation = require('../../validations/client/profile.validation');
const { uploadAvatar } = require('../../middlewares/upload.middleware');

router.get('/', profileController.index);
router.post('/avatar', uploadAvatar, profileController.uploadAvatarPost);
router.post('/edit', uploadAvatar, profileValidation.updateProfile, profileController.editPost);
router.post(
  '/change-password',
  profileValidation.changePassword,
  profileController.changePasswordPost
);

module.exports = router;
