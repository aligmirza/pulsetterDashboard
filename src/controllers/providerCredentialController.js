import ProviderCredentialService from '../services/providers/providerCredentialService.js';

const ProviderCredentialController = {
  upsert: async (req, res, next) => {
    try {
      const {
        provider,
        owner_type: ownerType = 'client',
        owner_id: ownerId,
        api_key: apiKey,
        access_token: accessToken,
        metadata,
        label,
        is_active: isActive,
        priority,
      } = req.body;
      if (!provider) return res.status(400).json({ message: 'Provider is required' });
      const saved = await ProviderCredentialService.upsertCredential({
        provider,
        ownerType,
        ownerId,
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
      const { owner_type: ownerType = 'client', owner_id: ownerId } = req.query;
      const creds = await ProviderCredentialService.getCredential({ provider, ownerType, ownerId });
      if (!creds) return res.status(404).json({ message: 'Credentials not found' });
      return res.json({ data: creds });
    } catch (err) {
      return next(err);
    }
  },

  summary: async (req, res, next) => {
    try {
      const data = await ProviderCredentialService.summary();
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  },
};

export default ProviderCredentialController;
