import MaterialContribution from '../models/MaterialContribution.js';

// GET /api/material-contributions
export const getMaterialContributions = async (req, res) => {
  try {
    const { year, category, status, search, startDate, endDate, limit } = req.query;

    const filter = {};

    if (year) {
      filter.year = Number(year);
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { donorName: { $regex: search, $options: 'i' } },
        { itemName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    let query = MaterialContribution.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    if (limit) {
      query = query.limit(Number(limit));
    }

    const items = await query;

    // Calculate aggregated metrics
    const totalItems = items.length;
    const totalEstimatedValue = items.reduce((sum, item) => sum + (item.estimatedValue || 0), 0);
    const receivedCount = items.filter((item) => item.status === 'Received').length;
    const pledgedCount = items.filter((item) => item.status === 'Pledged').length;
    const usedCount = items.filter((item) => item.status === 'Used').length;

    res.json({
      success: true,
      count: totalItems,
      metrics: {
        totalItems,
        totalEstimatedValue,
        receivedCount,
        pledgedCount,
        usedCount,
      },
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/material-contributions/:id
export const getMaterialContributionById = async (req, res) => {
  try {
    const item = await MaterialContribution.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Material contribution record not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/material-contributions
export const createMaterialContribution = async (req, res) => {
  try {
    const { donorName, phone, itemName, quantity, estimatedValue, category, date, status, notes, year } = req.body;

    if (!donorName || donorName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Donor name cannot be empty' });
    }

    if (!itemName || itemName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Item name cannot be empty' });
    }

    if (!quantity || quantity.trim() === '') {
      return res.status(400).json({ success: false, message: 'Quantity cannot be empty' });
    }

    const numericValue = Number(estimatedValue) || 0;
    if (numericValue < 0) {
      return res.status(400).json({ success: false, message: 'Estimated value cannot be negative' });
    }

    const selectedYear = Number(year) || new Date().getFullYear();

    const newContribution = await MaterialContribution.create({
      donorName: donorName.trim(),
      phone: phone ? phone.trim() : '',
      itemName: itemName.trim(),
      quantity: quantity.trim(),
      estimatedValue: numericValue,
      category: category ? category.trim() : 'Other',
      date: date ? new Date(date) : new Date(),
      status: status || 'Received',
      notes: notes ? notes.trim() : '',
      year: selectedYear,
    });

    res.status(201).json({
      success: true,
      message: 'Material contribution added successfully.',
      data: newContribution,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/material-contributions/:id
export const updateMaterialContribution = async (req, res) => {
  try {
    const { donorName, phone, itemName, quantity, estimatedValue, category, date, status, notes, year } = req.body;

    const item = await MaterialContribution.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Material contribution record not found' });
    }

    if (donorName !== undefined) {
      if (!donorName || donorName.trim() === '') {
        return res.status(400).json({ success: false, message: 'Donor name cannot be empty' });
      }
      item.donorName = donorName.trim();
    }

    if (itemName !== undefined) {
      if (!itemName || itemName.trim() === '') {
        return res.status(400).json({ success: false, message: 'Item name cannot be empty' });
      }
      item.itemName = itemName.trim();
    }

    if (quantity !== undefined) {
      if (!quantity || quantity.trim() === '') {
        return res.status(400).json({ success: false, message: 'Quantity cannot be empty' });
      }
      item.quantity = quantity.trim();
    }

    if (estimatedValue !== undefined) {
      const numericValue = Number(estimatedValue) || 0;
      if (numericValue < 0) {
        return res.status(400).json({ success: false, message: 'Estimated value cannot be negative' });
      }
      item.estimatedValue = numericValue;
    }

    if (phone !== undefined) item.phone = phone ? phone.trim() : '';
    if (category !== undefined) item.category = category ? category.trim() : 'Other';
    if (date !== undefined) item.date = new Date(date);
    if (status !== undefined) item.status = status;
    if (notes !== undefined) item.notes = notes ? notes.trim() : '';
    if (year !== undefined) item.year = Number(year);

    await item.save();

    res.json({
      success: true,
      message: 'Material contribution updated successfully.',
      data: item,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/material-contributions/:id
export const deleteMaterialContribution = async (req, res) => {
  try {
    const item = await MaterialContribution.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Material contribution record not found' });
    }
    res.json({ success: true, message: 'Material contribution record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
