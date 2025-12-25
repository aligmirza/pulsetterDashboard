import { query } from '../../db/pool.js';
import { hashPassword, comparePassword } from '../../utils/password.js';

const UserService = {
  async list() {
    const { rows } = await query(
      'SELECT id, email, name, role, client_id, created_at, updated_at FROM users ORDER BY created_at DESC',
    );
    return rows;
  },

  async create(payload) {
    const { email, name, password, role = 'client', client_id: clientId } = payload;
    const passwordHash = await hashPassword(password);
    const sql =
      'INSERT INTO users (email, name, password_hash, role, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, client_id';
    const { rows } = await query(sql, [email, name || null, passwordHash, role, clientId || null]);
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await query(
      'SELECT id, email, name, password_hash, role, client_id, created_at FROM users WHERE email = $1 LIMIT 1',
      [email],
    );
    return rows[0];
  },

  async verifyCredentials(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const match = await comparePassword(password, user.password_hash);
    if (!match) return null;
    const { password_hash: _, ...safe } = user;
    return safe;
  },

  async update(id, payload) {
    const fields = [];
    const params = [];
    if (payload.email) {
      params.push(payload.email);
      fields.push(`email = $${params.length}`);
    }
    if (payload.name !== undefined) {
      params.push(payload.name);
      fields.push(`name = $${params.length}`);
    }
    if (payload.role) {
      params.push(payload.role);
      fields.push(`role = $${params.length}`);
    }
    if (payload.client_id !== undefined) {
      params.push(payload.client_id || null);
      fields.push(`client_id = $${params.length}`);
    }
    if (payload.password) {
      const passwordHash = await hashPassword(payload.password);
      params.push(passwordHash);
      fields.push(`password_hash = $${params.length}`);
    }
    if (!fields.length) return this.findById(id);
    params.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = now() WHERE id = $${
      params.length
    } RETURNING id, email, role, client_id`;
    const { rows } = await query(sql, params);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await query('SELECT id, email, name, role, client_id, created_at FROM users WHERE id = $1', [
      id,
    ]);
    return rows[0];
  },

  async remove(id) {
    const { rowCount } = await query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

export default UserService;
