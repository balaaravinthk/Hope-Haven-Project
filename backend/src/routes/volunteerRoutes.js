import { Router } from 'express';
import {
  applyVolunteer,
  getOrphanageApplications,
  updateApplicationStatus,
  getRoles,
  createRole,
  submitApplication,
  getApplications,
  getMyVolunteerApplications,
} from '../controllers/volunteerController.js';
import { optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Official Volunteer System Endpoints
router.post('/apply', optionalAuthenticate, applyVolunteer);
router.get('/orphanage', optionalAuthenticate, getOrphanageApplications);
router.get('/my-applications', optionalAuthenticate, getMyVolunteerApplications);

// Applications list & status management
router.get('/applications', optionalAuthenticate, getApplications);
router.post('/applications', optionalAuthenticate, submitApplication);
router.patch('/applications/:id/status', optionalAuthenticate, updateApplicationStatus);
router.patch('/:id/status', optionalAuthenticate, updateApplicationStatus);

// Role management
router.get('/roles', optionalAuthenticate, getRoles);
router.post('/roles', optionalAuthenticate, createRole);

export default router;
