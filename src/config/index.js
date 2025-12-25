import dotenv from 'dotenv';

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 100),
  },
  smartleadApiKey: process.env.SMARTLEAD_API_KEY || '',
  instantlyApiToken: process.env.INSTANTLY_API_TOKEN || '',
  clayApiKey: process.env.CLAY_API_KEY || '',
  clientPortalUrl: process.env.CLIENT_PORTAL_URL || '',
};

export default config;
