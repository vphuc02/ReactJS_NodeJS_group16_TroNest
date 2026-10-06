const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard.route');
const landlordRoutes = require('./landlord.route');
const roomRoutes = require('./room.route');
const userRoutes = require('./user.route');
const categoryRoutes = require('./category.route');
const accountController = require('../../controllers/admin/account.controller');
const accountValidation = require('../../validations/shared/auth.validation');
const { requireAdminAuth } = require('../../middlewares/auth.middleware');
const { createRateLimiter } = require('../../middlewares/security.middleware');

const adminLoginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Bạn đã thử đăng nhập quá nhiều lần, vui lòng thử lại sau 15 phút.'
});

// Điều hướng mặc định về Dashboard
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// Trang đăng nhập / đăng xuất riêng biệt cho Admin
router.get('/login', accountController.loginGet);
router.post('/login', adminLoginRateLimit, accountValidation.loginPost, accountController.loginPost);
router.post('/logout', accountController.logoutPost);

// Yêu cầu quyền ADMIN riêng biệt cho toàn bộ các tính năng quản trị bên dưới
router.use(requireAdminAuth);

router.use('/dashboard', dashboardRoutes);
router.use('/landlords', landlordRoutes);
router.use('/rooms', roomRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);

// Xử lý 404 riêng cho phân hệ Admin
router.use((req, res) => {
  res.status(404).render('admin/pages/error-404', {
    title: '404 - Không tìm thấy trang'
  });
});

module.exports = router;
