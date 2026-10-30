const express = require('express');
const router = express.Router();
const landlordController = require('../../controllers/client/landlord.controller');

// Khách thuê hoặc khách vãng lai xem thông tin công khai của chủ trọ
router.get('/:id', landlordController.detail);
router.get('/detail/:id', landlordController.detail);

module.exports = router;

