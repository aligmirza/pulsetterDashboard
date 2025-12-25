import SmartLeadService from '../providers/smartLeadService.js';
import InstantlyService from '../providers/instantlyService.js';
import { query } from '../../db/pool.js';

const AnalyticsService = {
  async summary(filters = {}, user) {
    const params = [];
    const conditions = [];
    if (filters.campaign_id) {
      params.push(filters.campaign_id);
      conditions.push(`campaign_id = $${params.length}`);
    }
    if (user?.role === 'client') {
      params.push(user.client_id);
      conditions.push(`client_id = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql =
      `SELECT campaign_id, snapshot_date, sent, opens, clicks, replies, bounces, unsubscribes ` +
      `FROM analytics_snapshots ${where} ORDER BY snapshot_date DESC LIMIT 90`;
    const { rows } = await query(sql, params);
    return rows;
  },

  async daily(filters = {}, user) {
    return this.summary(filters, user);
  },

  async sync(provider, filters = {}) {
    if (provider === 'smartlead') {
      if (!filters.campaign_id) return [];
      return SmartLeadService.campaignAnalytics(filters.campaign_id);
    }
    return InstantlyService.analytics(filters);
  },
};

export default AnalyticsService;
