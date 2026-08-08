import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { loadConfig } from './config.js';
import { createApp } from './app.js';
import { createLogger } from './middleware/logging.js';
import { ensureStorage } from './utils/storage.js';

dotenv.config();
const config = loadConfig();
const logger = createLogger(config.logLevel);
await ensureStorage(config);
await mongoose.connect(config.mongoUri);
const app = createApp({ config, mongoose, logger });
const server = app.listen(config.port, '0.0.0.0', () => logger.info('server_started', { port: config.port, environment: config.nodeEnv }));
let closing = false;
async function shutdown(signal) {
  if (closing) return;
  closing = true;
  logger.info('shutdown_started', { signal });
  server.close(async () => { await mongoose.disconnect(); logger.info('shutdown_complete'); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
