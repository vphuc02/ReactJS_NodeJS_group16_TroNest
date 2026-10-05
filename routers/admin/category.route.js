const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/category.controller');
const categoryValidation = require('../../validations/admin/category.validation');

router.get('/', categoryController.index);
router.post('/create', categoryValidation.createPost, categoryController.createPost);
router.post('/delete/:id', categoryController.deletePost);

module.exports = router;
