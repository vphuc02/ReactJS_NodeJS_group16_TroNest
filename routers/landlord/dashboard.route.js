const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/landlord/dashboard.controller');

router.get('/', dashboardController.index);

module.exports = router;
