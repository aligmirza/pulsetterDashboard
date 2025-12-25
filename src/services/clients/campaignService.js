import SmartLeadService from '../providers/smartLeadService.js';
import InstantlyService from '../providers/instantlyService.js';
import ProviderCredentialService from '../providers/providerCredentialService.js';
import { query } from '../../db/pool.js';

const mapInstantlyStatus = (code) => {
  if (code === 1) return 'active';
  if (code === 2) return 'paused';
  if (code === 3) return 'completed';
  return 'unknown';
};

const upsertCampaign = async ({ provider, externalId, name, status, schedule, clientId }) => {
  const sql =
    'INSERT INTO campaigns (provider, external_id, name, status, schedule, client_id) ' +
    'VALUES ($1, $2, $3, $4, $5, $6) ' +
    'ON CONFLICT (provider, external_id) DO UPDATE ' +
    'SET name = EXCLUDED.name, status = EXCLUDED.status, schedule = EXCLUDED.schedule, ' +
    'client_id = COALESCE(EXCLUDED.client_id, campaigns.client_id), updated_at = now() ' +
    'RETURNING id, provider, external_id, name, status, client_id, created_at, updated_at';
  const params = [provider, externalId, name, status, schedule || null, clientId || null];
  const { rows } = await query(sql, params);
  return rows[0];
};

const CampaignService = {
  async list({ status, provider, user }) {
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (provider) {
      params.push(provider);
      conditions.push(`provider = $${params.length}`);
    }
    if (user?.role === 'client') {
      params.push(user.client_id);
      conditions.push(`client_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT id, provider, external_id, name, status, client_id, updated_at FROM campaigns ${where} ORDER BY updated_at DESC`;
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
      `SELECT id, provider, external_id, name, status, client_id, updated_at FROM campaigns ${where} LIMIT 1`,
      params,
    );
    return rows[0];
  },

  async sync(provider, options = {}) {
    const { ownerType, ownerId } = options;
    const smartleadCreds =
      provider !== 'instantly'
        ? (await ProviderCredentialService.getCredential({ provider: 'smartlead', ownerType, ownerId })) ||
          (await ProviderCredentialService.getOrgCredential({ provider: 'smartlead' }))
        : null;
    const instantlyCreds =
      provider !== 'smartlead'
        ? (await ProviderCredentialService.getCredential({ provider: 'instantly', ownerType, ownerId })) ||
          (await ProviderCredentialService.getOrgCredential({ provider: 'instantly' }))
        : null;

    if (provider === 'smartlead') {
      return this.syncSmartLead({ apiKey: smartleadCreds?.api_key });
    }
    if (provider === 'instantly') {
      return this.syncInstantly({ token: instantlyCreds?.access_token });
    }
    const smartLead = await this.syncSmartLead({ apiKey: smartleadCreds?.api_key });
    const instantly = await this.syncInstantly({ token: instantlyCreds?.access_token });
    return { provider: 'all', smartlead: smartLead, instantly };
  },

  async syncSmartLead({ apiKey }) {
    const data = await SmartLeadService.listCampaigns({ apiKey });
    const list = Array.isArray(data) ? data : data?.campaigns || data?.data || [];
    let inserted = 0;
    let updated = 0;
    for (const c of list || []) {
      const record = await upsertCampaign({
        provider: 'smartlead',
        externalId: c.id?.toString(),
        name: c.name,
        status: (c.status || '').toLowerCase(),
        schedule: c.schedule || null,
        clientId: c.client_id || null,
      });
      if (record?.created_at === record?.updated_at) inserted += 1;
      else if (record) updated += 1;
    }
    return { provider: 'smartlead', fetched: list.length, inserted, updated };
  },

  async syncInstantly({ token }) {
    let startingAfter;
    let fetched = 0;
    let inserted = 0;
    let updated = 0;
    // paginate up to reasonable limit
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const resp = await InstantlyService.listCampaigns({ token, starting_after: startingAfter, limit: 100 });
      const items = resp?.items || [];
      fetched += items.length;
      for (const c of items) {
        const status = mapInstantlyStatus(c.status);
        const record = await upsertCampaign({
          provider: 'instantly',
          externalId: c.id?.toString(),
          name: c.name,
          status,
          schedule: c.schedule || null,
          clientId: c.client_id || null,
        });
        if (record) {
          if (record.created_at === record.updated_at) inserted += 1;
          else updated += 1;
        }
      }
      if (!resp?.next_starting_after || items.length === 0) break;
      startingAfter = resp.next_starting_after;
    }
    return { provider: 'instantly', fetched, inserted, updated };
  },
};

export default CampaignService;
