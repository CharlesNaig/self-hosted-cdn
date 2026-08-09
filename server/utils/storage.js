import crypto from 'crypto';
import fs from 'fs/promises';
import { createReadStream, constants } from 'fs';
import path from 'path';
import { MIME_EXTENSIONS, SUPPORTED_EXTENSIONS } from '../config.js';

const IDENTIFIER = new RegExp(`^[a-f0-9]{64}\\.(?:${[...SUPPORTED_EXTENSIONS].map((extension) => extension.replace('.', '\\.')).join('|')})$`);
const attachmentMimes = new Set(['image/svg+xml', 'text/markdown', 'text/csv', 'application/json', 'application/xml', 'text/xml', 'application/zip', 'application/x-7z-compressed', 'application/vnd.rar', 'application/x-tar', 'application/gzip']);
const textMimes = new Set(['text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/xml', 'text/xml']);

export async function ensureStorage(config) { await fs.mkdir(config.storagePath, { recursive: true }); await fs.mkdir(config.tempStoragePath, { recursive: true }); }
export async function hashFile(filePath) { const hash = crypto.createHash('sha256'); for await (const chunk of createReadStream(filePath)) hash.update(chunk); return hash.digest('hex'); }

function has(data, offset, value) { return data.subarray(offset, offset + value.length).equals(Buffer.from(value)); }
function isText(data) { return !data.includes(0) && !data.some((value) => value < 9 || (value > 13 && value < 32)); }
function textMime(data, declaredMime) {
  if (!isText(data)) return null;
  const text = data.toString('utf8').trimStart();
  if (declaredMime === 'application/json') { try { JSON.parse(text); return 'application/json'; } catch { return null; } }
  if (declaredMime === 'application/xml' || declaredMime === 'text/xml') return text.startsWith('<') ? declaredMime : null;
  if (declaredMime === 'image/svg+xml') return /<svg(?:\s|>)/i.test(text) ? 'image/svg+xml' : null;
  return textMimes.has(declaredMime) ? declaredMime : null;
}

export async function detectMime(filePath, declaredMime) {
  const handle = await fs.open(filePath, 'r'); const buffer = Buffer.alloc(512); const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0); await handle.close(); const data = buffer.subarray(0, bytesRead);
  if (has(data, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (has(data, 0, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (data.subarray(0, 6).toString('ascii') === 'GIF87a' || data.subarray(0, 6).toString('ascii') === 'GIF89a') return 'image/gif';
  if (has(data, 0, 'RIFF') && has(data, 8, 'WEBP')) return 'image/webp';
  if (has(data, 4, 'ftyp')) { const brand = data.subarray(8, 12).toString('ascii'); if (brand === 'avif' || brand === 'avis') return 'image/avif'; if (brand === 'M4A ' || brand === 'M4B ') return 'audio/mp4'; if (brand === 'qt  ') return 'video/quicktime'; return declaredMime === 'video/mp4' ? 'video/mp4' : null; }
  if (has(data, 0, '%PDF-')) return 'application/pdf'; if (has(data, 0, 'PK\x03\x04') || has(data, 0, 'PK\x05\x06')) return 'application/zip'; if (has(data, 0, '7z\xbc\xaf\x27\x1c')) return 'application/x-7z-compressed'; if (has(data, 0, 'Rar!\x1a\x07')) return 'application/vnd.rar'; if (has(data, 0, [0x1f, 0x8b])) return 'application/gzip'; if (has(data, 257, 'ustar')) return 'application/x-tar';
  if (has(data, 0, 'ID3') || (data[0] === 0xff && [0xfb, 0xf3, 0xf2].includes(data[1]))) return 'audio/mpeg'; if (has(data, 0, 'RIFF') && has(data, 8, 'WAVE')) return 'audio/wav'; if (has(data, 0, 'OggS')) return 'audio/ogg'; if (has(data, 0, 'fLaC')) return 'audio/flac'; if (has(data, 0, [0x1a, 0x45, 0xdf, 0xa3])) return ['video/webm', 'video/x-matroska'].includes(declaredMime) ? declaredMime : null;
  if (has(data, 0, 'wOFF')) return 'font/woff'; if (has(data, 0, 'wOF2')) return 'font/woff2'; if (has(data, 0, 'OTTO')) return 'font/otf'; if (has(data, 0, [0x00, 0x01, 0x00, 0x00]) || has(data, 0, 'true')) return 'font/ttf';
  return textMime(data, declaredMime);
}

export function validateUpload(file, detectedMime, config) {
  const extension = path.extname(file.originalname).slice(1).toLowerCase();
  if (!detectedMime || file.mimetype !== detectedMime || !config.allowedMimeTypes.has(detectedMime)) throw Object.assign(new Error('Unsupported or mismatched file type'), { status: 415 });
  if (!config.allowedExtensions.has(extension) || !MIME_EXTENSIONS.get(detectedMime).includes(extension)) throw Object.assign(new Error('Unsupported file extension'), { status: 415 });
  return extension;
}
export function objectName(sha256, extension) { return `${sha256}.${extension}`; }
export function isObjectName(value) { return IDENTIFIER.test(value); }
export function objectPath(config, name) { if (!isObjectName(name)) return null; const resolved = path.resolve(config.storagePath, name); return resolved.startsWith(`${config.storagePath}${path.sep}`) ? resolved : null; }
export function requiresAttachment(mime) { return attachmentMimes.has(mime); }
export async function removeIfExists(filePath) { try { await fs.unlink(filePath); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } }
export async function moveIntoStorage(tempPath, targetPath) { await fs.rename(tempPath, targetPath); }
export async function storageReady(config) { try { await ensureStorage(config); await fs.access(config.storagePath, constants.W_OK); const probePath = path.join(config.tempStoragePath, `.health-${crypto.randomUUID()}`); await fs.writeFile(probePath, 'ok', { flag: 'wx' }); await removeIfExists(probePath); const stats = await fs.statfs(config.storagePath); return stats.bavail * stats.bsize >= config.minFreeDiskBytes; } catch { return false; } }
