import { Router } from 'express';
import authRoutes from './authRoutes.js';
import clientRoutes from './clientRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import leadRoutes from './leadRoutes.js';
import lookupRoutes from './lookupRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import userRoutes from './userRoutes.js';
import providerCredentialRoutes from './providerCredentialRoutes.js';
import orgCredentialRoutes from './orgCredentialRoutes.js';
import overviewRoutes from './overviewRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/leads', leadRoutes);
router.use('/lead-lookup', lookupRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/provider-credentials', providerCredentialRoutes);
router.use('/org-credentials', orgCredentialRoutes);
router.use('/overview', overviewRoutes);
router.get('/health', (req, res) => res.json({ status: 'ok' }));

export default router;
