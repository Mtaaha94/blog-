const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { getPagination } = require('../utils/pagination');

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, tags = [], status = 'draft' } = req.body;
    const post = await Post.create({ title, content, tags, status, author: req.user._id });
    res.status(201).json(post);
  } catch (err) { next(err); }
};

exports.loadPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email role');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    req.post = post;
    next();
  } catch (err) { next(err); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const updates = {};
    ['title','content','tags','status'].forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updatedAt = Date.now();
    const updated = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (err) { next(err); }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['draft','published'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.status = status;
    post.updatedAt = Date.now();
    await post.save();
    res.json(post);
  } catch (err) { next(err); }
};

exports.getPosts = async (req, res, next) => {
  try {
    const { page, limit, skip, sortBy, order } = getPagination(req.query);
    const { search, tags } = req.query;
    const filters = {};
    if (req.query.status) filters.status = req.query.status; else filters.status = 'published';
    if (search) filters.$text = { $search: search };
    if (tags) filters.tags = { $in: tags.split(',').map(t => t.trim()).filter(Boolean) };
    const totalPosts = await Post.countDocuments(filters);
    const posts = await Post.find(filters).sort({ [sortBy]: order }).skip(skip).limit(limit).populate('author','name');
    res.json({ posts, pagination: { currentPage: page, totalPosts, totalPages: Math.ceil(totalPosts/limit), hasNext: skip + posts.length < totalPosts, hasPrev: page > 1 } });
  } catch (err) { next(err); }
};

exports.getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { next(err); }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author','name');
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.status === 'draft') {
      if (!req.user) return res.status(403).json({ message: 'Not allowed' });
      if (req.user.role !== 'admin' && post.author._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' });
    }
    res.json(post);
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    const topAuthors = await Post.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      { $project: { _id: 0, authorId: '$author._id', name: '$author.name', count: 1 } }
    ]);
    res.json({ totalPosts, publishedPosts, draftPosts, topAuthors });
  } catch (err) { next(err); }
};
