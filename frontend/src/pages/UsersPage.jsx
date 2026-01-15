import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import './Pages.css';
import { useToast } from '../components/Toast';

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'client', client_id: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    if (!token) {
      setError('Login to view users.');
      return;
    }
    try {
      const res = await api.users(token);
      setUsers(res.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load users');
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setError('Email is required');
      return;
    }
    if (!editingId && !form.password) {
      setError('Password is required for new users');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (editingId && !form.password) {
        delete payload.password;
      }
      if (editingId) {
        await api.updateUser(token, editingId, payload);
      } else {
        await api.createUser(token, payload);
      }
      setForm({ email: '', name: '', password: '', role: 'client', client_id: '' });
      setEditingId(null);
      await load();
      showToast(editingId ? 'User updated' : 'User created', 'success');
    } catch (err) {
      setError(err.message || 'Failed to save user');
      showToast(err.message || 'Failed to save user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({ email: u.email, name: u.name || '', password: '', role: u.role, client_id: u.client_id || '' });
  };

  const onDelete = async (id, email) => {
    const confirmDelete = window.confirm(`Delete user "${email}"? This cannot be undone.`);
    if (!confirmDelete) return;
    if (!token) return;
    try {
      await api.deleteUser(token, id);
      await load();
      showToast('User deleted', 'success');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="page">
      <Topbar title="Users & Roles" subtitle="Manage users and assignments" health={{ ok: true }} />
      {error && <p className="error">{error}</p>}
      <div className="card">
        <h2>{editingId ? 'Update User' : 'Add User'}</h2>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </label>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="internal">Internal</option>
              <option value="client">Client</option>
            </select>
          </label>
          <label>
            Client ID (optional)
            <input
              value={form.client_id}
              onChange={(e) => setForm((p) => ({ ...p, client_id: e.target.value }))}
              placeholder="assign to client (for client role)"
            />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" disabled={saving || !token || (!editingId && !form.password) || !form.email}>
              {saving ? 'Saving…' : editingId ? 'Update User' : 'Create User'}
            </button>
            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm({ email: '', name: '', password: '', role: 'client', client_id: '' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="card">
        <h2>Users</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Client</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name || '—'}</td>
                  <td>{u.role}</td>
                  <td>{u.client_id || '—'}</td>
                  <td>
                    <button type="button" onClick={() => startEdit(u)} disabled={!token}>
                      Edit
                    </button>
                    <button type="button" className="secondary" onClick={() => onDelete(u.id, u.email)} disabled={!token}>
                      Delete
                    </button>
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
