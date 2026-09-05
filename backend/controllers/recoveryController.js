import Recovery from '../models/Recovery.js';
import Split from '../models/Split.js';
import { enrichSplitsWithRecovery } from './splitController.js';

// POST /api/splits/:id/recoveries
export const createRecovery = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, notes } = req.body;

    const split = await Split.findById(id);
    if (!split) {
      return res.status(404).json({ success: false, message: 'Split record not found' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Recovery amount must be a valid positive number' });
    }

    // Get existing recoveries for this split
    const existingRecoveries = await Recovery.find({ splitId: split._id });
    const currentTotalRecovered = existingRecoveries.reduce((sum, r) => sum + r.amount, 0);
    const remaining = split.amountGiven - currentTotalRecovered;

    // Strict validation requirement: Never allow total recovered > amount given
    if (numericAmount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Recovery amount cannot exceed the remaining ₹${remaining.toLocaleString('en-IN')}.`,
      });
    }

    const newRecovery = await Recovery.create({
      splitId: split._id,
      amount: numericAmount,
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
    });

    const [updatedSplit] = await enrichSplitsWithRecovery([split]);

    res.status(201).json({
      success: true,
      message: 'Recovery recorded successfully.',
      data: {
        recovery: newRecovery,
        split: updatedSplit,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/splits/:id/recoveries
export const getRecoveriesBySplit = async (req, res) => {
  try {
    const { id } = req.params;
    const recoveries = await Recovery.find({ splitId: id }).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: recoveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/recoveries/:id
export const deleteRecovery = async (req, res) => {
  try {
    const recovery = await Recovery.findById(req.params.id);
    if (!recovery) {
      return res.status(404).json({ success: false, message: 'Recovery record not found' });
    }

    const splitId = recovery.splitId;
    await Recovery.findByIdAndDelete(req.params.id);

    const split = await Split.findById(splitId);
    let updatedSplit = null;
    if (split) {
      [updatedSplit] = await enrichSplitsWithRecovery([split]);
    }

    res.json({
      success: true,
      message: 'Recovery record deleted successfully',
      data: { split: updatedSplit },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
