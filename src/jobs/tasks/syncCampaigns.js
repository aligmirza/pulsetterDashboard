import CampaignService from '../../services/clients/campaignService.js';
import AnalyticsService from '../../services/clients/analyticsService.js';
import logger from '../../utils/logger.js';

export const runCampaignSync = async () => {
  logger.info('Running campaign sync for all providers');
  await CampaignService.sync();
};

export const runAnalyticsSync = async () => {
  logger.info('Running analytics sync for all providers');
  await AnalyticsService.sync();
};
