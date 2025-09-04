const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticate = require('../middleware/auth');
const { isAdmin, isAuthorOrAdmin } = require('../middleware/roles');
const Joi = require('joi');
const validate = require('../middleware/validate');
const validateQuery = require('../middleware/validateQuery');
const postsQuerySchema = require('../validation/postsQuerySchema');

const postSchema = Joi.object({ title: Joi.string().required(), content: Joi.string().required(), tags: Joi.array().items(Joi.string()), status: Joi.string().valid('draft','published') });

router.get('/', validateQuery(postsQuerySchema), postController.getPosts);
router.get('/stats', authenticate, isAdmin, postController.getStats);
router.get('/my', authenticate, postController.getMyPosts);
router.post('/', authenticate, validate(postSchema), postController.createPost);

router.use('/:id', postController.loadPost);
router.get('/:id', authenticate, postController.getPostById);
router.put('/:id', authenticate, isAuthorOrAdmin, validate(postSchema), postController.updatePost);
router.delete('/:id', authenticate, isAuthorOrAdmin, postController.deletePost);
router.patch('/:id/status', authenticate, isAuthorOrAdmin, postController.changeStatus);

module.exports = router;
