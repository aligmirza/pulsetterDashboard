import { Router } from 'express';
import LookupController from '../../controllers/lookupController.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'internal'), LookupController.search);

export default router;
