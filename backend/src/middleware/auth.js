const jwt         = require('jsonwebtoken');
const { Admin }   = require('../models');

module.exports = async function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Verify token_version — invalidated when password changes
    if (payload.ver !== undefined) {
      const admin = await Admin.findOne({}).lean();
      if (admin && payload.ver !== admin.tokenVersion) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
    }

    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
