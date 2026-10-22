import { Router } from 'express';
import {
  adminLogin,
  getAdminStats,
  getAllOrphanages,
  getOrphanageById,
  updateOrphanageStatus,
} from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = Router();

// Public Admin Login endpoint
router.post('/login', adminLogin);

// Protected Admin Endpoints
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/orphanages', getAllOrphanages);
router.get('/orphanages/:id', getOrphanageById);
router.patch('/orphanages/:id/status', updateOrphanageStatus);

export default router;
