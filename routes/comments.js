const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticate = require('../middleware/auth');
const validateQuery = require('../middleware/validateQuery');
const Joi = require('joi');

const commentsQuerySchema = Joi.object({ page: Joi.number().integer().min(1).optional(), limit: Joi.number().integer().min(1).max(100).optional() });

router.get('/:id/comments', validateQuery(commentsQuerySchema), commentController.getComments);
router.post('/:id/comments', authenticate, commentController.addComment);

module.exports = router;
