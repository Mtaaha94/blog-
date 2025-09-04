const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin','author'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User role updated', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deletePostAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await Comment.deleteMany({ post: id });
    res.json({ message: 'Post deleted by admin' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteCommentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted by admin' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
