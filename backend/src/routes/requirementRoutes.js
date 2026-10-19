import { Router } from 'express';
import {
  getRequirements,
  getLiveFeed,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} from '../controllers/requirementController.js';

const router = Router();

router.get('/', getRequirements);
router.get('/feed', getLiveFeed);
router.post('/', createRequirement);
router.put('/:id', updateRequirement);
router.delete('/:id', deleteRequirement);

export default router;
