import crypto from 'crypto';

export function createLogger(level = 'info') {
  const write = (severity, event, fields = {}) => {
    if (severity === 'debug' && level !== 'debug') return;
    process.stdout.write(`${JSON.stringify({ timestamp: new Date().toISOString(), severity, event, ...fields })}\n`);
  };
  return { info: (event, fields) => write('info', event, fields), error: (event, fields) => write('error', event, fields) };
}

export function requestLogger(logger) {
  return (req, res, next) => {
    const requestId = req.get('x-request-id') || crypto.randomUUID();
    const start = process.hrtime.bigint();
    req.requestId = requestId;
    res.set('x-request-id', requestId);
    res.on('finish', () => logger.info('http_request', {
      requestId, method: req.method, path: req.path, status: res.statusCode,
      latencyMs: Number(process.hrtime.bigint() - start) / 1e6,
    }));
    next();
  };
}
