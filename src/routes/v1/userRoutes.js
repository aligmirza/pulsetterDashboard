import { Router } from 'express';
import UserController from '../../controllers/userController.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), UserController.list);
router.post('/', authorize('admin'), UserController.create);
router.patch('/:id', authorize('admin'), UserController.update);
router.delete('/:id', authorize('admin'), UserController.remove);

export default router;
