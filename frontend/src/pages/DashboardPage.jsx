import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../context/YearContext';
import { getDashboardApi } from '../services/api';
import { formatCurrency, formatCompactCurrency, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

const StatCard = ({ label, value, subValue, icon, colorClass = 'text-primary', bgClass = 'bg-surface-container-low', trendLabel }) => (
  <div className="rounded-2xl border border-outline-variant p-5 flex flex-col justify-between gap-3 bento-hover glass-card relative overflow-hidden">
    <div className="flex items-center justify-between">
      <span className="font-label-md text-label-md text-on-surface-variant font-medium">{label}</span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
        <span className={`material-symbols-outlined text-xl ${colorClass}`}>{icon}</span>
      </div>
    </div>
    <div>
      <div className={`font-headline-lg text-headline-lg font-bold tracking-tight ${colorClass}`}>{value}</div>
      {subValue && <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{subValue}</div>}
    </div>
    {trendLabel && (
      <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant border-t border-outline-variant/40 pt-2">
        <span>{trendLabel}</span>
      </div>
    )}
  </div>
);

const ActivityItem = ({ item }) => {
  const isCollection = item.type === 'collection';
  return (
    <div className="flex items-center gap-3 py-3 border-b border-outline-variant/40 last:border-0">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isCollection ? 'bg-tertiary-container/40 text-tertiary' : 'bg-secondary-container/30 text-secondary'
      }`}>
        <span className="material-symbols-outlined text-base">{isCollection ? 'payments' : 'receipt_long'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-label-md text-label-md text-on-background font-medium truncate">{item.title}</div>
        <div className="font-label-sm text-[11px] text-on-surface-variant truncate">{item.subtitle} · {formatDate(item.date)}</div>
      </div>
      <div className={`font-label-md text-label-md font-bold flex-shrink-0 ${isCollection ? 'text-tertiary' : 'text-error'}`}>
        {isCollection ? '+' : '-'}{formatCurrency(item.amount)}
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { selectedYear } = useYear();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDashboardApi(selectedYear);
      if (res.success) setMetrics(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner label="Loading dashboard metrics..." />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-error-container/30 border border-error/30 rounded-2xl text-on-error-container text-center">
      <span className="material-symbols-outlined text-3xl mb-2 block">cloud_off</span>
      <p className="font-body-md">{error}</p>
      <button onClick={loadDashboard} className="mt-3 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md">Retry</button>
    </div>
  );

  const m = metrics || {};
  const balancePositive = (m.eventBalance || 0) >= 0;

  const categoryChartData = [
    { name: 'Working', value: m.workingCollection || 0, fill: '#9e3d00', count: m.workingCount || 0 },
    { name: 'Student', value: m.studentCollection || 0, fill: '#735c00', count: m.studentCount || 0 },
    { name: 'General', value: m.generalPublicCollection || 0, fill: '#006a35', count: m.generalPublicCount || 0 },
    { name: 'Recoveries', value: m.totalRecovered || 0, fill: '#008645', count: 'Split' },
  ];

  const balanceChartData = [
    { name: 'Total Collection', value: m.totalCollection || 0, fill: '#006a35' },
    { name: 'Expenses', value: m.totalExpenses || 0, fill: '#ba1a1a' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-outline-variant rounded-xl p-3 shadow-lg text-sm">
          <p className="font-bold text-on-background">{label || payload[0].name}</p>
          <p className="text-primary">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold">
            Dashboard
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Vinayagar Chathurthi {selectedYear} · Financial Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadDashboard} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md transition-colors">
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Primary KPI Row - 5 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Collection (Direct + Recoveries) */}
        <StatCard
          label="Total Collection"
          value={formatCurrency(m.totalCollection)}
          subValue="Direct Collections + Recoveries"
          icon="account_balance_wallet"
          colorClass="text-tertiary font-bold"
          bgClass="bg-tertiary-container/30"
        />

        {/* 2. Collections Amount (Direct Donor Collections) */}
        <StatCard
          label="Collections Amount"
          value={formatCurrency(m.directCollection)}
          subValue={`${m.paidContributorsCount || 0} Paid Contributors`}
          icon="payments"
          colorClass="text-primary font-bold"
          bgClass="bg-primary-container/20"
          trendLabel={`${m.totalContributors || 0} Total Enrolled`}
        />

        {/* 3. Total Expenses */}
        <StatCard
          label="Total Expenses"
          value={formatCurrency(m.totalExpenses)}
          subValue="All categories combined"
          icon="receipt_long"
          colorClass="text-error"
          bgClass="bg-error-container/20"
        />

        {/* 4. Event Balance */}
        <StatCard
          label="Event Balance"
          value={formatCurrency(m.eventBalance)}
          subValue="Total Collection minus expenses"
          icon={balancePositive ? 'trending_up' : 'trending_down'}
          colorClass={balancePositive ? 'text-tertiary' : 'text-error'}
          bgClass={balancePositive ? 'bg-tertiary-container/20' : 'bg-error-container/20'}
        />

        {/* 5. Split Recoveries */}
        <StatCard
          label="Split Recoveries"
          value={formatCurrency(m.totalRecovered)}
          subValue={`Yet to recover: ${formatCurrency(m.yetToRecover || 0)}`}
          icon="download_done"
          colorClass="text-[#008645]"
          bgClass="bg-[#008645]/10"
          trendLabel={`Given: ${formatCurrency(m.totalSplitGiven || 0)}`}
        />
      </div>

      {/* Category Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-4 bento-hover glass-card">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">work</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Working People</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile text-primary font-bold">{formatCurrency(m.workingCollection)}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{m.workingCount || 0} contributors enrolled</div>
          <div className="mt-3 bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${m.totalCollection > 0 ? ((m.workingCollection / m.totalCollection) * 100).toFixed(0) : 0}%` }} />
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">{m.totalCollection > 0 ? ((m.workingCollection / m.totalCollection) * 100).toFixed(1) : 0}% of total</div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-4 bento-hover glass-card">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-secondary text-xl">school</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">School / College</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile text-secondary font-bold">{formatCurrency(m.studentCollection)}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{m.studentCount || 0} students enrolled</div>
          <div className="mt-3 bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-secondary h-full rounded-full transition-all" style={{ width: `${m.totalCollection > 0 ? ((m.studentCollection / m.totalCollection) * 100).toFixed(0) : 0}%` }} />
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">{m.totalCollection > 0 ? ((m.studentCollection / m.totalCollection) * 100).toFixed(1) : 0}% of total</div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-4 bento-hover glass-card">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-tertiary text-xl">people</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">General Public</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile text-tertiary font-bold">{formatCurrency(m.generalPublicCollection)}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{m.generalPublicCount || 0} voluntary contributors</div>
          <div className="mt-3 bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-tertiary h-full rounded-full transition-all" style={{ width: `${m.totalCollection > 0 ? ((m.generalPublicCollection / m.totalCollection) * 100).toFixed(0) : 0}%` }} />
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">{m.totalCollection > 0 ? ((m.generalPublicCollection / m.totalCollection) * 100).toFixed(1) : 0}% of total</div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-4 bento-hover glass-card">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#008645] text-xl">download_done</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Split Recoveries</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile text-[#008645] font-bold">{formatCurrency(m.totalRecovered)}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">From advance settlements</div>
          <div className="mt-3 bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#008645] h-full rounded-full transition-all" style={{ width: `${m.totalCollection > 0 ? ((m.totalRecovered / m.totalCollection) * 100).toFixed(0) : 0}%` }} />
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">{m.totalCollection > 0 ? ((m.totalRecovered / m.totalCollection) * 100).toFixed(1) : 0}% of total</div>
        </div>
      </div>

      {/* Charts + Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bar Chart - Collection vs Expenses */}
        <div className="md:col-span-2 bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">bar_chart</span>
            Collection vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={balanceChartData} barSize={56}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0c0b2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#594238' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#594238' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {balanceChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Category Breakdown */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">pie_chart</span>
            By Source
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                {categoryChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{item.name} ({item.count})</span>
                </div>
                <span className="font-label-sm text-label-sm font-bold text-on-background">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + Pending Contributors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">history</span>
            Recent Activity
          </h2>
          {(m.recentActivity || []).length === 0 ? (
            <p className="font-body-md text-on-surface-variant text-center py-8">No activity recorded yet</p>
          ) : (
            <div>
              {(m.recentActivity || []).map((item) => (
                <ActivityItem key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">pending_actions</span>
            Payment Status
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-label-md text-label-md text-on-background mb-1">
                <span>Paid Contributors</span>
                <span className="text-tertiary font-bold">{m.paidContributorsCount || 0} / {m.totalContributors || 0}</span>
              </div>
              <div className="bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                <div className="bg-tertiary h-full rounded-full transition-all"
                  style={{ width: `${m.totalContributors > 0 ? ((m.paidContributorsCount / m.totalContributors) * 100).toFixed(0) : 0}%` }} />
              </div>
              <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">
                {m.totalContributors > 0 ? ((m.paidContributorsCount / m.totalContributors) * 100).toFixed(1) : 0}% collection rate
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline-variant/40">
              <div className="bg-surface-container rounded-xl p-3 text-center">
                <div className="font-headline-lg text-headline-lg-mobile text-tertiary font-bold">{m.paidContributorsCount || 0}</div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Paid</div>
              </div>
              <div className="bg-error-container/20 rounded-xl p-3 text-center">
                <div className="font-headline-lg text-headline-lg-mobile text-error font-bold">{m.pendingContributorsCount || 0}</div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Pending</div>
              </div>
            </div>

            {m.yetToRecover > 0 && (
              <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">warning</span>
                <div>
                  <div className="font-label-md text-label-md text-primary font-bold">{formatCurrency(m.yetToRecover)} Yet to Recover</div>
                  <div className="font-label-sm text-[11px] text-on-surface-variant">Advance amounts pending settlement</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
