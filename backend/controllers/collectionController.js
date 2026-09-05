import Collection from '../models/Collection.js';
import Settings from '../models/Settings.js';

// GET /api/collections
export const getCollections = async (req, res) => {
  try {
    const { year, category, search, paymentStatus, startDate, endDate } = req.query;

    const filter = {};

    if (year) {
      filter.year = Number(year);
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const collections = await Collection.find(filter).sort({ date: -1, createdAt: -1 });

    // Calculate aggregated metrics for this filtered set
    const totalActualReceived = collections
      .filter((c) => c.paymentStatus === 'Received')
      .reduce((sum, c) => sum + (c.actualAmount || 0), 0);

    const totalExpected = collections.reduce((sum, c) => sum + (c.expectedAmount || 0), 0);

    const totalContributors = collections.length;

    res.json({
      success: true,
      count: totalContributors,
      metrics: {
        totalActualReceived,
        totalExpected,
        difference: totalExpected - totalActualReceived,
      },
      data: collections,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/collections/:id
export const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection record not found' });
    }
    res.json({ success: true, data: collection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/collections
export const createCollection = async (req, res) => {
  try {
    const { name, phone, category, expectedAmount, actualAmount, paymentStatus, date, notes, year } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Contributor name cannot be empty' });
    }

    if (!category || !['working', 'student', 'general_public'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category selected' });
    }

    const numericActual = Number(actualAmount);
    if (isNaN(numericActual) || numericActual <= 0) {
      return res.status(400).json({ success: false, message: 'Actual amount must be a valid positive number' });
    }

    const selectedYear = Number(year) || new Date().getFullYear();

    // Determine expected amount from year settings if not provided
    let finalExpectedAmount = expectedAmount !== undefined && expectedAmount !== null && expectedAmount !== ''
      ? Number(expectedAmount)
      : null;

    if (category === 'working' && finalExpectedAmount === null) {
      const yearSetting = await Settings.findOne({ year: selectedYear });
      finalExpectedAmount = yearSetting ? yearSetting.workingDefaultAmount : 2000;
    } else if (category === 'student' && finalExpectedAmount === null) {
      const yearSetting = await Settings.findOne({ year: selectedYear });
      finalExpectedAmount = yearSetting ? yearSetting.studentDefaultAmount : 500;
    } else if (category === 'general_public') {
      finalExpectedAmount = null; // Expected amount must be null for general public
    }

    const newCollection = await Collection.create({
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      category,
      expectedAmount: finalExpectedAmount,
      actualAmount: numericActual,
      paymentStatus: paymentStatus || 'Received',
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
      year: selectedYear,
    });

    res.status(201).json({
      success: true,
      message: 'Collection added successfully.',
      data: newCollection,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/collections/:id
export const updateCollection = async (req, res) => {
  try {
    const { name, phone, category, expectedAmount, actualAmount, paymentStatus, date, notes, year } = req.body;

    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection record not found' });
    }

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Contributor name cannot be empty' });
      }
      collection.name = name.trim();
    }

    if (category !== undefined) {
      if (!['working', 'student', 'general_public'].includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category selected' });
      }
      collection.category = category;
    }

    if (actualAmount !== undefined) {
      const numericActual = Number(actualAmount);
      if (isNaN(numericActual) || numericActual <= 0) {
        return res.status(400).json({ success: false, message: 'Actual amount must be a valid positive number' });
      }
      collection.actualAmount = numericActual;
    }

    if (expectedAmount !== undefined) {
      if (collection.category === 'general_public') {
        collection.expectedAmount = null;
      } else {
        collection.expectedAmount = expectedAmount === null || expectedAmount === '' ? null : Number(expectedAmount);
      }
    }

    if (phone !== undefined) collection.phone = phone ? phone.trim() : '';
    if (paymentStatus !== undefined) collection.paymentStatus = paymentStatus;
    if (date !== undefined) collection.date = new Date(date);
    if (notes !== undefined) collection.notes = notes ? notes.trim() : '';
    if (year !== undefined) collection.year = Number(year);

    await collection.save();

    res.json({
      success: true,
      message: 'Collection updated successfully.',
      data: collection,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/collections/:id
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection record not found' });
    }
    res.json({ success: true, message: 'Collection record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
