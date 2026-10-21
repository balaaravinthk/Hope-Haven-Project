import { Router } from 'express';
import {
  getDonations,
  createDonation,
  getReceipt,
} from '../controllers/donationController.js';
import { optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthenticate, getDonations);
router.post('/', optionalAuthenticate, createDonation);
router.get('/receipt/:receiptId', getReceipt);

export default router;
