import crypto from 'crypto';

export function createApiKeyAuth(config) {
  return function apiKeyAuth(req, res, next) {
    const supplied = req.get('x-api-key');
    if (!supplied) return res.status(401).json({ error: 'Authentication required' });
    const expectedBuffer = Buffer.from(config.adminApiKey);
    const suppliedBuffer = Buffer.from(supplied);
    if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
      return res.status(403).json({ error: 'Invalid authentication credentials' });
    }
    return next();
  };
}
