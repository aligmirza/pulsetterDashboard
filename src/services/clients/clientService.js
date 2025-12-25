import { query } from '../../db/pool.js';
import logger from '../../utils/logger.js';

const ClientService = {
  async list() {
    const { rows: clients } = await query(
      'SELECT id, name, contact_email, campaign_keyword, created_at, updated_at FROM clients ORDER BY name ASC',
    );
    const { rows: campaigns } = await query(
      'SELECT id, name, status, provider, client_id, updated_at FROM campaigns ORDER BY updated_at DESC',
    );
    const enriched = clients.map((client) => {
      const keywords = (client.campaign_keyword || '')
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
      const matched = campaigns.filter((c) => {
        if (c.client_id && c.client_id === client.id) return true;
        if (!keywords.length) return false;
        const name = (c.name || '').toLowerCase();
        return keywords.some((k) => name.includes(k));
      });
      const counts = matched.reduce(
        (acc, c) => {
          acc.total += 1;
          if (c.status === 'active') acc.active += 1;
          else if (c.status === 'paused' || c.status === 'stopped') acc.paused += 1;
          else if (c.status === 'completed') acc.completed += 1;
          else acc.unknown += 1;
          return acc;
        },
        { total: 0, active: 0, paused: 0, completed: 0, unknown: 0 },
      );
      return { ...client, campaigns: matched, campaign_counts: counts };
    });
    return enriched;
  },

  async create(payload) {
    const { name, contact_email: contactEmail, campaign_keyword: campaignKeyword } = payload;
    const check = await query('SELECT id, name FROM clients WHERE LOWER(name) = LOWER($1) LIMIT 1', [name]);
    if (check.rows.length) {
      const err = new Error('Client already exists');
      err.status = 409;
      throw err;
    }
    const insertSql =
      'INSERT INTO clients (name, contact_email, campaign_keyword) VALUES ($1, $2, $3) RETURNING id, name, contact_email, campaign_keyword, created_at';
    const { rows } = await query(insertSql, [name, contactEmail, campaignKeyword || null]);
    return rows[0];
  },

  async update(clientId, payload) {
    const fields = [];
    const params = [];
    if (payload.name) {
      params.push(payload.name);
      fields.push(`name = $${params.length}`);
    }
    if (payload.contact_email !== undefined) {
      params.push(payload.contact_email);
      fields.push(`contact_email = $${params.length}`);
    }
    if (payload.campaign_keyword !== undefined) {
      params.push(payload.campaign_keyword);
      fields.push(`campaign_keyword = $${params.length}`);
    }
    if (!fields.length) return this.getById(clientId);
    params.push(clientId);
    const sql = `UPDATE clients SET ${fields.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING id, name, contact_email, campaign_keyword, created_at, updated_at`;
    const { rows } = await query(sql, params);
    return rows[0];
  },

  async remove(clientId) {
    try {
      const { rowCount } = await query('DELETE FROM clients WHERE id = $1', [clientId]);
      return rowCount > 0;
    } catch (err) {
      if (err.code === '23503') {
        const e = new Error('Cannot delete client with linked campaigns, leads, or users');
        e.status = 409;
        throw e;
      }
      throw err;
    }
  },

  async getById(clientId) {
    const { rows } = await query(
      'SELECT id, name, contact_email, campaign_keyword, created_at, updated_at FROM clients WHERE id = $1',
      [clientId],
    );
    return rows[0];
  },

  async campaignsByKeyword(clientId) {
    const client = await this.getById(clientId);
    if (!client?.campaign_keyword) return [];
    const keywords = client.campaign_keyword
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    if (!keywords.length) return [];
    const patterns = keywords.map((k, idx) => `%${k}%`);
    const placeholders = patterns.map((_, idx) => `$${idx + 1}`).join(', ');
    const sql = `SELECT id, provider, external_id, name, status, client_id FROM campaigns WHERE name ILIKE ANY (ARRAY[${placeholders}]) ORDER BY updated_at DESC`;
    const { rows } = await query(sql, patterns);
    return rows;
  },

  async assignCampaigns(clientId) {
    // Placeholder fuzzy matching logic; replace with trigram or ILIKE match on campaign names.
    logger.info({ clientId }, 'Assigning campaigns via fuzzy match');
    return { clientId, assigned: 0, skipped: 0 };
  },
};

export default ClientService;
