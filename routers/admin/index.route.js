const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard.route');
const landlordRoutes = require('./landlord.route');
const roomRoutes = require('./room.route');
const userRoutes = require('./user.route');
const categoryRoutes = require('./category.route');
const accountRoutes = require('./account.route');
const accountController = require('../../controllers/admin/account.controller');
const { requireAdminAuth } = require('../../middlewares/auth.middleware');

// Điều hướng mặc định về Dashboard
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// Trang đăng nhập / đăng xuất riêng biệt cho Admin
router.get('/login', accountController.loginGet);
router.get('/logout', accountController.logoutGet);

// Phân hệ Account (cho chuẩn Project-1: /admin/account/login, /admin/account/logout)
router.use('/account', accountRoutes);

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
