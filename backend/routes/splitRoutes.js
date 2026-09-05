import express from 'express';
import {
  getSplits,
  getSplitById,
  createSplit,
  updateSplit,
  deleteSplit,
} from '../controllers/splitController.js';
import {
  createRecovery,
  getRecoveriesBySplit,
} from '../controllers/recoveryController.js';

const router = express.Router();

router.route('/').get(getSplits).post(createSplit);
router.route('/:id').get(getSplitById).put(updateSplit).delete(deleteSplit);

// Nested recovery routes for a split
router.route('/:id/recoveries').get(getRecoveriesBySplit).post(createRecovery);

export default router;
