import config from '../../config/index.js';

const ClayService = {
  async enrichLead(lead) {
    // Placeholder for Clay enrichment integration
    // Accepts a lead object and returns enriched lead fields
    return {
      ...lead,
      enrichment_source: 'clay',
      clay_key_used: Boolean(config.clayApiKey),
    };
  },
};

export default ClayService;
