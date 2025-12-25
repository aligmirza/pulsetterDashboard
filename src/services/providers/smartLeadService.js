import config from '../../config/index.js';
import logger from '../../utils/logger.js';

const SMARTLEAD_BASE = 'https://server.smartlead.ai/api/v1';

const SmartLeadService = {
  async fetch(path, options = {}) {
    const { apiKey = config.smartleadApiKey, ...rest } = options;
    const apiKeyToUse = apiKey || config.smartleadApiKey;
    if (!apiKeyToUse) {
      throw new Error('SmartLead API key missing');
    }
    const url = new URL(`${SMARTLEAD_BASE}${path}`);
    url.searchParams.set('api_key', apiKeyToUse);
    const response = await fetch(url, rest);
    if (!response.ok) {
      const message = await response.text();
      logger.error({ status: response.status, message }, 'SmartLead API error');
      throw new Error(`SmartLead API error: ${response.status}`);
    }
    return response.json();
  },

  async listCampaigns({ apiKey } = {}) {
    return this.fetch('/campaigns', { apiKey });
  },

  async campaignAnalytics(campaignId, { apiKey } = {}) {
    return this.fetch(`/campaigns/${campaignId}/analytics`, { apiKey });
  },
};

export default SmartLeadService;
