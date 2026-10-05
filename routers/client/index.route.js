const express = require('express');
const router = express.Router();

const homeRoutes = require('./home.route');
const roomRoutes = require('./room.route');
const authRoutes = require('./auth.route');
const favoriteRoutes = require('./favorite.route');

router.use('/', authRoutes);
router.use('/', homeRoutes);
router.use('/rooms', roomRoutes);
router.use('/favorites', favoriteRoutes);

module.exports = router;
