import { Router } from 'express';
import { getUserImpact } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/impact', authenticate, getUserImpact);

export default router;
