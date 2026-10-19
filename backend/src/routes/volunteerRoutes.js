import { Router } from 'express';
import {
  getRoles,
  createRole,
  getApplications,
  submitApplication,
  updateApplicationStatus,
} from '../controllers/volunteerController.js';

const router = Router();

router.get('/roles', getRoles);
router.post('/roles', createRole);
router.get('/applications', getApplications);
router.post('/applications', submitApplication);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;
