import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`API listening on port ${config.port} (${config.env})`);
});

const shutdown = (signal) => {
  logger.warn(`${signal} received. Closing server...`);
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});
