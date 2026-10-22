import { Router } from 'express';
import authRoutes from './authRoutes.js';
import orphanageRoutes from './orphanageRoutes.js';
import requirementRoutes from './requirementRoutes.js';
import donationRoutes from './donationRoutes.js';
import volunteerRoutes from './volunteerRoutes.js';
import userRoutes from './userRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/orphanages', orphanageRoutes);
apiRouter.use('/requirements', requirementRoutes);
apiRouter.use('/donations', donationRoutes);
apiRouter.use('/volunteers', volunteerRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/notifications', notificationRoutes);

export default apiRouter;
