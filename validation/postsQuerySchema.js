const Joi = require('joi');

const postsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().allow('', null).optional(),
  tags: Joi.string().optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'title').optional(),
  order: Joi.string().valid('asc', 'desc').optional(),
  status: Joi.string().valid('published', 'draft').optional()
});

module.exports = postsQuerySchema;
