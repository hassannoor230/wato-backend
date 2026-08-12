export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') || 'Validation failed' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    const key = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({ message: `${key} already exists` });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
}
