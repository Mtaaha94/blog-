const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const Joi = require('joi');
const validate = require('../middleware/validate');

const roleSchema = Joi.object({ role: Joi.string().valid('admin','author').required() });

router.get('/users', authenticate, isAdmin, adminController.getAllUsers);
router.put('/users/:id/role', authenticate, isAdmin, validate(roleSchema), adminController.updateUserRole);
router.delete('/users/:id', authenticate, isAdmin, adminController.deleteUser);
router.delete('/posts/:id', authenticate, isAdmin, adminController.deletePostAdmin);
router.delete('/comments/:id', authenticate, isAdmin, adminController.deleteCommentAdmin);

module.exports = router;
