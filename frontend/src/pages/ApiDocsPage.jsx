import { useState } from 'react';
import Topbar from '../components/Topbar';
import './Pages.css';
import { useAuth } from '../context/AuthContext';

const sections = [
  {
    title: 'Auth',
    rows: [
      { method: 'POST', path: '/auth/login', desc: 'Login with email/password to get JWT' },
      { method: 'GET', path: '/health', desc: 'API health check' },
    ],
  },
  {
    title: 'Clients',
    rows: [
      { method: 'GET', path: '/clients', desc: 'List clients (admin/internal)' },
      { method: 'POST', path: '/clients', desc: 'Create client (keywords/creds/login password optional)' },
      { method: 'PATCH', path: '/clients/:id', desc: 'Update client' },
      { method: 'DELETE', path: '/clients/:id', desc: 'Delete client (fails if linked data)' },
      { method: 'GET', path: '/clients/:id/campaigns', desc: 'Campaigns matched by keywords/client_id' },
    ],
  },
  {
    title: 'Campaigns',
    rows: [
      { method: 'GET', path: '/campaigns', desc: 'List campaigns (filters: status, provider)' },
      { method: 'GET', path: '/campaigns/:id', desc: 'Campaign detail' },
      { method: 'POST', path: '/campaigns/sync', desc: 'Sync SmartLead/Instantly (admin/internal)' },
    ],
  },
  {
    title: 'Leads',
    rows: [
      { method: 'GET', path: '/leads', desc: 'List leads (scoped by role)' },
      { method: 'GET', path: '/leads/:id', desc: 'Lead detail (scoped)' },
      { method: 'GET', path: '/lead-lookup', desc: 'Search by name/domain/company/linkedin (admin/internal)' },
      { method: 'POST', path: '/leads', desc: 'Insert lead into DB (admin/internal)' },
    ],
  },
  {
    title: 'Analytics',
    rows: [
      { method: 'GET', path: '/analytics/summary', desc: 'Snapshots (scoped)' },
      { method: 'GET', path: '/analytics/daily', desc: 'Daily view (scoped)' },
    ],
  },
  {
    title: 'Users',
    rows: [
      { method: 'GET', path: '/users', desc: 'List users (admin)' },
      { method: 'POST', path: '/users', desc: 'Create user (admin)' },
      { method: 'PATCH', path: '/users/:id', desc: 'Update user (admin)' },
      { method: 'DELETE', path: '/users/:id', desc: 'Delete user (admin)' },
    ],
  },
  {
    title: 'Provider Credentials',
    rows: [
      { method: 'POST', path: '/provider-credentials', desc: 'Store per-client/user creds (SmartLead/Instantly)' },
      { method: 'GET', path: '/provider-credentials/:provider', desc: 'Fetch active cred (admin/internal)' },
      { method: 'GET', path: '/provider-credentials/summary/all', desc: 'Summary of org/owner creds' },
      { method: 'POST', path: '/org-credentials', desc: 'Store org-level creds' },
      { method: 'GET', path: '/org-credentials/:provider', desc: 'Fetch org cred (admin)' },
    ],
  },
  {
    title: 'Overview',
    rows: [{ method: 'GET', path: '/overview/summary', desc: 'Counts of clients/campaigns/leads/users' }],
  },
];

const curlExamples = [
  {
    title: 'Login',
    cmd: `curl -X POST http://localhost:4000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@pulsetter.local","password":"changeme123"}'`,
  },
  {
    title: 'List clients',
    cmd: `curl http://localhost:4000/api/v1/clients \\
  -H "Authorization: Bearer $TOKEN"`,
  },
  {
    title: 'Create client with keyword and login',
    cmd: `curl -X POST http://localhost:4000/api/v1/clients \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Contoro","contact_email":"contoro@example.com","campaign_keyword":"contoro","login_password":"pass123"}'`,
  },
  {
    title: 'List campaigns with filters',
    cmd: `curl "http://localhost:4000/api/v1/campaigns?status=active&provider=smartlead" \\
  -H "Authorization: Bearer $TOKEN"`,
  },
  {
    title: 'Insert lead',
    cmd: `curl -X POST http://localhost:4000/api/v1/leads \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"first_name":"Jane","last_name":"Doe","email":"jane@example.com","company_name":"Example"}'`,
  },
  {
    title: 'Sync campaigns',
    cmd: `curl -X POST http://localhost:4000/api/v1/campaigns/sync \\
  -H "Authorization: Bearer $TOKEN"`,
  },
];

export default function ApiDocsPage() {
  const { token } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <div className="page">
      <Topbar title="API Usage & Docs" subtitle="Key endpoints for the dashboard backend" health={null} />
      <div className="card">
        <h2>Your Token</h2>
        <p className="muted">Copy this token for cURL requests (from your current session).</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="code" style={{ flex: 1, minWidth: '260px', wordBreak: 'break-all' }}>
            {token || 'Not logged in'}
          </div>
          <button type="button" className="secondary" onClick={copyToken} disabled={!token}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      {sections.map((section) => (
        <div className="card" key={section.title}>
          <h2>{section.title}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((d) => (
                  <tr key={d.method + d.path}>
                    <td>{d.method}</td>
                    <td>{d.path}</td>
                    <td>{d.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="card">
        <h2>cURL Examples</h2>
        <p className="muted">Set TOKEN from login: <code>TOKEN=$(curl ... | jq -r .token)</code></p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Use case</th>
                <th>Command</th>
              </tr>
            </thead>
            <tbody>
              {curlExamples.map((ex) => (
                <tr key={ex.title}>
                  <td>{ex.title}</td>
                  <td>
                    <pre className="code" style={{ whiteSpace: 'pre-wrap' }}>
{ex.cmd}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
