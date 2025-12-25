import './Topbar.css';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="user-badge">
          <div>
            <div className="user-email">{user?.name || user?.email || 'Guest'}</div>
            <div className="muted" style={{ fontSize: '0.85rem' }}>
              {user?.role || 'not logged in'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
