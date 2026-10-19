import { Router } from 'express';
import {
  getDonations,
  createDonation,
  getReceipt,
} from '../controllers/donationController.js';

const router = Router();

router.get('/', getDonations);
router.post('/', createDonation);
router.get('/receipt/:receiptId', getReceipt);

export default router;
