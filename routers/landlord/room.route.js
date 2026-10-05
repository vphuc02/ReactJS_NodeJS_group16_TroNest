const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/landlord/room.controller');
const roomValidation = require('../../validations/landlord/room.validation');
const { uploadRoomImages } = require('../../middlewares/upload.middleware');
const { requireApprovedLandlord } = require('../../middlewares/auth.middleware');

router.get('/', roomController.index);
router.get('/create', requireApprovedLandlord, roomController.createGet);
router.post('/create', requireApprovedLandlord, roomValidation.createPost, roomController.createPost);
router.get('/edit/:id', requireApprovedLandlord, roomController.editGet);
router.post('/edit/:id', requireApprovedLandlord, roomValidation.editPost, roomController.editPost);
router.post('/delete/:id', requireApprovedLandlord, roomController.deletePost);
router.post('/submit/:id', requireApprovedLandlord, roomController.submitPost);
router.post('/upload-images', requireApprovedLandlord, uploadRoomImages, roomController.uploadImages);

module.exports = router;
