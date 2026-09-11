import express from 'express';
import {
  getMaterialContributions,
  getMaterialContributionById,
  createMaterialContribution,
  updateMaterialContribution,
  deleteMaterialContribution,
} from '../controllers/materialContributionController.js';

const router = express.Router();

router.route('/').get(getMaterialContributions).post(createMaterialContribution);
router.route('/:id').get(getMaterialContributionById).put(updateMaterialContribution).delete(deleteMaterialContribution);

export default router;
