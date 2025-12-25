import config from '../../config/index.js';
import logger from '../../utils/logger.js';

const INSTANTLY_BASE = 'https://api.instantly.ai/api/v2';

const InstantlyService = {
  async fetch(path, { query, method = 'GET', body, token } = {}) {
    const url = new URL(`${INSTANTLY_BASE}${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url.searchParams.set(key, value);
      });
    }
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token || config.instantlyApiToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const message = await response.text();
      logger.error({ status: response.status, message }, 'Instantly API error');
      throw new Error(`Instantly API error: ${response.status}`);
    }
    return response.json();
  },

  async listCampaigns({ limit = 50, starting_after, status, token } = {}) {
    return this.fetch('/campaigns', { query: { limit, starting_after, status }, token });
  },

  async analytics(params = {}) {
    return this.fetch('/campaigns/analytics', { query: params, token: params.token });
  },
};

export default InstantlyService;
