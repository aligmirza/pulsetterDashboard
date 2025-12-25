import AnalyticsService from '../services/clients/analyticsService.js';

const AnalyticsController = {
  summary: async (req, res, next) => {
    try {
      const data = await AnalyticsService.summary(req.query, req.user);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  },
  daily: async (req, res, next) => {
    try {
      const data = await AnalyticsService.daily(req.query, req.user);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  },
};

export default AnalyticsController;
