import express from 'express';
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
} from '../controllers/collectionController.js';

const router = express.Router();

router.route('/').get(getCollections).post(createCollection);
router.route('/:id').get(getCollectionById).put(updateCollection).delete(deleteCollection);

export default router;
