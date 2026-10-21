import { Router } from 'express';
import {
  registerOrphanage,
  getProfile,
  updateProfile,
  getMyRequirements,
} from '../controllers/orphanageController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Institutional Profile Endpoints (hydrates req.user if Bearer token present)
router.get('/me', optionalAuthenticate, getProfile);
router.put('/me', optionalAuthenticate, updateProfile);
router.get('/me/requirements', optionalAuthenticate, getMyRequirements);

router.get('/profile', optionalAuthenticate, getProfile);
router.put('/profile', optionalAuthenticate, updateProfile);

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
