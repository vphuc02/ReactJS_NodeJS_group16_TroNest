const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard.route');
const roomRoutes = require('./room.route');
const profileRoutes = require('./profile.route');
const mongoose = require('mongoose');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { ROLES } = require('../../configs/system.config');

// Chuyển hướng nếu khách truy cập nhầm định dạng /landlord/:id hoặc /landlord/detail/:id sang trang công khai trên web chính
router.get('/:id', (req, res, next) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.redirect(`/landlords/${req.params.id}`);
  }
  next();
});

router.get('/detail/:id', (req, res, next) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.redirect(`/landlords/${req.params.id}`);
  }
  next();
});

// Chặn truy cập nếu không phải Landlord hoặc Admin (cho các trang quản trị kênh chủ trọ)
router.use(requireAuth([ROLES.LANDLORD, ROLES.ADMIN]));

router.use((req, res, next) => {
  res.locals.currentPath = req.baseUrl + (req.path === '/' ? '' : req.path);
  next();
});

router.get('/', (req, res) => {
  res.redirect('/landlord/dashboard');
});

router.use('/dashboard', dashboardRoutes);
router.use('/rooms', roomRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
