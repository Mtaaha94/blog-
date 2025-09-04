const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticate = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

router.get('/posts', authenticate, isAdmin, postController.getStats);

module.exports = router;
