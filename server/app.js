import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import File from './models/File.js';
import { createLogger, requestLogger } from './middleware/logging.js';
import { errorHandler } from './middleware/errors.js';
import { createUploadRouter } from './routes/upload.js';
import { createFilesRouter } from './routes/files.js';
import { createCdnRouter } from './routes/cdn.js';
import { createHealthRouter } from './routes/health.js';

export function createApp({ config, mongoose, fileModel = File, logger = createLogger(config.logLevel) }) {
  const app = express();
  app.set('trust proxy', config.trustProxy);
  app.use(requestLogger(logger));
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: false }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use('/health', createHealthRouter({ config, mongoose }));
  app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', createUploadRouter({ config, File: fileModel }));
  app.use('/api', createFilesRouter({ config, File: fileModel }));
  app.use('/cdn', createCdnRouter({ config, File: fileModel }));
  app.use(errorHandler(logger));
  return app;
}
