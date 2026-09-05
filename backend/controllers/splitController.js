import Split from '../models/Split.js';
import Recovery from '../models/Recovery.js';

// Helper to compute recovery stats for a list of splits
export const enrichSplitsWithRecovery = async (splits) => {
  const splitIds = splits.map((s) => s._id);
  const recoveries = await Recovery.find({ splitId: { $in: splitIds } }).sort({ date: 1 });

  const recoveryMap = {};
  recoveries.forEach((r) => {
    const sId = r.splitId.toString();
    if (!recoveryMap[sId]) recoveryMap[sId] = [];
    recoveryMap[sId].push(r);
  });

  return splits.map((s) => {
    const sObj = s.toObject ? s.toObject() : s;
    const splitRecoveries = recoveryMap[s._id.toString()] || [];
    const totalRecovered = splitRecoveries.reduce((sum, r) => sum + r.amount, 0);
    const remaining = Math.max(0, sObj.amountGiven - totalRecovered);

    let status = 'Pending';
    if (remaining === 0) {
      status = 'Completed';
    } else if (totalRecovered > 0) {
      status = 'Partial';
    }

    return {
      ...sObj,
      totalRecovered,
      remaining,
      status,
      recoveries: splitRecoveries,
    };
  });
};

// GET /api/splits
export const getSplits = async (req, res) => {
  try {
    const { year, search } = req.query;
    const filter = {};

    if (year) {
      filter.year = Number(year);
    }

    if (search) {
      filter.$or = [
        { personName: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const rawSplits = await Split.find(filter).sort({ dateGiven: -1, createdAt: -1 });
    const enrichedSplits = await enrichSplitsWithRecovery(rawSplits);

    const totalGiven = enrichedSplits.reduce((sum, s) => sum + s.amountGiven, 0);
    const totalRecovered = enrichedSplits.reduce((sum, s) => sum + s.totalRecovered, 0);
    const yetToRecover = totalGiven - totalRecovered;

    const completedCount = enrichedSplits.filter((s) => s.status === 'Completed').length;
    const partialCount = enrichedSplits.filter((s) => s.status === 'Partial').length;
    const pendingCount = enrichedSplits.filter((s) => s.status === 'Pending').length;

    res.json({
      success: true,
      count: enrichedSplits.length,
      metrics: {
        totalGiven,
        totalRecovered,
        yetToRecover,
        completedCount,
        partialCount,
        pendingCount,
      },
      data: enrichedSplits,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/splits/:id
export const getSplitById = async (req, res) => {
  try {
    const rawSplit = await Split.findById(req.params.id);
    if (!rawSplit) {
      return res.status(404).json({ success: false, message: 'Split record not found' });
    }

    const [enriched] = await enrichSplitsWithRecovery([rawSplit]);
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/splits
export const createSplit = async (req, res) => {
  try {
    const { personName, amountGiven, dateGiven, purpose, notes, year } = req.body;

    if (!personName || personName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Person name is required' });
    }

    const numericAmount = Number(amountGiven);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount given must be a valid positive number' });
    }

    if (!purpose || purpose.trim() === '') {
      return res.status(400).json({ success: false, message: 'Purpose is required' });
    }

    const selectedYear = Number(year) || new Date().getFullYear();

    const newSplit = await Split.create({
      personName: personName.trim(),
      amountGiven: numericAmount,
      dateGiven: dateGiven ? new Date(dateGiven) : new Date(),
      purpose: purpose.trim(),
      notes: notes ? notes.trim() : '',
      year: selectedYear,
    });

    const [enriched] = await enrichSplitsWithRecovery([newSplit]);

    res.status(201).json({
      success: true,
      message: 'Split amount recorded successfully.',
      data: enriched,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/splits/:id
export const updateSplit = async (req, res) => {
  try {
    const { personName, amountGiven, dateGiven, purpose, notes, year } = req.body;

    const split = await Split.findById(req.params.id);
    if (!split) {
      return res.status(404).json({ success: false, message: 'Split record not found' });
    }

    if (personName !== undefined) {
      if (!personName || personName.trim() === '') {
        return res.status(400).json({ success: false, message: 'Person name is required' });
      }
      split.personName = personName.trim();
    }

    if (amountGiven !== undefined) {
      const numericAmount = Number(amountGiven);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount given must be a valid positive number' });
      }
      // Check existing recoveries do not exceed new amountGiven
      const existingRecoveries = await Recovery.find({ splitId: split._id });
      const currentTotalRecovered = existingRecoveries.reduce((sum, r) => sum + r.amount, 0);
      if (numericAmount < currentTotalRecovered) {
        return res.status(400).json({
          success: false,
          message: `Amount given cannot be less than already recovered total of ₹${currentTotalRecovered}`,
        });
      }
      split.amountGiven = numericAmount;
    }

    if (dateGiven !== undefined) split.dateGiven = new Date(dateGiven);
    if (purpose !== undefined) split.purpose = purpose.trim();
    if (notes !== undefined) split.notes = notes ? notes.trim() : '';
    if (year !== undefined) split.year = Number(year);

    await split.save();

    const [enriched] = await enrichSplitsWithRecovery([split]);

    res.json({
      success: true,
      message: 'Split record updated successfully.',
      data: enriched,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/splits/:id
export const deleteSplit = async (req, res) => {
  try {
    const split = await Split.findById(req.params.id);
    if (!split) {
      return res.status(404).json({ success: false, message: 'Split record not found' });
    }

    // Delete linked recoveries
    await Recovery.deleteMany({ splitId: split._id });
    await Split.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Split record and associated recoveries deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
