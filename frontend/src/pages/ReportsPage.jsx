import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../context/YearContext';
import { getReportsApi, getCollectionsApi, getExpensesApi, getSplitsApi } from '../services/api';
import { formatCurrency, formatDate, getCategoryLabel } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Toast } from '../components/Toast';
import { exportReportToPDF } from '../utils/exportPdf';
import { exportReportToExcel } from '../utils/exportExcel';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const PIE_COLORS = ['#9e3d00', '#735c00', '#006a35', '#203243', '#ba1a1a', '#c64f00'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-outline-variant rounded-xl p-3 shadow-lg text-sm">
        <p className="font-bold text-on-background mb-1">{label || payload[0].name}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.fill || '#9e3d00' }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

export const ReportsPage = () => {
  const { selectedYear } = useYear();
  const [reportData, setReportData] = useState(null);
  const [rawCollections, setRawCollections] = useState([]);
  const [rawExpenses, setRawExpenses] = useState([]);
  const [rawSplits, setRawSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [toast, setToast] = useState({ message: '' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = { year: selectedYear };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [reportRes, colRes, expRes, splitRes] = await Promise.all([
        getReportsApi(params),
        getCollectionsApi({ year: selectedYear }),
        getExpensesApi({ year: selectedYear }),
        getSplitsApi({ year: selectedYear }),
      ]);

      if (reportRes.success) setReportData(reportRes);
      if (colRes.success) setRawCollections(colRes.data || []);
      if (expRes.success) setRawExpenses(expRes.data || []);
      if (splitRes.success) setRawSplits(splitRes.data || []);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, startDate, endDate]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      exportReportToPDF({
        eventName: reportData?.eventName || 'Vinayagar Chathurthi',
        year: selectedYear,
        reportData: reportData?.data,
        collections: rawCollections,
        expenses: rawExpenses,
        splits: rawSplits,
      });
      setToast({ message: 'PDF exported successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'PDF export failed: ' + err.message, type: 'error' });
    } finally {
      setExporting('');
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      exportReportToExcel({
        eventName: reportData?.eventName || 'Vinayagar Chathurthi',
        year: selectedYear,
        collections: rawCollections,
        expenses: rawExpenses,
        splits: rawSplits,
      });
      setToast({ message: 'Excel exported successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Excel export failed: ' + err.message, type: 'error' });
    } finally {
      setExporting('');
    }
  };

  if (loading) return <LoadingSpinner label="Generating financial reports..." />;

  const d = reportData?.data;
  const charts = d?.charts || {};
  const fs = d?.financialSummary || {};
  const cs = d?.collectionSummary || {};
  const es = d?.expenseSummary || {};
  const ss = d?.splitSummary || {};
  const balancePositive = (fs.netBalance || 0) >= 0;

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold">Reports</h1>
          <p className="font-body-md text-on-surface-variant">{reportData?.eventName} {selectedYear} · Financial Analysis</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-2 items-center">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="border border-outline-variant rounded-lg px-3 py-1.5 font-label-sm text-label-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface" />
            <span className="text-on-surface-variant">—</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="border border-outline-variant rounded-lg px-3 py-1.5 font-label-sm text-label-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface" />
          </div>
          <button onClick={handleExportPDF} disabled={exporting === 'pdf'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50">
            {exporting === 'pdf' ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-base">picture_as_pdf</span>}
            Export PDF
          </button>
          <button onClick={handleExportExcel} disabled={exporting === 'excel'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-tertiary text-on-tertiary font-label-md font-bold hover:bg-tertiary-container transition-all active:scale-95 disabled:opacity-50">
            {exporting === 'excel' ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-base">table_view</span>}
            Export Excel
          </button>
        </div>
      </div>

      {/* Financial Summary Hero */}
      <div className={`rounded-2xl p-5 border ${balancePositive ? 'bg-tertiary-container/10 border-tertiary/30' : 'bg-error-container/10 border-error/30'}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className={`material-symbols-outlined text-xl ${balancePositive ? 'text-tertiary' : 'text-error'}`}>account_balance</span>
          <span className="font-title-md text-title-md text-on-background font-bold">Financial Summary — {selectedYear}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Collection', value: fs.totalCollection, color: 'text-tertiary' },
            { label: 'Total Expenses', value: fs.totalExpenses, color: 'text-error' },
            { label: 'Net Balance', value: fs.netBalance, color: balancePositive ? 'text-tertiary' : 'text-error' },
            { label: 'Margin %', value: `${fs.marginPercentage || 0}%`, color: 'text-primary', raw: true },
          ].map((item) => (
            <div key={item.label} className="text-center bg-surface/60 rounded-xl p-3 border border-outline-variant/40">
              <div className={`font-headline-lg text-headline-lg-mobile font-bold ${item.color}`}>
                {item.raw ? item.value : formatCurrency(item.value)}
              </div>
              <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Collection vs Expenses Bar */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">bar_chart</span>
            Collection vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.collectionVsExpenses || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0c0b2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {(charts.collectionVsExpenses || []).map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Collection by Category Pie */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">donut_large</span>
            Collections by Category
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={charts.collectionByCategory || []} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="amount" paddingAngle={3}>
                {(charts.collectionByCategory || []).map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend formatter={(v) => v} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Expected vs Actual */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">compare_arrows</span>
            Expected vs Actual Collection
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.expectedVsActual || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0c0b2" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Expected" fill="#e0c0b2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#9e3d00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-xl">receipt</span>
            Expenses by Category
          </h2>
          {(charts.expensesByCategory || []).length === 0 ? (
            <div className="text-center text-on-surface-variant py-12 font-body-md">No expense data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={charts.expensesByCategory || []} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {(charts.expensesByCategory || []).map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Split vs Recovered Bar */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">handshake</span>
            Split & Recovery Overview
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Total Given', value: ss.totalGiven, color: 'text-primary' },
              { label: 'Recovered', value: ss.totalRecovered, color: 'text-tertiary' },
              { label: 'Pending', value: ss.yetToRecover, color: 'text-error' },
            ].map((item) => (
              <div key={item.label} className="text-center bg-surface-container rounded-xl p-3">
                <div className={`font-label-md text-label-md font-bold ${item.color}`}>{formatCurrency(item.value)}</div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={charts.splitVsRecovered || []} barSize={44}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0c0b2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {(charts.splitVsRecovered || []).map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Timeline Line Chart */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">show_chart</span>
            Collection Timeline
          </h2>
          {(charts.collectionByDate || []).length === 0 ? (
            <div className="text-center text-on-surface-variant py-12 font-body-md">No timeline data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts.collectionByDate || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0c0b2" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#9e3d00" strokeWidth={2.5} dot={{ fill: '#9e3d00', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Collection Summary */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">payments</span>
            Collection Summary
          </h2>
          <div className="space-y-3">
            {[
              { label: `Working People (${cs.workingCount})`, value: cs.workingReceived, color: 'text-primary' },
              { label: `School/College (${cs.studentCount})`, value: cs.studentReceived, color: 'text-secondary' },
              { label: `General Public (${cs.generalPublicCount})`, value: cs.generalPublicReceived, color: 'text-tertiary' },
              { label: 'Total Received', value: cs.actualAmount, color: 'text-tertiary', bold: true },
              { label: 'Pending Amount', value: cs.pendingAmount, color: 'text-error' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-outline-variant/40 last:border-0">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{item.label}</span>
                <span className={`font-label-md text-label-md font-bold ${item.color}`}>{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Summary */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-xl">receipt_long</span>
            Expense Summary
          </h2>
          <div className="space-y-3 mb-3">
            {[
              { label: 'Total Expenses', value: es.totalExpenses, color: 'text-error' },
              { label: 'Number of Entries', value: es.numberOfExpenses, color: 'text-on-background', raw: true },
              { label: 'Highest Expense', value: es.highestExpense, color: 'text-primary' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-outline-variant/40">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{item.label}</span>
                <span className={`font-label-md text-label-md font-bold ${item.color}`}>{item.raw ? item.value : formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {(es.categoryTotals || []).map((ct, i) => (
              <div key={ct.category} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="font-label-sm text-[11px] text-on-surface-variant">{ct.category}</span>
                </div>
                <span className="font-label-sm text-[11px] text-on-background font-bold">{formatCurrency(ct.amount)} ({ct.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Split Summary */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">handshake</span>
            Split Summary
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Total Given', value: ss.totalGiven, color: 'text-primary' },
              { label: 'Total Recovered', value: ss.totalRecovered, color: 'text-tertiary' },
              { label: 'Yet to Recover', value: ss.yetToRecover, color: 'text-error' },
              { label: 'Completed Splits', value: ss.completedCount, color: 'text-tertiary', raw: true },
              { label: 'Partial Splits', value: ss.partialCount, color: 'text-secondary', raw: true },
              { label: 'Pending Splits', value: ss.pendingCount, color: 'text-error', raw: true },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-outline-variant/40 last:border-0">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{item.label}</span>
                <span className={`font-label-md text-label-md font-bold ${item.color}`}>{item.raw ? (item.value || 0) : formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
