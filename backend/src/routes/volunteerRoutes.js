import { Router } from 'express';
import {
  applyVolunteer,
  getOrphanageApplications,
  updateApplicationStatus,
  getRoles,
  createRole,
  submitApplication,
  getApplications,
} from '../controllers/volunteerController.js';

const router = Router();

// Official Volunteer System Endpoints
router.post('/apply', applyVolunteer);
router.get('/orphanage', getOrphanageApplications);

// Applications list & status management
router.get('/applications', getApplications);
router.post('/applications', submitApplication);
router.patch('/applications/:id/status', updateApplicationStatus);
router.patch('/:id/status', updateApplicationStatus);

// Role management
router.get('/roles', getRoles);
router.post('/roles', createRole);

export default router;
