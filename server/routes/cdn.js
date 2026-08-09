import express from 'express';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { isObjectName, objectPath, requiresAttachment } from '../utils/storage.js';

export function createCdnRouter({ config, File }) {
  const router = express.Router();
  router.route('/:identifier').get(sendFile).head(sendFile);
  async function sendFile(req, res, next) {
    try {
      const identifier = req.params.identifier;
      if (!isObjectName(identifier)) return res.status(404).json({ error: 'File not found' });
      const file = await File.findOne({ storedName: identifier });
      if (!file) return res.status(404).json({ error: 'File not found' });
      const filePath = objectPath(config, identifier);
      const stat = await fs.stat(filePath);
      const etag = `"${file.sha256}"`;
      res.set({ 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Type': file.mime, 'Content-Length': String(stat.size), 'Last-Modified': stat.mtime.toUTCString(), ETag: etag });
      if (requiresAttachment(file.mime)) res.set('Content-Disposition', `attachment; filename="${identifier}"`);
      if (req.fresh) return res.status(304).end();
      if (req.method === 'HEAD') return res.status(200).end();
      return createReadStream(filePath).on('error', next).pipe(res);
    } catch (error) { if (error.code === 'ENOENT') return res.status(404).json({ error: 'File not found' }); return next(error); }
  }
  return router;
}
