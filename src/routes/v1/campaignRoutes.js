import { Router } from 'express';
import CampaignController from '../../controllers/campaignController.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'internal', 'client'), CampaignController.list);
router.get('/:id', authorize('admin', 'internal', 'client'), CampaignController.get);
router.post('/sync', authorize('admin', 'internal'), CampaignController.sync);

export default router;
