const express = require('express');
const router = express.Router();
const accountController = require('../../controllers/client/account.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { ROLES } = require('../../configs/system.config');

router.use(requireAuth([ROLES.CUSTOMER]));

router.get('/', accountController.index);

module.exports = router;
