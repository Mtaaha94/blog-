const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true, text: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PostSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Post', PostSchema);
