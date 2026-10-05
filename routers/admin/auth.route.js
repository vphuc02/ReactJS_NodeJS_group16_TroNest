const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => res.redirect('/admin/account/login'));
router.get('/logout', (req, res) => res.redirect('/admin/account/logout'));

module.exports = router;
