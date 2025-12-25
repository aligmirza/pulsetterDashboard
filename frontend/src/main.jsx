import { StrictMode, lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import OverviewPage from './pages/OverviewPage';
import LoginPage from './pages/LoginPage';

const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const ApiDocsPage = lazy(() => import('./pages/ApiDocsPage'));

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function ProdRefreshSuppressor() {
  useEffect(() => {
    if (import.meta.env.PROD) {
      // Suppress react-refresh hooks in prod
      // eslint-disable-next-line no-underscore-dangle
      window.$RefreshReg$ = () => {};
      // eslint-disable-next-line no-underscore-dangle
      window.$RefreshSig$ = () => () => {};
    }
  }, []);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <ProdRefreshSuppressor />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<OverviewPage />} />
                <Route
                  path="campaigns"
                  element={
                    <Suspense fallback={<div className="muted">Loading…</div>}>
                      <CampaignsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="clients"
                  element={
                    <Suspense fallback={<div className="muted">Loading…</div>}>
                      <ClientsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="leads"
                  element={
                    <Suspense fallback={<div className="muted">Loading…</div>}>
                      <LeadsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="api-usage"
                  element={
                    <Suspense fallback={<div className="muted">Loading…</div>}>
                      <ApiDocsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="users"
                  element={
                    <Suspense fallback={<div className="muted">Loading…</div>}>
                      <UsersPage />
                    </Suspense>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Suspense fallback={<div className="muted">Loading…</div>}>
                      <IntegrationsPage />
                    </Suspense>
                  }
                />
              </Route>
            </Routes>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
