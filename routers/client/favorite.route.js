const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/client/favorite.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

router.use(requireAuth());

router.get('/', favoriteController.index);
router.post('/toggle/:roomId', favoriteController.toggle);

module.exports = router;
