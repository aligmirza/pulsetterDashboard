import { Router } from 'express';
import ProviderCredentialController from '../../controllers/providerCredentialController.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/summary/all', authorize('admin', 'internal'), ProviderCredentialController.summary);
router.post('/', authorize('admin', 'internal'), ProviderCredentialController.upsert);
router.get('/:provider', authorize('admin', 'internal'), ProviderCredentialController.get);

export default router;
