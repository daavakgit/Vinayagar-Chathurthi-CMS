import Settings from '../models/Settings.js';
import Collection from '../models/Collection.js';
import Expense from '../models/Expense.js';
import Split from '../models/Split.js';
import Recovery from '../models/Recovery.js';

export const seedDefaults = async () => {
  try {
    // Seed default Settings if none exist
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create([
        {
          eventName: 'Vinayagar Chathurthi',
          year: 2026,
          workingDefaultAmount: 2000,
          studentDefaultAmount: 500,
          isCurrentYear: true,
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
        },
        {
          eventName: 'Vinayagar Chathurthi',
          year: 2027,
          workingDefaultAmount: 2500,
          studentDefaultAmount: 500,
          isCurrentYear: false,
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
        },
        {
          eventName: 'Vinayagar Chathurthi',
          year: 2028,
          workingDefaultAmount: 3000,
          studentDefaultAmount: 1000,
          isCurrentYear: false,
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
        },
      ]);
      console.log('⚙️ Default Settings initialized for 2026, 2027, 2028.');
    }
  } catch (err) {
    console.error('Error in seedDefaults:', err.message);
  }
};
