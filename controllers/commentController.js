const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { getPagination } = require('../utils/pagination');

exports.getComments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const postId = req.params.id;
    const post = await Post.findById(postId).select('_id status author');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.status !== 'published') {
      if (!req.user || (req.user.role !== 'admin' && post.author?.toString() !== req.user._id?.toString())) {
        return res.status(403).json({ message: 'Not allowed to view comments on this post' });
      }
    }
    const filters = { post: postId };
    const totalDocs = await Comment.countDocuments(filters);
    const comments = await Comment.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author','name');
    res.json({ comments, pagination: { currentPage: page, perPage: limit, totalDocs, totalPages: Math.ceil(totalDocs/limit), hasNext: page*limit < totalDocs, hasPrev: page>1 } });
  } catch (err) { next(err); }
};

exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'published') return res.status(400).json({ message: 'Cannot comment on this post' });
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Comment content required' });
    const comment = await Comment.create({ content, author: req.user._id, post: req.params.id });
    res.status(201).json(comment);
  } catch (err) { next(err); }
};
