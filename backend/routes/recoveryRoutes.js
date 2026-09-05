import express from 'express';
import { deleteRecovery } from '../controllers/recoveryController.js';

const router = express.Router();

router.route('/:id').delete(deleteRecovery);

export default router;
