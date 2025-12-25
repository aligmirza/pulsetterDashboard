import { useEffect, useMemo, useState } from 'react';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import './Pages.css';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused/Stopped' },
  { key: 'completed', label: 'Completed' },
];

const statusClass = (status) => {
  if (status === 'active') return 'status active';
  if (status === 'paused' || status === 'stopped') return 'status paused';
  if (status === 'completed') return 'status completed';
  return 'status unknown';
};

export default function CampaignsPage() {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCampaigns = async () => {
    if (!token) {
      setCampaigns([]);
      setError('Login to load campaigns.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const json = await api.campaigns(token);
      const data = json?.data || [];
      setCampaigns(
        data.map((c) => ({
          id: c.id || c.external_id,
          name: c.name,
          status: (c.status || 'unknown').toLowerCase(),
          provider: c.provider,
          sent: c.sent || 0,
          opens: c.opens || 0,
          replies: c.replies || 0,
          bounces: c.bounces || 0,
          unsubscribes: c.unsubscribes || 0,
        })),
      );
    } catch (err) {
      setError(err.message || 'Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [token]);

  const filteredCampaigns = useMemo(() => {
    if (statusFilter === 'all') return campaigns;
    if (statusFilter === 'paused') return campaigns.filter((c) => c.status === 'paused' || c.status === 'stopped');
    return campaigns.filter((c) => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  return (
    <div className="page">
      <Topbar title="Campaigns" subtitle="Status-filtered view with metrics" health={{ ok: true }} />
      <div className="card">
        <div className="card-header">
          <h2>Campaigns</h2>
          <button onClick={loadCampaigns} disabled={!token} style={{ opacity: token ? 1 : 0.5 }}>
            Refresh
          </button>
        </div>
        <p className="muted">Color-coded statuses with metrics. Authenticate to see live data.</p>

        <div className="tabs" style={{ marginBottom: '0.75rem' }}>
          {STATUS_TABS.map((tab) => (
            <div
              key={tab.key}
              className={`tab ${statusFilter === tab.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setStatusFilter(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading campaigns…</p>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Provider</th>
                <th>Sent</th>
                <th>Opens</th>
                <th>Replies</th>
                <th>Bounces</th>
                <th>Unsubs</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    <span className={statusClass(c.status)}>{c.status}</span>
                  </td>
                  <td>{c.provider || '—'}</td>
                  <td>{c.sent}</td>
                  <td>{c.opens}</td>
                  <td>{c.replies}</td>
                  <td>{c.bounces}</td>
                  <td>{c.unsubscribes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
