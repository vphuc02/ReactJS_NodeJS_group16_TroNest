const express = require('express');
const router = express.Router();
const authController = require('../../controllers/client/auth.controller');
const authValidation = require('../../validations/client/auth.validation');

router.get('/login', authController.loginGet);
router.post('/login', authValidation.loginPost, authController.loginPost);
router.get('/register', authController.registerGet);
router.post('/register', authValidation.registerPost, authController.registerPost);
router.get('/logout', authController.logoutGet);

module.exports = router;
