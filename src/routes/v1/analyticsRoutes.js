import { Router } from 'express';
import AnalyticsController from '../../controllers/analyticsController.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/summary', authorize('admin', 'internal', 'client'), AnalyticsController.summary);
router.get('/daily', authorize('admin', 'internal', 'client'), AnalyticsController.daily);

export default router;
