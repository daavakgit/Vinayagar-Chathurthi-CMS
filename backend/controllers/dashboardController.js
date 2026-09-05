import Collection from '../models/Collection.js';
import Expense from '../models/Expense.js';
import Split from '../models/Split.js';
import Recovery from '../models/Recovery.js';
import Settings from '../models/Settings.js';

// GET /api/dashboard?year=2026
export const getDashboardMetrics = async (req, res) => {
  try {
    const yearParam = req.query.year ? Number(req.query.year) : 2026;

    // Fetch year settings to ensure default amounts are retrieved
    const yearSetting = await Settings.findOne({ year: yearParam });

    // 1. Collections for selected year
    const collections = await Collection.find({ year: yearParam });

    const totalContributors = collections.length;
    const paidContributorsCount = collections.filter(
      (c) => !c.paymentStatus || c.paymentStatus === 'Received'
    ).length;
    const pendingContributorsCount = collections.filter(
      (c) => c.paymentStatus === 'Pending'
    ).length;

    // Category breakdown (considering Received status or default)
    const workingCollections = collections.filter((c) => c.category === 'working');
    const workingCount = workingCollections.length;
    const workingCollection = workingCollections
      .filter((c) => !c.paymentStatus || c.paymentStatus === 'Received')
      .reduce((sum, c) => sum + Number(c.actualAmount || 0), 0);

    const studentCollections = collections.filter((c) => c.category === 'student');
    const studentCount = studentCollections.length;
    const studentCollection = studentCollections
      .filter((c) => !c.paymentStatus || c.paymentStatus === 'Received')
      .reduce((sum, c) => sum + Number(c.actualAmount || 0), 0);

    const generalPublicCollections = collections.filter((c) => c.category === 'general_public');
    const generalPublicCount = generalPublicCollections.length;
    const generalPublicCollection = generalPublicCollections
      .filter((c) => !c.paymentStatus || c.paymentStatus === 'Received')
      .reduce((sum, c) => sum + Number(c.actualAmount || 0), 0);

    // Direct Collection is the sum of all direct donor collections
    const directCollection = workingCollection + studentCollection + generalPublicCollection;

    // 2. Expenses for selected year
    const expenses = await Expense.find({ year: yearParam });
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // 3. Split / Recovery calculations for selected year
    const splits = await Split.find({ year: yearParam });
    const splitIds = splits.map((s) => s._id);
    const recoveries = await Recovery.find({ splitId: { $in: splitIds } });

    const totalSplitGiven = splits.reduce((sum, s) => sum + Number(s.amountGiven || 0), 0);
    const totalRecovered = recoveries.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const yetToRecover = Math.max(0, totalSplitGiven - totalRecovered);

    // 4. Combined Total Collection & Event Balance
    // Total Collection = Direct Collections + Split Recoveries (e.g. 9000 + 8000 = 17000)
    const totalCollection = directCollection + totalRecovered;
    const eventBalance = totalCollection - totalExpenses;

    // 5. Recent Activity (Latest 5 items combined)
    const recentCollections = collections.slice(0, 5).map((c) => ({
      id: c._id,
      title: c.name,
      subtitle: `Collection (${c.category.replace('_', ' ')})`,
      amount: Number(c.actualAmount || 0),
      type: 'collection',
      date: c.date,
    }));

    const recentExpenses = expenses.slice(0, 5).map((e) => ({
      id: e._id,
      title: e.expenseName,
      subtitle: `Expense (${e.category})`,
      amount: Number(e.amount || 0),
      type: 'expense',
      date: e.date,
    }));

    const recentRecoveries = recoveries.slice(0, 5).map((r) => ({
      id: r._id,
      title: `Recovery Settlement`,
      subtitle: r.notes ? `Recovery · ${r.notes}` : 'Split Recovery',
      amount: Number(r.amount || 0),
      type: 'collection',
      date: r.date,
    }));

    const recentActivity = [...recentCollections, ...recentExpenses, ...recentRecoveries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      success: true,
      year: yearParam,
      settings: yearSetting,
      data: {
        totalCollection,
        directCollection,
        totalExpenses,
        eventBalance,
        totalContributors,
        paidContributorsCount,
        pendingContributorsCount,
        workingCount,
        workingCollection,
        studentCount,
        studentCollection,
        generalPublicCount,
        generalPublicCollection,
        totalSplitGiven,
        totalRecovered,
        yetToRecover,
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
