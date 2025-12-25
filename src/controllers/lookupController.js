import LeadService from '../services/clients/leadService.js';

const LookupController = {
  search: async (req, res, next) => {
    try {
      const results = await LeadService.search(req.query);
      return res.json({ data: results });
    } catch (err) {
      return next(err);
    }
  },
};

export default LookupController;
