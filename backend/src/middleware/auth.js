const jwt = require('jsonwebtoken');
const HttpError = require('../utils/httpError');

function auth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Authentication required'));
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret'); next(); }
  catch { next(new HttpError(401, 'Invalid or expired token')); }
}

function permit(...roles) {
  return (req, _res, next) => roles.includes(req.user.role) ? next() : next(new HttpError(403, 'Forbidden'));
}

module.exports = { auth, permit };
