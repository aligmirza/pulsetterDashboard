const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api/v1';

const withAuth = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const api = {
  base: API_BASE,
  async handle(res, fallback) {
    if (res.ok) return res;
    const text = await res.text();
    throw new Error(text || fallback || 'Request failed');
  },
  async health() {
    const res = await fetch(`${API_BASE}/health`);
    return this.handle(res, 'Health check failed').then((r) => r.json());
  },
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handle(res, 'Login failed').then((r) => r.json());
  },
  async campaigns(token) {
    const res = await fetch(`${API_BASE}/campaigns`, {
      headers: { ...withAuth(token) },
    });
    return this.handle(res, 'Failed to load campaigns').then((r) => r.json());
  },
  async overview(token) {
    const res = await fetch(`${API_BASE}/overview/summary`, {
      headers: { ...withAuth(token) },
    });
    return this.handle(res, 'Failed to load overview').then((r) => r.json());
  },
  async leadsLookup(token, filters) {
    const params = new URLSearchParams(filters || {});
    const res = await fetch(`${API_BASE}/lead-lookup?${params.toString()}`, {
      headers: { ...withAuth(token) },
    });
    return this.handle(res, 'Failed to search leads').then((r) => r.json());
  },
  async users(token) {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { ...withAuth(token) },
    });
    return this.handle(res, 'Failed to load users').then((r) => r.json());
  },
  async createUser(token, payload) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...withAuth(token) },
      body: JSON.stringify(payload),
    });
    return this.handle(res, 'Failed to create user').then((r) => r.json());
  },
  async updateUser(token, userId, payload) {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...withAuth(token) },
      body: JSON.stringify(payload),
    });
    return this.handle(res, 'Failed to update user').then((r) => r.json());
  },
  async deleteUser(token, userId) {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: { ...withAuth(token) },
    });
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      throw new Error(text || 'Failed to delete user');
    }
    return true;
  },
  async clients(token) {
    const res = await fetch(`${API_BASE}/clients`, {
      headers: { ...withAuth(token) },
    });
    return this.handle(res, 'Failed to load clients').then((r) => r.json());
  },
  async createClient(token, payload) {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...withAuth(token) },
      body: JSON.stringify(payload),
    });
    return this.handle(res, 'Failed to create client').then((r) => r.json());
  },
  async updateClient(token, clientId, payload) {
    const res = await fetch(`${API_BASE}/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...withAuth(token) },
      body: JSON.stringify(payload),
    });
    return this.handle(res, 'Failed to update client').then((r) => r.json());
  },
  async deleteClient(token, clientId) {
    const res = await fetch(`${API_BASE}/clients/${clientId}`, {
      method: 'DELETE',
      headers: { ...withAuth(token) },
    });
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      throw new Error(text || 'Failed to delete client');
    }
    return true;
  },
  async clientCampaigns(token, clientId) {
    const res = await fetch(`${API_BASE}/clients/${clientId}/campaigns`, {
      headers: { ...withAuth(token) },
    });
    return this.handle(res, 'Failed to load client campaigns').then((r) => r.json());
  },
  async providerCredentialSummary(token) {
    const res = await fetch(`${API_BASE}/provider-credentials/summary/all`, {
      headers: { ...withAuth(token) },
    });
    if (!res.ok) throw new Error('Failed to load provider credential summary');
    return res.json();
  },
  async upsertProviderCredential(token, payload) {
    const res = await fetch(`${API_BASE}/provider-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...withAuth(token) },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save credentials');
    return res.json();
  },
};

export default api;
