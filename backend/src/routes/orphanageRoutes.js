import { Router } from 'express';
import {
  registerOrphanage,
  getProfile,
  updateProfile,
} from '../controllers/orphanageController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.post(
  '/register',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
  ]),
  registerOrphanage
);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
