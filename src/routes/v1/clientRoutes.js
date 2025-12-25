import { Router } from 'express';
import ClientController from '../../controllers/clientController.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'internal'), ClientController.list);
router.post('/', authorize('admin', 'internal'), ClientController.create);
router.patch('/:clientId', authorize('admin', 'internal'), ClientController.update);
router.delete('/:clientId', authorize('admin', 'internal'), ClientController.remove);
router.get('/:clientId/campaigns', authorize('admin', 'internal'), ClientController.campaigns);
router.post('/:clientId/assign-campaigns', authorize('admin', 'internal'), ClientController.assignCampaigns);

export default router;
