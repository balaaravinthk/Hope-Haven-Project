import { Router } from 'express';
import { register, login, requestAadhaarOtp, verifyOtp, getMe } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/aadhaar/send-otp', requestAadhaarOtp);
router.post('/aadhaar/verify-otp', verifyOtp);
router.get('/me', authenticate, getMe);

export default router;
