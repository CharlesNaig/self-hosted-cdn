import multer from 'multer';

export function errorHandler(logger) {
  return (error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE' ? 413 : (error.status || 500);
    const message = status === 413 ? 'Upload exceeds the configured size limit' : (status < 500 ? error.message : 'Internal server error');
    logger.error('request_error', { requestId: req.requestId, method: req.method, path: req.path, status, category: error.code || error.name });
    return res.status(status).json({ error: message });
  };
}
