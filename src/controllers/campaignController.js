import CampaignService from '../services/clients/campaignService.js';

const CampaignController = {
  list: async (req, res, next) => {
    try {
      const { status, provider } = req.query;
      const campaigns = await CampaignService.list({ status, provider, user: req.user });
      return res.json({ data: campaigns });
    } catch (err) {
      return next(err);
    }
  },
  get: async (req, res, next) => {
    try {
      const campaign = await CampaignService.getById(req.params.id, req.user);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      return res.json({ data: campaign });
    } catch (err) {
      return next(err);
    }
  },
  sync: async (req, res, next) => {
    try {
      const { provider } = req.query;
      const result = await CampaignService.sync(provider);
      return res.json({ data: result });
    } catch (err) {
      return next(err);
    }
  },
};

export default CampaignController;
