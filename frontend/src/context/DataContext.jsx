import { createContext, useContext, useMemo, useState } from 'react';
import api from '../lib/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState('');

  const [campaignsByClient, setCampaignsByClient] = useState({});
  const [campaignsLoading, setCampaignsLoading] = useState({});
  const [campaignsError, setCampaignsError] = useState({});

  const fetchClients = async (token, { force = false } = {}) => {
    if (!token) return;
    if (clients.length && !force) return;
    setClientsLoading(true);
    setClientsError('');
    try {
      const res = await api.clients(token);
      setClients(res.data || []);
    } catch (err) {
      setClientsError(err.message || 'Failed to load clients');
    } finally {
      setClientsLoading(false);
    }
  };

  const refreshClients = async (token) => fetchClients(token, { force: true });

  const fetchClientCampaigns = async (token, clientId, { force = false } = {}) => {
    if (!token || !clientId) return;
    if (campaignsByClient[clientId] && !force) return;
    setCampaignsLoading((prev) => ({ ...prev, [clientId]: true }));
    setCampaignsError((prev) => ({ ...prev, [clientId]: '' }));
    try {
      const res = await api.clientCampaigns(token, clientId);
      setCampaignsByClient((prev) => ({ ...prev, [clientId]: res.data || [] }));
    } catch (err) {
      setCampaignsError((prev) => ({ ...prev, [clientId]: err.message || 'Failed to load campaigns' }));
    } finally {
      setCampaignsLoading((prev) => ({ ...prev, [clientId]: false }));
    }
  };

  const value = useMemo(
    () => ({
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
    }),
    [clients, clientsLoading, clientsError, campaignsByClient, campaignsLoading, campaignsError],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
