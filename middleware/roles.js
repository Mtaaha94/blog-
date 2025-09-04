const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin role required' });
  next();
};

const isAuthorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.role === 'admin') return next();
    const ownerId = req.post?.author?.toString() || req.postAuthorId;
    if (!ownerId) return res.status(500).json({ message: 'Owner id not found on request' });
    if (ownerId !== req.user._id.toString()) return res.status(403).json({ message: 'Permission denied' });
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { isAdmin, isAuthorOrAdmin };
