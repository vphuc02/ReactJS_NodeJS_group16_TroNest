const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/user.controller');

router.get('/', userController.index);
router.post('/toggle-status/:id', userController.toggleStatus);

module.exports = router;
