const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/landlord/room.controller');
const roomValidation = require('../../validations/landlord/room.validation');
const { uploadRoomImages } = require('../../middlewares/upload.middleware');

router.get('/', roomController.index);
router.get('/create', roomController.createGet);
router.post('/create', roomValidation.createPost, roomController.createPost);
router.get('/edit/:id', roomController.editGet);
router.post('/edit/:id', roomValidation.editPost, roomController.editPost);
router.post('/delete/:id', roomController.deletePost);
router.post('/submit/:id', roomController.submitPost);
router.post('/upload-images', uploadRoomImages, roomController.uploadImages);

module.exports = router;
