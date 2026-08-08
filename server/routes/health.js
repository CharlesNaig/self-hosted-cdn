import express from 'express';
import { storageReady } from '../utils/storage.js';

export function createHealthRouter({ config, mongoose }) {
  const router = express.Router();
  router.get('/live', (req, res) => res.json({ status: 'ok' }));
  router.get('/ready', async (req, res) => {
    const mongoReady = mongoose.connection.readyState === 1;
    const diskReady = await storageReady(config);
    return res.status(mongoReady && diskReady ? 200 : 503).json({ status: mongoReady && diskReady ? 'ready' : 'not_ready' });
  });
  return router;
}
