import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { httpLogger } from './utils/logger.js';
import apiRateLimiter from './middleware/rateLimiter.js';
import v1Router from './routes/v1/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);
app.use('/api', apiRateLimiter);

app.use('/api/v1', v1Router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
