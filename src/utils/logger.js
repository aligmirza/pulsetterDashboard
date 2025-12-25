import pino from 'pino';
import pinoHttp from 'pino-http';
import config from '../config/index.js';

const baseLogger = pino({
  level: config.env === 'production' ? 'info' : 'debug',
  transport: config.env === 'production' ? undefined : { target: 'pino-pretty' },
});

export const httpLogger = pinoHttp({ logger: baseLogger });
export default baseLogger;
