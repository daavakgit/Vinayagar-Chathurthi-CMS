import Collection from '../models/Collection.js';
import Expense from '../models/Expense.js';
import Split from '../models/Split.js';
import Recovery from '../models/Recovery.js';
import Settings from '../models/Settings.js';
import { enrichSplitsWithRecovery } from './splitController.js';

// GET /api/reports
export const getReportData = async (req, res) => {
  try {
    const yearParam = req.query.year ? Number(req.query.year) : 2026;
    const { startDate, endDate } = req.query;

    const collectionFilter = { year: yearParam };
    const expenseFilter = { year: yearParam };
    const splitFilter = { year: yearParam };

    if (startDate || endDate) {
      const dateSubFilter = {};
      if (startDate) dateSubFilter.$gte = new Date(startDate);
      if (endDate) dateSubFilter.$lte = new Date(endDate);

      collectionFilter.date = dateSubFilter;
      expenseFilter.date = dateSubFilter;
      splitFilter.dateGiven = dateSubFilter;
    }

    const yearSetting = await Settings.findOne({ year: yearParam });

    // Fetch all filtered records
    const collections = await Collection.find(collectionFilter);
    const expenses = await Expense.find(expenseFilter);
    const rawSplits = await Split.find(splitFilter);
    const enrichedSplits = await enrichSplitsWithRecovery(rawSplits);

    // 1. COLLECTION SUMMARY
    const totalContributors = collections.length;
    const workingCollections = collections.filter((c) => c.category === 'working');
    const studentCollections = collections.filter((c) => c.category === 'student');
    const generalPublicCollections = collections.filter((c) => c.category === 'general_public');

    const workingReceived = workingCollections
      .filter((c) => !c.paymentStatus || c.paymentStatus === 'Received')
      .reduce((sum, c) => sum + Number(c.actualAmount || 0), 0);

    const studentReceived = studentCollections
      .filter((c) => !c.paymentStatus || c.paymentStatus === 'Received')
      .reduce((sum, c) => sum + Number(c.actualAmount || 0), 0);

    const generalPublicReceived = generalPublicCollections
      .filter((c) => !c.paymentStatus || c.paymentStatus === 'Received')
      .reduce((sum, c) => sum + Number(c.actualAmount || 0), 0);

    const directActualReceived = workingReceived + studentReceived + generalPublicReceived;
    const totalExpectedAmount = collections.reduce((sum, c) => sum + Number(c.expectedAmount || 0), 0);
    const pendingCollections = collections.filter((c) => c.paymentStatus === 'Pending');
    const totalPendingAmount = pendingCollections.reduce((sum, c) => sum + Number(c.actualAmount || 0), 0);
    const difference = totalExpectedAmount - directActualReceived;

    // SPLIT / RECOVERY SUMMARY
    const totalSplitGiven = enrichedSplits.reduce((sum, s) => sum + Number(s.amountGiven || 0), 0);
    const totalRecovered = enrichedSplits.reduce((sum, s) => sum + Number(s.totalRecovered || 0), 0);
    const yetToRecover = Math.max(0, totalSplitGiven - totalRecovered);

    // Combined Total Collection includes Direct Collections + Total Recovered
    const totalActualReceived = directActualReceived + totalRecovered;

    const collectionSummary = {
      totalContributors,
      workingCount: workingCollections.length,
      workingReceived,
      studentCount: studentCollections.length,
      studentReceived,
      generalPublicCount: generalPublicCollections.length,
      generalPublicReceived,
      expectedAmount: totalExpectedAmount,
      directAmount: directActualReceived,
      recoveredAmount: totalRecovered,
      actualAmount: totalActualReceived,
      difference,
      receivedAmount: totalActualReceived,
      pendingAmount: totalPendingAmount,
    };

    // 2. EXPENSE SUMMARY
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const numberOfExpenses = expenses.length;
    const highestExpense = expenses.length > 0 ? Math.max(...expenses.map((e) => Number(e.amount || 0))) : 0;

    // Group expenses by category
    const expenseCategoryMap = {};
    expenses.forEach((e) => {
      expenseCategoryMap[e.category] = (expenseCategoryMap[e.category] || 0) + Number(e.amount || 0);
    });

    const expenseCategoryTotals = Object.keys(expenseCategoryMap).map((cat) => ({
      category: cat,
      amount: expenseCategoryMap[cat],
      percentage: totalExpenses > 0 ? Math.round((expenseCategoryMap[cat] / totalExpenses) * 100) : 0,
    }));

    const expenseSummary = {
      totalExpenses,
      numberOfExpenses,
      highestExpense,
      categoryTotals: expenseCategoryTotals,
    };

    // 3. SPLIT SUMMARY
    const completedCount = enrichedSplits.filter((s) => s.status === 'Completed').length;
    const partialCount = enrichedSplits.filter((s) => s.status === 'Partial').length;
    const pendingCount = enrichedSplits.filter((s) => s.status === 'Pending').length;

    const splitSummary = {
      totalGiven: totalSplitGiven,
      totalRecovered,
      yetToRecover,
      completedCount,
      partialCount,
      pendingCount,
    };

    // 4. FINANCIAL SUMMARY
    const netBalance = totalActualReceived - totalExpenses;
    const marginPercentage = totalActualReceived > 0
      ? Math.round((netBalance / totalActualReceived) * 100)
      : 0;

    const financialSummary = {
      totalCollection: totalActualReceived,
      directCollection: directActualReceived,
      totalRecovered,
      totalExpenses,
      netBalance,
      marginPercentage,
    };

    // 5. CHART DATA
    const chartCollectionVsExpenses = [
      { name: 'Collections', amount: totalActualReceived, fill: '#006a35' },
      { name: 'Expenses', amount: totalExpenses, fill: '#ba1a1a' },
      { name: 'Net Balance', amount: Math.max(0, netBalance), fill: '#9e3d00' },
    ];

    const chartCollectionByCategory = [
      { name: 'Working People', amount: collectionSummary.workingReceived, fill: '#9e3d00' },
      { name: 'School/College', amount: collectionSummary.studentReceived, fill: '#735c00' },
      { name: 'General Public', amount: collectionSummary.generalPublicReceived, fill: '#006a35' },
      { name: 'Split Recoveries', amount: totalRecovered, fill: '#008645' },
    ];

    const chartExpectedVsActual = [
      {
        category: 'Working',
        Expected: collectionSummary.workingCount * (yearSetting ? yearSetting.workingDefaultAmount : 2000),
        Actual: collectionSummary.workingReceived,
      },
      {
        category: 'Student',
        Expected: collectionSummary.studentCount * (yearSetting ? yearSetting.studentDefaultAmount : 500),
        Actual: collectionSummary.studentReceived,
      },
    ];

    const chartExpensesByCategory = expenseCategoryTotals.map((item, idx) => {
      const colors = ['#9e3d00', '#735c00', '#006a35', '#203243', '#ba1a1a', '#c64f00', '#008645'];
      return {
        name: item.category,
        value: item.amount,
        percentage: item.percentage,
        fill: colors[idx % colors.length],
      };
    });

    const chartSplitVsRecovered = [
      { name: 'Total Given', amount: totalSplitGiven, fill: '#9e3d00' },
      { name: 'Total Recovered', amount: totalRecovered, fill: '#006a35' },
      { name: 'Yet to Recover', amount: yetToRecover, fill: '#ba1a1a' },
    ];

    const dateMap = {};
    collections
      .filter((c) => !c.paymentStatus || c.paymentStatus === 'Received')
      .forEach((c) => {
        const dStr = new Date(c.date).toISOString().slice(0, 10);
        dateMap[dStr] = (dateMap[dStr] || 0) + Number(c.actualAmount || 0);
      });

    const chartCollectionByDate = Object.keys(dateMap)
      .sort()
      .map((dStr) => ({
        date: dStr,
        amount: dateMap[dStr],
      }));

    res.json({
      success: true,
      year: yearParam,
      eventName: yearSetting ? yearSetting.eventName : 'Vinayagar Chathurthi',
      data: {
        collectionSummary,
        expenseSummary,
        splitSummary,
        financialSummary,
        charts: {
          collectionVsExpenses: chartCollectionVsExpenses,
          collectionByCategory: chartCollectionByCategory,
          expectedVsActual: chartExpectedVsActual,
          expensesByCategory: chartExpensesByCategory,
          splitVsRecovered: chartSplitVsRecovered,
          collectionByDate: chartCollectionByDate,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
