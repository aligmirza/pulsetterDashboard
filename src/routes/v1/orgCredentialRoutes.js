import { Router } from 'express';
import OrgCredentialController from '../../controllers/orgCredentialController.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin'), OrgCredentialController.upsert);
router.get('/:provider', authorize('admin'), OrgCredentialController.get);

export default router;
