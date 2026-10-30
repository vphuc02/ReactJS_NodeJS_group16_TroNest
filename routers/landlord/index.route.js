const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard.route');
const roomRoutes = require('./room.route');
const profileRoutes = require('./profile.route');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { ROLES } = require('../../configs/system.config');

// Chặn truy cập nếu không phải Landlord hoặc Admin
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
