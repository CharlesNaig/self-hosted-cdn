import path from 'path';

const MIME_EXTENSIONS = new Map([
  ['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp'],
  ['image/gif', 'gif'], ['image/avif', 'avif'], ['image/svg+xml', 'svg'],
]);

function required(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function positiveInt(env, name) {
  const value = Number.parseInt(required(env, name), 10);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer`);
  return value;
}

export function loadConfig(env = process.env) {
  const nodeEnv = required(env, 'NODE_ENV');
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production');
  }
  const allowedMimeTypes = required(env, 'ALLOWED_MIME_TYPES').split(',').map((v) => v.trim()).filter(Boolean);
  const allowedExtensions = required(env, 'ALLOWED_EXTENSIONS').split(',').map((v) => v.trim().replace(/^\./, '').toLowerCase()).filter(Boolean);
  if (!allowedMimeTypes.length || !allowedExtensions.length) throw new Error('Upload allowlists cannot be empty');
  if (allowedMimeTypes.some((mime) => !MIME_EXTENSIONS.has(mime))) {
    throw new Error('ALLOWED_MIME_TYPES includes an unsupported MIME type');
  }
  if (allowedExtensions.some((extension) => ![...MIME_EXTENSIONS.values()].includes(extension))) {
    throw new Error('ALLOWED_EXTENSIONS includes an unsupported extension');
  }
  if (env.TRUST_TAILSCALE_IDENTITY === 'true') {
    throw new Error('TRUST_TAILSCALE_IDENTITY is not supported until a trusted localhost-only proxy boundary is implemented');
  }
  return {
    nodeEnv,
    port: positiveInt(env, 'PORT'),
    mongoUri: required(env, 'MONGO_URI'),
    adminApiKey: required(env, 'ADMIN_API_KEY'),
    storagePath: path.resolve(required(env, 'STORAGE_PATH')),
    tempStoragePath: path.resolve(required(env, 'TEMP_STORAGE_PATH')),
    maxUploadSize: positiveInt(env, 'MAX_UPLOAD_SIZE_MB') * 1024 * 1024,
    storageQuotaBytes: positiveInt(env, 'STORAGE_QUOTA_MB') * 1024 * 1024,
    minFreeDiskBytes: positiveInt(env, 'MIN_FREE_DISK_MB') * 1024 * 1024,
    allowedMimeTypes: new Set(allowedMimeTypes),
    allowedExtensions: new Set(allowedExtensions),
    corsOrigin: required(env, 'CORS_ORIGIN'),
    logLevel: env.LOG_LEVEL?.trim() || 'info',
    trustProxy: false,
  };
}

export { MIME_EXTENSIONS };
