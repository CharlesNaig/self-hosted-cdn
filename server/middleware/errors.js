import multer from 'multer';

export function errorHandler(logger) {
  return (error, req, res, next) => {
    if (res.headersSent) return next(error);
    const multerStatus = error instanceof multer.MulterError
      ? (['LIMIT_FILE_SIZE', 'LIMIT_FIELD_VALUE'].includes(error.code) ? 413 : 400)
      : null;
    const status = multerStatus || error.status || 500;
    const message = error instanceof multer.MulterError
      ? (status === 413 ? 'Upload exceeds the configured size limit' : 'Unexpected multipart upload data')
      : (status < 500 ? error.message : 'Internal server error');
    logger.error('request_error', { requestId: req.requestId, method: req.method, path: req.path, status, category: error.code || error.name });
    return res.status(status).json({ error: message });
  };
}
