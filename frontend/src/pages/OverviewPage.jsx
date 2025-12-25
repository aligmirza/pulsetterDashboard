import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import Topbar from '../components/Topbar';
import './Pages.css';

const sampleTrend = [12, 18, 25, 23, 30, 28, 35];

export default function OverviewPage() {
  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState('');
  const [clients, setClients] = useState([]);
  const [clientsError, setClientsError] = useState('');
  const [expandedClient, setExpandedClient] = useState(null);
  const [campaignFilter, setCampaignFilter] = useState('all');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const token = localStorage.getItem('auth_token')?.replace(/\"/g, '');
        if (!token) {
          setMetricsError('Login to view stats.');
          return;
        }
        const res = await api.overview(token);
        setMetrics(res.data || null);
        setMetricsError('');
      } catch (err) {
        setMetricsError(err.message || 'Failed to load metrics.');
      }
    };
    loadMetrics();
  }, []);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const token = localStorage.getItem('auth_token')?.replace(/\"/g, '');
        if (!token) {
          setClientsError('Login to view clients.');
          return;
        }
        const res = await api.clients(token);
        setClients(res.data || []);
        setClientsError('');
      } catch (err) {
        setClientsError(err.message || 'Failed to load clients.');
      }
    };
    loadClients();
  }, []);

  const chartBars = useMemo(() => {
    const data = metrics
      ? [metrics.campaigns_active, metrics.campaigns_paused, metrics.campaigns_completed]
      : sampleTrend;
    const max = Math.max(...data, 1);
    const labels = metrics ? ['Active', 'Paused', 'Completed'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels.map((label, idx) => ({
      label,
      value: data[idx],
      height: `${(data[idx] / max) * 100}%`,
    }));
  }, [metrics]);

  return (
    <div className="page">
      <Topbar title="Overview" subtitle="Stats and client campaigns" health={null} />
      <div className="cards-grid">
        <div className="card">
          <h2>Stats</h2>
          {metricsError && <p className="error">{metricsError}</p>}
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-label">Clients</div>
              <div className="stat-value">{metrics?.clients ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Campaigns</div>
              <div className="stat-value">{metrics?.campaigns ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Users</div>
              <div className="stat-value">{metrics?.users ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Leads</div>
              <div className="stat-value">{metrics?.leads ?? '—'}</div>
            </div>
          </div>
          <div className="chart">
            {chartBars.map((b) => (
              <div key={b.label} className="bar-wrap">
                <div className="bar" style={{ height: b.height }} />
                <div className="bar-label">{b.label}</div>
                <div className="bar-value">{b.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Clients & Campaigns</h2>
        {clientsError && <p className="error">{clientsError}</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Keywords</th>
                <th>Campaigns</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.campaign_keyword || '—'}</td>
                  <td>
                    <div className="muted">Total: {c.campaign_counts?.total ?? 0}</div>
                    <div className="muted">Active: {c.campaign_counts?.active ?? 0}</div>
                    <div className="muted">Paused: {c.campaign_counts?.paused ?? 0}</div>
                    <div className="muted">Completed: {c.campaign_counts?.completed ?? 0}</div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setExpandedClient(expandedClient === c.id ? null : c.id)}
                      className="secondary"
                    >
                      {expandedClient === c.id ? 'Hide' : 'Show'} Campaigns
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expandedClient && (
          <div className="table-wrap" style={{ marginTop: '0.75rem' }}>
            <div className="tabs" style={{ marginBottom: '0.5rem' }}>
              {['all', 'active', 'paused', 'completed'].map((tab) => (
                <div
                  key={tab}
                  className={`tab ${campaignFilter === tab ? 'active' : ''}`}
                  onClick={() => setCampaignFilter(tab)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setCampaignFilter(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
            <table>
              <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Provider</th>
              </tr>
            </thead>
            <tbody>
              {(clients
                .find((c) => c.id === expandedClient)
                ?.campaigns.filter((c) =>
                  campaignFilter === 'all'
                    ? true
                    : campaignFilter === 'paused'
                    ? c.status === 'paused' || c.status === 'stopped'
                    : c.status === campaignFilter,
                ) || []
              ).map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    <span className={`status ${c.status || 'unknown'}`}>{c.status || 'unknown'}</span>
                  </td>
                  <td>
                    <span className={`pill provider ${c.provider || 'unknown'}`}>{c.provider || '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
