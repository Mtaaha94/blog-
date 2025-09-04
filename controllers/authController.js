const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const refreshTokenStore = new Set();

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role });
    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id, role: user.role });
    refreshTokenStore.add(refreshToken);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id, role: user.role });
    refreshTokenStore.add(refreshToken);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokenStore.has(refreshToken)) return res.status(401).json({ message: 'Invalid refresh token' });
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ id: payload.id, role: payload.role });
    res.json({ accessToken });
  } catch (err) { next(err); }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) refreshTokenStore.delete(refreshToken);
  res.json({ message: 'Logged out' });
};
