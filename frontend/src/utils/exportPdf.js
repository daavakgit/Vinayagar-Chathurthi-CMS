import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatPdfCurrency, formatDate, getCategoryLabel } from './formatters.js';

export const exportReportToPDF = ({
  eventName = 'Vinayagar Chathurthi',
  year = 2026,
  reportData,
  collections = [],
  expenses = [],
  splits = [],
}) => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(158, 61, 0); // Primary Terracotta color
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${eventName} - ${year}`, 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Financial Report • Generated on ${new Date().toLocaleDateString('en-IN')}`, 14, 22);

  let currentY = 36;

  // Executive Summary Box
  if (reportData && reportData.financialSummary) {
    const { totalCollection, totalExpenses, netBalance } = reportData.financialSummary;
    doc.setDrawColor(224, 192, 178);
    doc.setFillColor(247, 249, 255);
    doc.roundedRect(14, currentY, 182, 24, 3, 3, 'FD');

    doc.setTextColor(9, 29, 46);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL COLLECTION', 20, currentY + 10);
    doc.text('TOTAL EXPENSES', 80, currentY + 10);
    doc.text('NET BALANCE', 140, currentY + 10);

    doc.setFontSize(13);
    doc.setTextColor(0, 106, 53); // Green for collection
    doc.text(formatPdfCurrency(totalCollection), 20, currentY + 18);
    doc.setTextColor(186, 26, 26); // Red for expenses
    doc.text(formatPdfCurrency(totalExpenses), 80, currentY + 18);
    doc.setTextColor(158, 61, 0); // Primary for balance
    doc.text(formatPdfCurrency(netBalance), 140, currentY + 18);

    currentY += 32;
  }

  // Collections Table
  if (collections.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(9, 29, 46);
    doc.text('Collection Details', 14, currentY);
    currentY += 4;

    const collectionRows = collections.map((c, i) => [
      i + 1,
      c.name,
      c.phone || '-',
      getCategoryLabel(c.category),
      c.expectedAmount ? formatPdfCurrency(c.expectedAmount) : '-',
      formatPdfCurrency(c.actualAmount),
      c.paymentStatus,
      formatDate(c.date),
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['S.No', 'Name', 'Phone', 'Category', 'Expected', 'Actual Received', 'Status', 'Date']],
      body: collectionRows,
      theme: 'grid',
      headStyles: { fillColor: [158, 61, 0], textColor: 255 },
      styles: { fontSize: 8 },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Expenses Table
  if (expenses.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(9, 29, 46);
    doc.text('Expense Details', 14, currentY);
    currentY += 4;

    const expenseRows = expenses.map((e, i) => [
      i + 1,
      e.expenseName,
      e.category,
      formatPdfCurrency(e.amount),
      formatDate(e.date),
      e.description || '-',
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['S.No', 'Expense Name', 'Category', 'Amount', 'Date', 'Description']],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [115, 92, 0], textColor: 255 },
      styles: { fontSize: 8 },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Split / Advance Table
  if (splits.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(9, 29, 46);
    doc.text('Split & Advance Recovery Details', 14, currentY);
    currentY += 4;

    const splitRows = splits.map((s, i) => [
      i + 1,
      s.personName,
      formatPdfCurrency(s.amountGiven),
      formatPdfCurrency(s.totalRecovered || 0),
      formatPdfCurrency(s.remaining || 0),
      s.status || 'Pending',
      s.purpose,
      formatDate(s.dateGiven),
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['S.No', 'Person Name', 'Given', 'Recovered', 'Remaining', 'Status', 'Purpose', 'Date']],
      body: splitRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 106, 53], textColor: 255 },
      styles: { fontSize: 8 },
    });
  }

  doc.save(`VCMS_${eventName.replace(/\s+/g, '_')}_${year}_Report.pdf`);
};
