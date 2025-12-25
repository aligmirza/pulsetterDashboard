import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import OverviewController from '../../controllers/overviewController.js';

const router = Router();

router.use(authenticate);
router.get('/summary', authorize('admin', 'internal'), OverviewController.summary);

export default router;
