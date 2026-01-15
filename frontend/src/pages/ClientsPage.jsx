import { useEffect, useRef, useState } from 'react';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import './Pages.css';

export default function ClientsPage() {
  const { token } = useAuth();
  const {
    clients,
    clientsLoading,
    clientsError,
    fetchClients,
    refreshClients,
    setClients,
    campaignsByClient,
    campaignsLoading,
    campaignsError,
    fetchClientCampaigns,
  } = useData();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    contact_email: '',
    campaign_keyword: '',
    smartlead_api_key: '',
    instantly_api_token: '',
    login_password: '',
  });
  const [saving, setSaving] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const debounceRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchClients(token);
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError('Name is required');
      return;
    }
    if (!form.contact_email) {
      setError('Contact Email is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let clientId = editingId;
      if (editingId) {
        await api.updateClient(token, editingId, form);
      } else {
        const res = await api.createClient(token, form);
        clientId = res?.data?.id;
      }
      // Save provider credentials for this client if provided
      if (clientId) {
        const credPromises = [];
        if (form.smartlead_api_key) {
          credPromises.push(
            api.upsertProviderCredential(token, {
              provider: 'smartlead',
              api_key: form.smartlead_api_key,
              owner_type: 'client',
              owner_id: clientId,
            }),
          );
        }
        if (form.instantly_api_token) {
          credPromises.push(
            api.upsertProviderCredential(token, {
              provider: 'instantly',
              access_token: form.instantly_api_token,
              owner_type: 'client',
              owner_id: clientId,
            }),
          );
        }
        if (credPromises.length) {
          await Promise.all(credPromises);
        }
      }
      if (clientId && form.login_password) {
        try {
          await api.createUser(token, {
            email: form.contact_email,
            password: form.login_password,
            name: form.name || form.contact_email,
            role: 'client',
            client_id: clientId,
          });
        } catch (err) {
          // surface but don't block client creation
          setError(err.message || 'Client created but failed to create login user');
        }
      }
      setForm({
        name: '',
        contact_email: '',
        campaign_keyword: '',
        smartlead_api_key: '',
        instantly_api_token: '',
        login_password: '',
      });
      setEditingId(null);
      await refreshClients(token);
      showToast(editingId ? 'Client updated' : 'Client created', 'success');
    } catch (err) {
      setError(err.message || 'Failed to save client (maybe duplicate?)');
      showToast(err.message || 'Failed to save client', 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (selectedClient && campaignsByClient[selectedClient]) {
      setCampaigns(campaignsByClient[selectedClient]);
    }
  }, [selectedClient, campaignsByClient]);

  const loadCampaigns = (clientId) => {
    setSelectedClient(clientId);
    setError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await fetchClientCampaigns(token, clientId, { force: true });
    }, 300);
  };

  const startEdit = (client) => {
    setEditingId(client.id);
    setForm({
      name: client.name || '',
      contact_email: client.contact_email || '',
      campaign_keyword: client.campaign_keyword || '',
      smartlead_api_key: '',
      instantly_api_token: '',
      login_email: client.contact_email || '',
      login_password: '',
    });
  };

  const onDelete = async (clientId, name) => {
    const confirmDelete = window.confirm(`Delete client "${name}"? This cannot be undone.`);
    if (!confirmDelete) return;
    setDeletingId(clientId);
    setError('');
    try {
      await api.deleteClient(token, clientId);
      if (selectedClient === clientId) {
        setSelectedClient(null);
        setCampaigns([]);
      }
      await refreshClients(token);
    } catch (err) {
      setError(err.message || 'Failed to delete client');
      showToast(err.message || 'Failed to delete client', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      <Topbar title="Clients" subtitle="Manage clients and contacts" health={{ ok: true }} />
      <div className="card">
        <h2>{editingId ? 'Update Client' : 'Add Client'}</h2>
        <form className="form form-grid" onSubmit={onSubmit}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label>
            Contact Email
            <input
              value={form.contact_email}
              onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
            />
          </label>
          <label>
            Campaign keyword(s)
            <input
              value={form.campaign_keyword}
              onChange={(e) => setForm((p) => ({ ...p, campaign_keyword: e.target.value }))}
              placeholder="comma-separated keyword(s) to match campaign names"
            />
          </label>
          <label>
            SmartLead API Key (optional)
            <input
              value={form.smartlead_api_key}
              onChange={(e) => setForm((p) => ({ ...p, smartlead_api_key: e.target.value }))}
              placeholder="Attach SmartLead key for this client"
            />
          </label>
          <label>
            Instantly API Token (optional)
            <input
              value={form.instantly_api_token}
              onChange={(e) => setForm((p) => ({ ...p, instantly_api_token: e.target.value }))}
              placeholder="Attach Instantly token for this client"
            />
          </label>
          <label>
            Portal Login Password
            <input
              type="password"
              value={form.login_password}
              onChange={(e) => setForm((p) => ({ ...p, login_password: e.target.value }))}
              placeholder="Set portal password (required)"
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving || !token}>
              {saving ? 'Saving…' : editingId ? 'Update Client' : 'Create Client'}
            </button>
            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    name: '',
                    contact_email: '',
                    campaign_keyword: '',
                    smartlead_api_key: '',
                    instantly_api_token: '',
                    login_email: '',
                    login_password: '',
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h2>Clients ({clients.length})</h2>
        {clientsLoading && <p className="muted">Loading clients…</p>}
        {clientsError && <p className="error">{clientsError}</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Email</th>
                <th>Campaign Keyword(s)</th>
                <th>Campaigns</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.contact_email || '—'}</td>
                  <td>{c.campaign_keyword || '—'}</td>
                  <td>
                    <div className="muted">Total: {c.campaign_counts?.total ?? 0}</div>
                    <div className="muted">Active: {c.campaign_counts?.active ?? 0}</div>
                    <div className="muted">Paused: {c.campaign_counts?.paused ?? 0}</div>
                    <div className="muted">Completed: {c.campaign_counts?.completed ?? 0}</div>
                  </td>
                  <td>{c.created_at ? new Date(c.created_at).toLocaleString() : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => loadCampaigns(c.id)} disabled={!token}>
                        View Campaigns
                      </button>
                      <button type="button" className="secondary" onClick={() => startEdit(c)} disabled={!token}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => onDelete(c.id, c.name)}
                        disabled={!token || deletingId === c.id}
                      >
                        {deletingId === c.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClient && (
        <div className="card">
          <h2>
            Campaigns matched for client{' '}
            {clients.find((c) => c.id === selectedClient)?.name || selectedClient}
          </h2>
          {campaignsLoading[selectedClient] && <p className="muted">Loading campaigns…</p>}
          {campaignsError[selectedClient] && <p className="error">{campaignsError[selectedClient]}</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Provider</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.status}</td>
                    <td>{c.provider}</td>
                  </tr>
                ))}
                {!campaigns.length && (
                  <tr>
                    <td colSpan={3}>No campaigns matched.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
