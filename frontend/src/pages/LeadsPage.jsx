import { useState } from 'react';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import './Pages.css';

export default function LeadsPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({ email: '', first_name: '', last_name: '', domain: '', company: '' });
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onSearch = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Login to search leads.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await api.leadsLookup(token, payload);
      setResults(res.data || []);
      if (!res.data?.length) setError('No leads found.');
    } catch (err) {
      setError(err.message || 'Failed to search leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Topbar title="Leads Lookup" subtitle="Search leads in your database" health={{ ok: true }} />
      <div className="card">
        <h2>Search</h2>
        <form className="form" onSubmit={onSearch}>
          <label>
            Email
            <input value={filters.email} onChange={(e) => onChange('email', e.target.value)} />
          </label>
          <label>
            First name
            <input value={filters.first_name} onChange={(e) => onChange('first_name', e.target.value)} />
          </label>
          <label>
            Last name
            <input value={filters.last_name} onChange={(e) => onChange('last_name', e.target.value)} />
          </label>
          <label>
            Domain
            <input value={filters.domain} onChange={(e) => onChange('domain', e.target.value)} />
          </label>
          <label>
            Company
            <input value={filters.company} onChange={(e) => onChange('company', e.target.value)} />
          </label>
          <button type="submit" disabled={loading || !token}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="card">
          <h2>Results ({results.length})</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Domain</th>
                  <th>Job Title</th>
                  <th>LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {results.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      {lead.first_name} {lead.last_name}
                    </td>
                    <td>{lead.email}</td>
                    <td>{lead.company_name}</td>
                    <td>{lead.domain}</td>
                    <td>{lead.job_title}</td>
                    <td>{lead.linkedin_url ? <a href={lead.linkedin_url}>Profile</a> : '—'}</td>
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
