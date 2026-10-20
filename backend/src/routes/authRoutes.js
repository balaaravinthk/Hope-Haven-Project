import { Router } from 'express';
import {
  register,
  login,
  requestAadhaarOtp,
  verifyOtp,
  getMe,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { handleRegistrationUpload } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.post('/register', handleRegistrationUpload, register);
router.post('/login', login);
router.post('/aadhaar/send-otp', requestAadhaarOtp);
router.post('/aadhaar/verify-otp', verifyOtp);
router.get('/me', authenticate, getMe);

export default router;
