import pkg from 'pg';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.env === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PG client error');
});

export const query = (text, params) => pool.query(text, params);
export default pool;
