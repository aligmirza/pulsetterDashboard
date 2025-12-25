import logger from '../utils/logger.js';
import { runCampaignSync, runAnalyticsSync } from './tasks/syncCampaigns.js';

export const registerJobs = () => {
  // Wire up cron/queue of choice here (e.g., node-cron, bull, agenda).
  logger.info('Job scheduler initialized (placeholder)');
  return {
    runCampaignSync,
    runAnalyticsSync,
  };
};

export default registerJobs;
