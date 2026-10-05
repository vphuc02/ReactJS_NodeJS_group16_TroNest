const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/client/room.controller');

router.get('/', roomController.index);
router.get('/detail/:id', roomController.detail);

module.exports = router;
