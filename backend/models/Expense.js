import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    expenseName: {
      type: String,
      required: [true, 'Expense name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Expense amount must be a positive number'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ year: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
