const express = require('express');
const router = express.Router();
const authController = require('../../controllers/client/auth.controller');
const authValidation = require('../../validations/client/auth.validation');
const { createRateLimiter } = require('../../middlewares/security.middleware');

const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Bạn đã thử đăng nhập quá nhiều lần, vui lòng thử lại sau 15 phút.'
});

router.get('/login', authController.loginGet);
router.post('/login', loginRateLimit, authValidation.loginPost, authController.loginPost);
router.get('/register', authController.registerGet);
router.post('/register', authValidation.registerPost, authController.registerPost);
router.post('/logout', authController.logoutPost);

module.exports = router;
