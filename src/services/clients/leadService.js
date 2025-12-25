import ClayService from '../providers/clayService.js';
import { query } from '../../db/pool.js';

const LeadService = {
  async list(filters = {}, user) {
    const params = [];
    const conditions = [];

    if (filters.domain) {
      params.push(`%${filters.domain}%`);
      conditions.push(`domain ILIKE $${params.length}`);
    }
    if (filters.company) {
      params.push(`%${filters.company}%`);
      conditions.push(`company_name ILIKE $${params.length}`);
    }
    if (user?.role === 'client') {
      params.push(user.client_id);
      conditions.push(`client_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql =
      `SELECT id, first_name, last_name, email, domain, company_name, job_title, linkedin_url, client_id, updated_at ` +
      `FROM leads ${where} ORDER BY updated_at DESC LIMIT 100`;
    const { rows } = await query(sql, params);
    return rows;
  },

  async getById(id, user) {
    const params = [id];
    let where = 'WHERE id = $1';
    if (user?.role === 'client') {
      params.push(user.client_id);
      where += ` AND client_id = $${params.length}`;
    }
    const { rows } = await query(
      `SELECT id, first_name, last_name, email, domain, company_name, job_title, linkedin_url, client_id FROM leads ${where} LIMIT 1`,
      params,
    );
    return rows[0];
  },

  async search(filters = {}) {
    const params = [];
    const conditions = [];
    const add = (value, column) => {
      params.push(`%${value}%`);
      conditions.push(`${column} ILIKE $${params.length}`);
    };

    if (filters.first_name) add(filters.first_name, 'first_name');
    if (filters.last_name) add(filters.last_name, 'last_name');
    if (filters.domain) add(filters.domain, 'domain');
    if (filters.company) add(filters.company, 'company_name');
    if (filters.linkedin_url) add(filters.linkedin_url, 'linkedin_url');

    if (!conditions.length) return [];

    const where = `WHERE ${conditions.join(' AND ')}`;
    const sql =
      `SELECT id, first_name, last_name, email, domain, company_name, job_title, linkedin_url, client_id ` +
      `FROM leads ${where} ORDER BY updated_at DESC LIMIT 50`;
    const { rows } = await query(sql, params);
    return rows;
  },

  async enrichAndStore(lead) {
    const enriched = await ClayService.enrichLead(lead);
    const insertSql =
      'INSERT INTO leads (first_name, last_name, email, domain, company_name, job_title, location, linkedin_url, enrichment_data) ' +
      'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *';
    const params = [
      enriched.first_name,
      enriched.last_name,
      enriched.email,
      enriched.domain,
      enriched.company_name,
      enriched.job_title,
      enriched.location,
      enriched.linkedin_url,
      enriched.enrichment_data || {},
    ];
    const { rows } = await query(insertSql, params);
    return rows[0];
  },

  async create(payload, user) {
    // Optional enrichment; for now just insert provided fields and client scope
    const insertSql =
      'INSERT INTO leads (first_name, last_name, email, domain, company_name, job_title, location, linkedin_url, client_id) ' +
      'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, first_name, last_name, email, domain, company_name, job_title, location, linkedin_url, client_id, created_at';
    const params = [
      payload.first_name || null,
      payload.last_name || null,
      payload.email || null,
      payload.domain || null,
      payload.company_name || null,
      payload.job_title || null,
      payload.location || null,
      payload.linkedin_url || null,
      user?.role === 'client' ? user.client_id : payload.client_id || null,
    ];
    const { rows } = await query(insertSql, params);
    return rows[0];
  },
};

export default LeadService;
