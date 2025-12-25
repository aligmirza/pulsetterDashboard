import ProviderCredentialService from '../services/providers/providerCredentialService.js';

const OrgCredentialController = {
  upsert: async (req, res, next) => {
    try {
      const { provider, api_key: apiKey, access_token: accessToken, metadata, label, is_active: isActive, priority } = req.body;
      if (!provider) return res.status(400).json({ message: 'Provider is required' });
      const saved = await ProviderCredentialService.upsertOrgCredential({
        provider,
        apiKey,
        accessToken,
        metadata,
        label,
        isActive,
        priority,
      });
      return res.json({ data: saved });
    } catch (err) {
      return next(err);
    }
  },

  get: async (req, res, next) => {
    try {
      const { provider } = req.params;
      const { label } = req.query;
      const creds = await ProviderCredentialService.getOrgCredential({ provider, label });
      if (!creds) return res.status(404).json({ message: 'Credentials not found' });
      return res.json({ data: creds });
    } catch (err) {
      return next(err);
    }
  },
};

export default OrgCredentialController;
