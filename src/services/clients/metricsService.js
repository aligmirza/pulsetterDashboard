import { query } from '../../db/pool.js';

const MetricsService = {
  async summary() {
    const [{ rows: clientCount }, { rows: userCount }] = await Promise.all([
      query('SELECT COUNT(*)::int AS clients FROM clients'),
      query('SELECT COUNT(*)::int AS users FROM users'),
    ]);

    const { rows: campaignRows } = await query(
      `SELECT 
        COUNT(*)::int AS campaigns,
        COUNT(*) FILTER (WHERE status ILIKE 'active')::int AS active_campaigns,
        COUNT(*) FILTER (WHERE status ILIKE 'paused' OR status ILIKE 'stopped')::int AS paused_campaigns,
        COUNT(*) FILTER (WHERE status ILIKE 'completed')::int AS completed_campaigns
       FROM campaigns`,
    );

    const { rows: leadRows } = await query('SELECT COUNT(*)::int AS leads FROM leads');

    return {
      clients: clientCount[0]?.clients || 0,
      users: userCount[0]?.users || 0,
      campaigns: campaignRows[0]?.campaigns || 0,
      campaigns_active: campaignRows[0]?.active_campaigns || 0,
      campaigns_paused: campaignRows[0]?.paused_campaigns || 0,
      campaigns_completed: campaignRows[0]?.completed_campaigns || 0,
      leads: leadRows[0]?.leads || 0,
    };
  },
};

export default MetricsService;
