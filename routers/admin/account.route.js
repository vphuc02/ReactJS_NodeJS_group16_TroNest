const express = require('express');
const router = express.Router();
const accountControllers = require('../../controllers/admin/account.controller');
const accountValidations = require('../../validations/admin/account.validation');

// Trang đăng nhập, đăng xuất quản trị viên
router.get('/login', accountControllers.loginGet);
router.post('/login', accountValidations.loginPost, accountControllers.loginPost);
router.get('/logout', accountControllers.logoutGet);

module.exports = router;
