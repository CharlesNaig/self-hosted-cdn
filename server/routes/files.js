import express from 'express';
import rateLimit from 'express-rate-limit';
import { createApiKeyAuth } from '../middleware/apiKeyAuth.js';
import { objectPath, removeIfExists } from '../utils/storage.js';

export function createFilesRouter({ config, File }) {
  const router = express.Router();
  const auth = createApiKeyAuth(config);
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });
  router.get('/files', auth, async (req, res, next) => {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page || '1', 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit || '50', 10) || 50));
      const [files, total] = await Promise.all([File.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-__v'), File.countDocuments()]);
      res.json({ files, total, page, pages: Math.ceil(total / limit) });
    } catch (error) { next(error); }
  });
  router.delete('/files/:id', limiter, auth, async (req, res, next) => {
    try {
      const file = await File.findById(req.params.id);
      if (!file) return res.status(404).json({ error: 'File not found' });
      await removeIfExists(objectPath(config, file.storedName));
      await File.findByIdAndDelete(req.params.id);
      return res.json({ message: 'File deleted successfully' });
    } catch (error) { return next(error); }
  });
  return router;
}
