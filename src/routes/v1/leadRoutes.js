import { Router } from 'express';
import LeadController from '../../controllers/leadController.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'internal', 'client'), LeadController.list);
router.get('/:id', authorize('admin', 'internal', 'client'), LeadController.get);
router.post('/', authorize('admin', 'internal'), LeadController.create);

export default router;
