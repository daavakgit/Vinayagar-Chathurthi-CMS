import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      default: 'Vinayagar Chathurthi',
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      unique: true,
    },
    workingDefaultAmount: {
      type: Number,
      default: 2000,
      min: [0, 'Working default amount cannot be negative'],
    },
    studentDefaultAmount: {
      type: Number,
      default: 500,
      min: [0, 'Student default amount cannot be negative'],
    },
    expenseCategories: {
      type: [String],
      default: [
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
    isCurrentYear: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
