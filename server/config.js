import path from 'path';

export const MIME_EXTENSIONS = new Map([
  ['image/png', ['png']], ['image/jpeg', ['jpg', 'jpeg']], ['image/webp', ['webp']], ['image/gif', ['gif']], ['image/avif', ['avif']], ['image/svg+xml', ['svg']],
  ['application/pdf', ['pdf']], ['text/plain', ['txt']], ['text/markdown', ['md']], ['text/csv', ['csv']], ['application/json', ['json']], ['application/xml', ['xml']], ['text/xml', ['xml']],
  ['application/zip', ['zip']], ['application/x-7z-compressed', ['7z']], ['application/vnd.rar', ['rar']], ['application/x-tar', ['tar']], ['application/gzip', ['gz']],
  ['audio/mpeg', ['mp3']], ['audio/wav', ['wav']], ['audio/ogg', ['ogg']], ['audio/mp4', ['m4a']], ['audio/flac', ['flac']],
  ['video/mp4', ['mp4']], ['video/webm', ['webm']], ['video/quicktime', ['mov']], ['video/x-matroska', ['mkv']],
  ['font/woff', ['woff']], ['font/woff2', ['woff2']], ['font/ttf', ['ttf']], ['font/otf', ['otf']],
]);
export const SUPPORTED_EXTENSIONS = new Set([...MIME_EXTENSIONS.values()].flat());
const MIME_ALIASES = new Map([
  ['audio/x-wav', 'audio/wav'], ['audio/x-flac', 'audio/flac'], ['audio/x-m4a', 'audio/mp4'],
  ['application/x-zip-compressed', 'application/zip'], ['application/x-rar-compressed', 'application/vnd.rar'], ['application/x-gzip', 'application/gzip'],
]);
export function normalizeMime(mime) { return MIME_ALIASES.get(mime) || mime; }

function required(env, name) { const value = env[name]?.trim(); if (!value) throw new Error(`Missing required environment variable: ${name}`); return value; }
function positiveInt(env, name) { const value = Number.parseInt(required(env, name), 10); if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer`); return value; }

export function loadConfig(env = process.env) {
  const nodeEnv = required(env, 'NODE_ENV');
  if (!['development', 'test', 'production'].includes(nodeEnv)) throw new Error('NODE_ENV must be development, test, or production');
  const allowedMimeTypes = required(env, 'ALLOWED_MIME_TYPES').split(',').map((v) => v.trim()).filter(Boolean);
  const allowedExtensions = required(env, 'ALLOWED_EXTENSIONS').split(',').map((v) => v.trim().replace(/^\./, '').toLowerCase()).filter(Boolean);
  if (!allowedMimeTypes.length || !allowedExtensions.length) throw new Error('Upload allowlists cannot be empty');
  if (allowedMimeTypes.some((mime) => !MIME_EXTENSIONS.has(mime))) throw new Error('ALLOWED_MIME_TYPES includes an unsupported MIME type');
  if (allowedExtensions.some((extension) => !SUPPORTED_EXTENSIONS.has(extension))) throw new Error('ALLOWED_EXTENSIONS includes an unsupported extension');
  if (env.TRUST_TAILSCALE_IDENTITY === 'true') throw new Error('TRUST_TAILSCALE_IDENTITY is not supported until a trusted localhost-only proxy boundary is implemented');
  return { nodeEnv, port: positiveInt(env, 'PORT'), mongoUri: required(env, 'MONGO_URI'), adminApiKey: required(env, 'ADMIN_API_KEY'), storagePath: path.resolve(required(env, 'STORAGE_PATH')), tempStoragePath: path.resolve(required(env, 'TEMP_STORAGE_PATH')), maxUploadSize: positiveInt(env, 'MAX_UPLOAD_SIZE_MB') * 1024 * 1024, storageQuotaBytes: positiveInt(env, 'STORAGE_QUOTA_MB') * 1024 * 1024, minFreeDiskBytes: positiveInt(env, 'MIN_FREE_DISK_MB') * 1024 * 1024, allowedMimeTypes: new Set(allowedMimeTypes), allowedExtensions: new Set(allowedExtensions), corsOrigin: required(env, 'CORS_ORIGIN'), logLevel: env.LOG_LEVEL?.trim() || 'info', trustProxy: 1 };
}
