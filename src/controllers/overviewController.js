import MetricsService from '../services/clients/metricsService.js';

const OverviewController = {
  summary: async (req, res, next) => {
    try {
      const data = await MetricsService.summary();
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  },
};

export default OverviewController;
