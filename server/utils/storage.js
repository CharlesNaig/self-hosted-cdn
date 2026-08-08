import crypto from 'crypto';
import fs from 'fs/promises';
import { createReadStream, constants } from 'fs';
import path from 'path';
import { MIME_EXTENSIONS } from '../config.js';

const IDENTIFIER = /^[a-f0-9]{64}\.(?:png|jpg|gif|webp|avif|svg)$/;

export async function ensureStorage(config) {
  await fs.mkdir(config.storagePath, { recursive: true });
  await fs.mkdir(config.tempStoragePath, { recursive: true });
}

export async function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest('hex');
}

export async function detectMime(filePath) {
  const handle = await fs.open(filePath, 'r');
  const buffer = Buffer.alloc(64);
  const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
  await handle.close();
  const data = buffer.subarray(0, bytesRead);
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (data.subarray(0, 6).toString('ascii') === 'GIF87a' || data.subarray(0, 6).toString('ascii') === 'GIF89a') return 'image/gif';
  if (data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (data.subarray(4, 12).toString('ascii').includes('avif')) return 'image/avif';
  const text = data.toString('utf8').trimStart().toLowerCase();
  if (text.startsWith('<svg') || text.startsWith('<?xml') && text.includes('<svg')) return 'image/svg+xml';
  return null;
}

export function validateUpload(file, detectedMime, config) {
  const extension = path.extname(file.originalname).slice(1).toLowerCase();
  if (!detectedMime || file.mimetype !== detectedMime || !config.allowedMimeTypes.has(detectedMime)) {
    throw Object.assign(new Error('Unsupported or mismatched file type'), { status: 415 });
  }
  if (!config.allowedExtensions.has(extension) || MIME_EXTENSIONS.get(detectedMime) !== extension) {
    throw Object.assign(new Error('Unsupported file extension'), { status: 415 });
  }
  return extension;
}

export function objectName(sha256, extension) { return `${sha256}.${extension}`; }
export function isObjectName(value) { return IDENTIFIER.test(value); }
export function objectPath(config, name) {
  if (!isObjectName(name)) return null;
  const resolved = path.resolve(config.storagePath, name);
  return resolved.startsWith(`${config.storagePath}${path.sep}`) ? resolved : null;
}
export async function removeIfExists(filePath) { try { await fs.unlink(filePath); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } }
export async function moveIntoStorage(tempPath, targetPath) { await fs.rename(tempPath, targetPath); }
export async function storageReady(config) {
  try {
    await ensureStorage(config);
    await fs.access(config.storagePath, constants.W_OK);
    const probePath = path.join(config.tempStoragePath, `.health-${crypto.randomUUID()}`);
    await fs.writeFile(probePath, 'ok', { flag: 'wx' });
    await removeIfExists(probePath);
    const stats = await fs.statfs(config.storagePath);
    return stats.bavail * stats.bsize >= config.minFreeDiskBytes;
  } catch { return false; }
}
