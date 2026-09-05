import express from 'express';
import {
  getSettings,
  getSettingsByYear,
  createYearSetting,
  updateSetting,
  backupData,
  restoreData,
  clearData,
} from '../controllers/settingsController.js';

const router = express.Router();

router.route('/').get(getSettings).post(createYearSetting);
router.route('/backup').get(backupData);
router.route('/restore').post(restoreData);
router.route('/clear-data').post(clearData);
router.route('/by-year/:year').get(getSettingsByYear);
router.route('/:id').put(updateSetting);

export default router;
