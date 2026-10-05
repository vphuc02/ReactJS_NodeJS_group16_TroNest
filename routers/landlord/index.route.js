const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard.route');
const roomRoutes = require('./room.route');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { ROLES } = require('../../configs/system.config');

// Chặn truy cập nếu không phải Landlord hoặc Admin
router.use(requireAuth([ROLES.LANDLORD, ROLES.ADMIN]));

router.get('/', (req, res) => {
  res.redirect('/landlord/dashboard');
});

router.use('/dashboard', dashboardRoutes);
router.use('/rooms', roomRoutes);

module.exports = router;
