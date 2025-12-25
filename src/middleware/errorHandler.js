import logger from '../utils/logger.js';

export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Not found' });
};

export const errorHandler = (err, req, res, next) => {
  logger.error({ err, path: req.originalUrl }, 'Unhandled error');
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  return res.status(status).json({ message });
};

export default errorHandler;
