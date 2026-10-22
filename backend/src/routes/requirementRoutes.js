import { Router } from 'express';
import {
  getRequirements,
  getLiveFeed,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} from '../controllers/requirementController.js';
import { optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getRequirements);
router.get('/feed', getLiveFeed);
router.post('/', optionalAuthenticate, createRequirement);
router.put('/:id', optionalAuthenticate, updateRequirement);
router.delete('/:id', optionalAuthenticate, deleteRequirement);

export default router;
