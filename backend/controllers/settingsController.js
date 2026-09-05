import Settings from '../models/Settings.js';
import Collection from '../models/Collection.js';
import Expense from '../models/Expense.js';
import Split from '../models/Split.js';
import Recovery from '../models/Recovery.js';

// GET /api/settings
export const getSettings = async (req, res) => {
  try {
    const settingsList = await Settings.find().sort({ year: -1 });
    
    // Find current active year setting
    let currentSetting = settingsList.find((s) => s.isCurrentYear);
    if (!currentSetting && settingsList.length > 0) {
      currentSetting = settingsList[0];
    }

    res.json({
      success: true,
      data: settingsList,
      currentSetting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/settings/:year
export const getSettingsByYear = async (req, res) => {
  try {
    const year = Number(req.params.year);
    let setting = await Settings.findOne({ year });
    
    if (!setting) {
      // Create default settings for requested year
      setting = await Settings.create({
        eventName: 'Vinayagar Chathurthi',
        year,
        workingDefaultAmount: 2000,
        studentDefaultAmount: 500,
        expenseCategories: [
          'Decoration',
          'Food',
          'Sound System',
          'Pooja Items',
          'Electricity',
          'Transport',
          'Printing',
          'Cleaning',
          'Hall/Ground',
          'Other',
        ],
      });
    }

    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/settings
export const createYearSetting = async (req, res) => {
  try {
    const { eventName, year, workingDefaultAmount, studentDefaultAmount, expenseCategories } = req.body;

    const numericYear = Number(year);
    if (isNaN(numericYear) || numericYear < 2000 || numericYear > 2100) {
      return res.status(400).json({ success: false, message: 'Invalid year provided' });
    }

    const existing = await Settings.findOne({ year: numericYear });
    if (existing) {
      return res.status(400).json({ success: false, message: `Settings for year ${numericYear} already exist` });
    }

    const newSetting = await Settings.create({
      eventName: eventName ? eventName.trim() : 'Vinayagar Chathurthi',
      year: numericYear,
      workingDefaultAmount: workingDefaultAmount !== undefined ? Number(workingDefaultAmount) : 2000,
      studentDefaultAmount: studentDefaultAmount !== undefined ? Number(studentDefaultAmount) : 500,
      expenseCategories: Array.isArray(expenseCategories) && expenseCategories.length > 0
        ? expenseCategories
        : [
            'Decoration',
            'Food',
            'Sound System',
            'Pooja Items',
            'Electricity',
            'Transport',
            'Printing',
            'Cleaning',
            'Hall/Ground',
            'Other',
          ],
    });

    res.status(201).json({
      success: true,
      message: `Settings for year ${numericYear} created successfully.`,
      data: newSetting,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/settings/:id
export const updateSetting = async (req, res) => {
  try {
    const { eventName, workingDefaultAmount, studentDefaultAmount, expenseCategories, isCurrentYear } = req.body;

    const setting = await Settings.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting record not found' });
    }

    if (eventName !== undefined) setting.eventName = eventName.trim();
    if (workingDefaultAmount !== undefined) setting.workingDefaultAmount = Number(workingDefaultAmount);
    if (studentDefaultAmount !== undefined) setting.studentDefaultAmount = Number(studentDefaultAmount);
    if (expenseCategories !== undefined && Array.isArray(expenseCategories)) {
      setting.expenseCategories = expenseCategories;
    }

    if (isCurrentYear) {
      await Settings.updateMany({}, { isCurrentYear: false });
      setting.isCurrentYear = true;
    }

    await setting.save();

    res.json({
      success: true,
      message: 'Settings updated successfully.',
      data: setting,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST /api/settings/backup
export const backupData = async (req, res) => {
  try {
    const collections = await Collection.find();
    const expenses = await Expense.find();
    const splits = await Split.find();
    const recoveries = await Recovery.find();
    const settings = await Settings.find();

    const backupPayload = {
      app: 'VCMS',
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        collections,
        expenses,
        splits,
        recoveries,
        settings,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=vcms_backup_${new Date().toISOString().slice(0, 10)}.json`);
    res.json(backupPayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/settings/restore
export const restoreData = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: 'Invalid restore payload. Missing data object.' });
    }

    const { collections, expenses, splits, recoveries, settings } = data;

    if (collections && Array.isArray(collections)) {
      await Collection.deleteMany({});
      if (collections.length > 0) await Collection.insertMany(collections);
    }

    if (expenses && Array.isArray(expenses)) {
      await Expense.deleteMany({});
      if (expenses.length > 0) await Expense.insertMany(expenses);
    }

    if (splits && Array.isArray(splits)) {
      await Split.deleteMany({});
      if (splits.length > 0) await Split.insertMany(splits);
    }

    if (recoveries && Array.isArray(recoveries)) {
      await Recovery.deleteMany({});
      if (recoveries.length > 0) await Recovery.insertMany(recoveries);
    }

    if (settings && Array.isArray(settings)) {
      await Settings.deleteMany({});
      if (settings.length > 0) await Settings.insertMany(settings);
    }

    res.json({
      success: true,
      message: 'System data restored successfully.',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST /api/settings/clear-data
export const clearData = async (req, res) => {
  try {
    const { year, clearAll } = req.body;

    if (clearAll) {
      await Collection.deleteMany({});
      await Expense.deleteMany({});
      await Split.deleteMany({});
      await Recovery.deleteMany({});
      return res.json({ success: true, message: 'All system data has been cleared successfully.' });
    }

    if (year) {
      const numericYear = Number(year);
      const yearSplits = await Split.find({ year: numericYear });
      const yearSplitIds = yearSplits.map((s) => s._id);

      await Collection.deleteMany({ year: numericYear });
      await Expense.deleteMany({ year: numericYear });
      await Recovery.deleteMany({ splitId: { $in: yearSplitIds } });
      await Split.deleteMany({ year: numericYear });

      return res.json({ success: true, message: `All data for year ${numericYear} has been cleared.` });
    }

    res.status(400).json({ success: false, message: 'Please specify year or clearAll flag' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
