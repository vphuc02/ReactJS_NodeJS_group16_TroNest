const express = require('express');
const router = express.Router();

const homeRoutes = require('./home.route');
const roomRoutes = require('./room.route');
const authRoutes = require('./auth.route');
const favoriteRoutes = require('./favorite.route');
const profileRoutes = require('./profile.route');

router.use('/', authRoutes);
router.use('/', homeRoutes);
router.use('/rooms', roomRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/profile', profileRoutes);
router.use('/user/profile', profileRoutes);
router.use('/account', profileRoutes);
router.use('/customer/profile', profileRoutes);

module.exports = router;
