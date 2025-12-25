import LeadService from '../services/clients/leadService.js';

const LeadController = {
  list: async (req, res, next) => {
    try {
      const leads = await LeadService.list(req.query, req.user);
      return res.json({ data: leads });
    } catch (err) {
      return next(err);
    }
  },
  get: async (req, res, next) => {
    try {
      const lead = await LeadService.getById(req.params.id, req.user);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
      return res.json({ data: lead });
    } catch (err) {
      return next(err);
    }
  },
  create: async (req, res, next) => {
    try {
      const lead = await LeadService.create(req.body, req.user);
      return res.status(201).json({ data: lead });
    } catch (err) {
      return next(err);
    }
  },
};

export default LeadController;
