import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/clients', label: 'Clients' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/leads', label: 'Leads-Lookup' },
  { to: '/api-usage', label: 'API Usage & Docs' },
  { to: '/users', label: 'Users-Roles' },
  { to: '/settings', label: 'Settings-Integrations' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Pulsetter Dashboard</div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        )}
      </aside>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
