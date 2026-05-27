function notFound(req, res) { res.status(404).json({ success:false, message:`Route ${req.method} ${req.originalUrl} not found`}); }
function errorHandler(err, _req, res, _next) {
  if (err.code && String(err.code).startsWith('P')) return res.status(400).json({ success:false, message:'Database error', code: err.code, meta: err.meta });
  const status = err.statusCode || 500;
  res.status(status).json({ success:false, message: err.message || 'Internal server error', details: err.details || null });
}
module.exports = { notFound, errorHandler };
