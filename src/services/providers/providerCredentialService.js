import { query } from '../../db/pool.js';

const ProviderCredentialService = {
  async getCredential({ provider, ownerType = 'client', ownerId, label }) {
    const params = [provider];
    let sql = 'SELECT * FROM provider_credentials WHERE provider = $1 AND is_active = TRUE';
    if (ownerId) {
      params.push(ownerType);
      params.push(ownerId);
      sql += ` AND owner_type = $${params.length - 1} AND owner_id = $${params.length}`;
    } else if (ownerType) {
      params.push(ownerType);
      sql += ` AND owner_type = $${params.length}`;
    }
    if (label) {
      params.push(label);
      sql += ` AND label = $${params.length}`;
    }
    sql += ' ORDER BY priority DESC, updated_at DESC LIMIT 1';
    const { rows } = await query(sql, params);
    return rows[0];
  },

  async upsertCredential({
    provider,
    ownerType = 'client',
    ownerId,
    apiKey,
    accessToken,
    metadata,
    label = 'default',
    isActive = true,
    priority = 0,
  }) {
    const sql =
      'INSERT INTO provider_credentials (provider, owner_type, owner_id, label, api_key, access_token, metadata, is_active, priority) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ' +
      'ON CONFLICT (provider, owner_type, owner_id, label) DO UPDATE ' +
      'SET api_key = EXCLUDED.api_key, access_token = EXCLUDED.access_token, metadata = EXCLUDED.metadata, ' +
      'is_active = EXCLUDED.is_active, priority = EXCLUDED.priority, updated_at = now() ' +
      'RETURNING *';
    const { rows } = await query(sql, [
      provider,
      ownerType,
      ownerId,
      label,
      apiKey,
      accessToken,
      metadata || {},
      isActive,
      priority,
    ]);
    return rows[0];
  },

  async getOrgCredential({ provider, label }) {
    const params = [provider];
    let sql = 'SELECT * FROM org_provider_credentials WHERE provider = $1 AND is_active = TRUE';
    if (label) {
      params.push(label);
      sql += ` AND label = $${params.length}`;
    }
    sql += ' ORDER BY priority DESC, updated_at DESC LIMIT 1';
    const { rows } = await query(sql, params);
    return rows[0];
  },

  async upsertOrgCredential({ provider, apiKey, accessToken, metadata, label = 'default', isActive = true, priority = 0 }) {
    const sql =
      'INSERT INTO org_provider_credentials (provider, label, api_key, access_token, metadata, is_active, priority) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) ' +
      'ON CONFLICT (provider, label) DO UPDATE ' +
      'SET api_key = EXCLUDED.api_key, access_token = EXCLUDED.access_token, metadata = EXCLUDED.metadata, ' +
      'is_active = EXCLUDED.is_active, priority = EXCLUDED.priority, updated_at = now() ' +
      'RETURNING *';
    const { rows } = await query(sql, [provider, label, apiKey, accessToken, metadata || {}, isActive, priority]);
    return rows[0];
  },

  async summary() {
    const orgSql = `SELECT provider, count(*) AS count FROM org_provider_credentials WHERE is_active = TRUE GROUP BY provider`;
    const ownerSql =
      'SELECT provider, owner_type, count(*) AS count FROM provider_credentials WHERE is_active = TRUE GROUP BY provider, owner_type';
    const [{ rows: org }, { rows: owners }] = await Promise.all([query(orgSql), query(ownerSql)]);
    return { org, owners };
  },
};

export default ProviderCredentialService;
