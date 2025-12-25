import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import './Pages.css';

export default function IntegrationsPage() {
  const { token } = useAuth();
  const [provider, setProvider] = useState('smartlead');
  const [apiKey, setApiKey] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [ownerType, setOwnerType] = useState('client');
  const [ownerId, setOwnerId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Login required.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await api.upsertProviderCredential(token, {
        provider,
        api_key: apiKey,
        access_token: accessToken,
        owner_type: ownerType,
        owner_id: ownerId || null,
      });
      setMessage('Saved provider credentials.');
    } catch (err) {
      setError(err.message || 'Failed to save credentials');
    }
  };

  const loadSummary = async () => {
    if (!token) return;
    try {
      const res = await api.providerCredentialSummary(token);
      setSummary(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load credential summary');
    }
  };

  useEffect(() => {
    loadSummary();
  }, [token]);

  return (
    <div className="page">
      <Topbar title="Settings / Integrations" subtitle="Store provider API keys per client or org" health={{ ok: true }} />
      <div className="card">
        <h2>Provider Credentials</h2>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Provider
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="smartlead">SmartLead</option>
              <option value="instantly">Instantly</option>
            </select>
          </label>
          <label>
            Owner Type
            <select value={ownerType} onChange={(e) => setOwnerType(e.target.value)}>
              <option value="client">Client</option>
              <option value="user">User</option>
            </select>
          </label>
          <label>
            Owner ID (optional)
            <input value={ownerId} onChange={(e) => setOwnerId(e.target.value)} placeholder="client_id or user_id" />
          </label>
          <label>
            API Key
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </label>
          <label>
            Access Token (Instantly)
            <input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
          </label>
          <button type="submit" disabled={!token}>
            Save
          </button>
        </form>
        {message && <p>{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
      {summary && (
        <div className="card">
          <h2>Credential Usage</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Provider</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {summary.org.map((row) => (
                  <tr key={`org-${row.provider}`}>
                    <td>Pulsetter (org)</td>
                    <td>{row.provider}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
                {summary.owners.map((row) => (
                  <tr key={`${row.provider}-${row.owner_type}`}>
                    <td>{row.owner_type}</td>
                    <td>{row.provider}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
