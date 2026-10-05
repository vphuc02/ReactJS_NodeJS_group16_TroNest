const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/admin/room.controller');

router.get('/', roomController.index);
router.get('/detail/:id', roomController.detail);
router.post('/approve/:id', roomController.approve);
router.post('/reject/:id', roomController.reject);
router.post('/delete/:id', roomController.delete);

module.exports = router;
