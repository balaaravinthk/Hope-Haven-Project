import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthenticate, getNotifications);
router.patch('/read-all', optionalAuthenticate, markAllAsRead);
router.patch('/:id/read', optionalAuthenticate, markAsRead);

export default router;
