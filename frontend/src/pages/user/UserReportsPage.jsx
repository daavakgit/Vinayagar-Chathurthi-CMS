import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../../context/YearContext';
import { getDashboardApi, getReportsApi } from '../../services/api';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

export const UserReportsPage = () => {
  const { selectedYear } = useYear();
  const [metrics, setMetrics] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReportMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, reportRes] = await Promise.all([
        getDashboardApi(selectedYear),
        getReportsApi({ year: selectedYear }),
      ]);
      if (dashRes?.success) setMetrics(dashRes.data);
      if (reportRes?.success) setReportData(reportRes.data);
    } catch (err) {
      console.error('Error loading User Reports metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => { loadReportMetrics(); }, [loadReportMetrics]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner label="Loading festival financial charts..." />
    </div>
  );

  const m = metrics || {};
  const r = reportData || {};

  const balanceChartData = [
    { name: 'Total Collection', value: m.totalCollection || 0, fill: '#006a35' },
    { name: 'Total Expenses', value: m.totalExpenses || 0, fill: '#ba1a1a' },
  ];

  const categoryChartData = [
    { name: 'Working', value: m.workingCollection || 0, fill: '#9e3d00' },
    { name: 'School/College', value: m.studentCollection || 0, fill: '#735c00' },
    { name: 'General Public', value: m.generalPublicCollection || 0, fill: '#006a35' },
    { name: 'Recoveries', value: m.totalRecovered || 0, fill: '#008645' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-background">
          Financial Analytics & Reports
        </h1>
        <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
          Vinayagar Chathurthi {selectedYear} · Visual Financial Summaries (View Only)
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Collection Inflow</div>
          <div className="font-headline-md text-2xl font-bold text-tertiary">{formatCurrency(m.totalCollection)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Direct + Split Recoveries</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Event Outflow</div>
          <div className="font-headline-md text-2xl font-bold text-error">{formatCurrency(m.totalExpenses)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">All categories combined</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Net Event Surplus / Balance</div>
          <div className="font-headline-md text-2xl font-bold text-primary">{formatCurrency(m.eventBalance)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Remaining festival funds</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Collection vs Expense Bar Chart */}
        <div className="md:col-span-2 bg-surface border border-outline-variant rounded-2xl p-5 glass-card space-y-4">
          <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            Inflow vs Outflow Comparison
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={balanceChartData} barSize={56}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0c0b2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#594238' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#594238' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {balanceChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Contribution Distribution Pie Chart */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card space-y-4">
          <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">pie_chart</span>
            Source Distribution
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                {categoryChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 pt-2 text-xs">
            {categoryChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
                  <span className="text-on-surface-variant">{item.name}</span>
                </div>
                <span className="font-bold text-on-background">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
