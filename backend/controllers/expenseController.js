import Expense from '../models/Expense.js';

// GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const { year, category, search, startDate, endDate } = req.query;

    const filter = {};

    if (year) {
      filter.year = Number(year);
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { expenseName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });

    const totalExpenseAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const count = expenses.length;
    const largestExpense = expenses.length > 0
      ? Math.max(...expenses.map((e) => e.amount || 0))
      : 0;

    res.json({
      success: true,
      count,
      totalExpenseAmount,
      largestExpense,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/expenses/:id
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const { expenseName, category, amount, date, description, year } = req.body;

    if (!expenseName || expenseName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Expense name cannot be empty' });
    }

    if (!category || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Expense amount must be a valid positive number' });
    }

    const selectedYear = Number(year) || new Date().getFullYear();

    const newExpense = await Expense.create({
      expenseName: expenseName.trim(),
      category: category.trim(),
      amount: numericAmount,
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : '',
      year: selectedYear,
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully.',
      data: newExpense,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const { expenseName, category, amount, date, description, year } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    if (expenseName !== undefined) {
      if (!expenseName || expenseName.trim() === '') {
        return res.status(400).json({ success: false, message: 'Expense name cannot be empty' });
      }
      expense.expenseName = expenseName.trim();
    }

    if (category !== undefined) {
      if (!category || category.trim() === '') {
        return res.status(400).json({ success: false, message: 'Category is required' });
      }
      expense.category = category.trim();
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Expense amount must be a valid positive number' });
      }
      expense.amount = numericAmount;
    }

    if (date !== undefined) expense.date = new Date(date);
    if (description !== undefined) expense.description = description ? description.trim() : '';
    if (year !== undefined) expense.year = Number(year);

    await expense.save();

    res.json({
      success: true,
      message: 'Expense updated successfully.',
      data: expense,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
