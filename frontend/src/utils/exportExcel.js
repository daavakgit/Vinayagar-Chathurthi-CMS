import * as XLSX from 'xlsx';
import { formatDate, getCategoryLabel } from './formatters.js';

export const exportReportToExcel = ({
  eventName = 'Vinayagar Chathurthi',
  year = 2026,
  collections = [],
  expenses = [],
  splits = [],
}) => {
  const wb = XLSX.utils.book_new();

  // 1. Collections Sheet
  if (collections.length > 0) {
    const colData = collections.map((c, i) => ({
      'S.No': i + 1,
      Name: c.name,
      Phone: c.phone || '',
      Category: getCategoryLabel(c.category),
      'Expected Amount (₹)': c.expectedAmount || '',
      'Actual Amount (₹)': c.actualAmount,
      Status: c.paymentStatus,
      Date: formatDate(c.date),
      Notes: c.notes || '',
    }));
    const wsCol = XLSX.utils.json_to_sheet(colData);
    XLSX.utils.book_append_sheet(wb, wsCol, 'Collections');
  }

  // 2. Expenses Sheet
  if (expenses.length > 0) {
    const expData = expenses.map((e, i) => ({
      'S.No': i + 1,
      'Expense Name': e.expenseName,
      Category: e.category,
      'Amount (₹)': e.amount,
      Date: formatDate(e.date),
      Description: e.description || '',
    }));
    const wsExp = XLSX.utils.json_to_sheet(expData);
    XLSX.utils.book_append_sheet(wb, wsExp, 'Expenses');
  }

  // 3. Splits & Recovery Sheet
  if (splits.length > 0) {
    const splitData = splits.map((s, i) => ({
      'S.No': i + 1,
      'Person Name': s.personName,
      'Amount Given (₹)': s.amountGiven,
      'Total Recovered (₹)': s.totalRecovered || 0,
      'Remaining (₹)': s.remaining || 0,
      Status: s.status || 'Pending',
      Purpose: s.purpose,
      Date: formatDate(s.dateGiven),
      Notes: s.notes || '',
    }));
    const wsSplit = XLSX.utils.json_to_sheet(splitData);
    XLSX.utils.book_append_sheet(wb, wsSplit, 'Splits & Advances');
  }

  XLSX.writeFile(wb, `VCMS_${eventName.replace(/\s+/g, '_')}_${year}_Export.xlsx`);
};
