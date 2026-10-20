import { Router } from 'express';
import {
  registerOrphanage,
  getProfile,
  updateProfile,
  getMyRequirements,
} from '../controllers/orphanageController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Institutional Profile Endpoints
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/me/requirements', getMyRequirements);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.post(
  '/register',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'buildingPhoto', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
    { name: 'registrationDoc', maxCount: 5 },
  ]),
  registerOrphanage
);

export default router;
