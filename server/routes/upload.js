import crypto from 'crypto';
import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import fs from 'fs/promises';
import path from 'path';
import { normalizeMime } from '../config.js';
import { createApiKeyAuth } from '../middleware/apiKeyAuth.js';
import { detectMime, hashFile, moveIntoStorage, objectName, objectPath, removeIfExists, validateUpload } from '../utils/storage.js';

function response(file, duplicate) {
  return { originalName: file.originalName, storedName: file.storedName, mime: file.mime, size: file.size, sha256: file.sha256, url: file.url, duplicate };
}

export function createUploadRouter({ config, File }) {
  const router = express.Router();
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, config.tempStoragePath),
      filename: (req, file, cb) => cb(null, crypto.randomUUID()),
    }),
    limits: { fileSize: config.maxUploadSize, files: 1 },
  });
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
  const auth = createApiKeyAuth(config);

  router.post('/upload', limiter, auth, upload.single('file'), async (req, res, next) => {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const temporaryPath = req.file.path;
    let finalizedPath;
    let createdPhysicalObject = false;
    let sha256;
    try {
      const normalizedMime = normalizeMime(req.file.mimetype);
      const detectedMime = await detectMime(temporaryPath, normalizedMime);
      const extension = validateUpload({ ...req.file, mimetype: normalizedMime }, detectedMime, config);
      sha256 = await hashFile(temporaryPath);
      const existing = await File.findOne({ sha256 });
      if (existing) {
        await removeIfExists(temporaryPath);
        return res.json(response(existing, true));
      }
      const [{ total = 0 } = {}] = await File.aggregate([{ $group: { _id: null, total: { $sum: '$size' } } }]);
      if (total + req.file.size > config.storageQuotaBytes) {
        await removeIfExists(temporaryPath);
        return res.status(413).json({ error: 'Storage quota exceeded' });
      }
      const storedName = objectName(sha256, extension);
      finalizedPath = objectPath(config, storedName);
      try {
        await fs.access(finalizedPath);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        await moveIntoStorage(temporaryPath, finalizedPath);
        createdPhysicalObject = true;
      }
      const document = await File.create({ storedName, originalName: path.basename(req.file.originalname), mime: detectedMime, size: req.file.size, sha256, url: `/cdn/${storedName}`, uploadedBy: 'admin' });
      return res.status(201).json(response(document, false));
    } catch (error) {
      await removeIfExists(temporaryPath).catch(() => {});
      if (error?.code === 11000) {
        const existing = await File.findOne({ sha256 });
        if (existing) return res.json(response(existing, true));
      }
      if (createdPhysicalObject && !(await File.findOne({ sha256 }))) await removeIfExists(finalizedPath).catch(() => {});
      return next(error);
    }
  });
  return router;
}
