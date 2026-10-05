const express = require('express');
const router = express.Router();
const landlordController = require('../../controllers/admin/landlord.controller');

router.get('/', landlordController.index);
router.post('/approve/:id', landlordController.approve);
router.post('/reject/:id', landlordController.reject);

module.exports = router;
