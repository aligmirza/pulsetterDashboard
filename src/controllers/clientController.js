import ClientService from '../services/clients/clientService.js';

const ClientController = {
  list: async (req, res, next) => {
    try {
      const clients = await ClientService.list();
      return res.json({ data: clients });
    } catch (err) {
      return next(err);
    }
  },
  create: async (req, res, next) => {
    try {
      const client = await ClientService.create(req.body);
      return res.status(201).json({ data: client });
    } catch (err) {
      return next(err);
    }
  },
  update: async (req, res, next) => {
    try {
      const { clientId } = req.params;
      const client = await ClientService.update(clientId, req.body);
      if (!client) return res.status(404).json({ message: 'Client not found' });
      return res.json({ data: client });
    } catch (err) {
      return next(err);
    }
  },
  remove: async (req, res, next) => {
    try {
      const { clientId } = req.params;
      const deleted = await ClientService.remove(clientId);
      if (!deleted) return res.status(404).json({ message: 'Client not found' });
      return res.status(204).send();
    } catch (err) {
      if (err.status) return res.status(err.status).json({ message: err.message });
      return next(err);
    }
  },
  campaigns: async (req, res, next) => {
    try {
      const { clientId } = req.params;
      const data = await ClientService.campaignsByKeyword(clientId);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  },
  assignCampaigns: async (req, res, next) => {
    try {
      const { clientId } = req.params;
      const result = await ClientService.assignCampaigns(clientId);
      return res.json({ data: result });
    } catch (err) {
      return next(err);
    }
  },
};

export default ClientController;
