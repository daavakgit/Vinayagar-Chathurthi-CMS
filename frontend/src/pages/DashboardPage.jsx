import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../context/YearContext';
import {
  getDashboardApi, getCollectionsApi, getExpensesApi, getSplitsApi,
} from '../services/api';
import { formatCurrency, formatCompactCurrency, formatDate, getCategoryLabel } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

const StatCard = ({ label, value, subValue, icon, colorClass = 'text-primary', bgClass = 'bg-surface-container-low', trendLabel, onClick, tooltipText }) => (
  <button
    type="button"
    onClick={onClick}
    title={tooltipText || `Click to view ${label} details`}
    className="w-full text-left rounded-2xl border border-outline-variant p-4 md:p-5 flex flex-col justify-between gap-3 bento-hover glass-card relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-primary hover:shadow-lg active:scale-[0.98] group"
  >
    <div className="flex items-center justify-between w-full">
      <span className="font-label-md text-label-md text-on-surface-variant font-semibold group-hover:text-primary transition-colors flex items-center gap-1">
        {label}
        <span className="material-symbols-outlined text-sm text-primary opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">touch_app</span>
      </span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass} group-hover:scale-110 transition-transform`}>
        <span className={`material-symbols-outlined text-xl ${colorClass}`}>{icon}</span>
      </div>
    </div>
    <div>
      <div className={`font-headline-lg text-headline-lg font-bold tracking-tight ${colorClass}`}>{value}</div>
      {subValue && <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{subValue}</div>}
    </div>
    {trendLabel && (
      <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant border-t border-outline-variant/40 pt-2 w-full">
        <span>{trendLabel}</span>
      </div>
    )}
  </button>
);

const ModalWrapper = ({ isOpen, onClose, title, icon, iconColor = 'text-primary', children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-surface border border-outline-variant rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-outline-variant bg-surface-container-low/50 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
              <span className={`material-symbols-outlined text-xl ${iconColor}`}>{icon}</span>
            </div>
            <h2 className="font-title-lg text-title-lg font-bold text-on-background truncate">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { selectedYear } = useYear();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Modal State
  const [activeModal, setActiveModal] = useState(null); // 'total' | 'collections' | 'expenses' | 'splits' | 'working' | 'student'
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

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

  // Open Modal Handler
  const openModal = async (type) => {
    setActiveModal(type);
    setModalLoading(true);
    setModalData([]);
    try {
      if (type === 'collections' || type === 'working' || type === 'student') {
        const categoryParam = type === 'working' ? 'working' : type === 'student' ? 'student' : 'all';
        const res = await getCollectionsApi({ year: selectedYear, category: categoryParam });
        if (res.success) setModalData(res.data || []);
      } else if (type === 'expenses') {
        const res = await getExpensesApi({ year: selectedYear });
        if (res.success) setModalData(res.data || []);
      } else if (type === 'splits' || type === 'total') {
        const [collectionsRes, splitsRes] = await Promise.all([
          getCollectionsApi({ year: selectedYear }),
          getSplitsApi({ year: selectedYear }),
        ]);
        setModalData({
          collections: collectionsRes?.data || [],
          splits: splitsRes?.data || [],
        });
      }
    } catch (err) {
      console.error('Failed to load modal data:', err);
    } finally {
      setModalLoading(false);
    }
  };

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
            Vinayagar Chathurthi {selectedYear} · Financial Overview (Click any card to inspect details)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadDashboard} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md transition-colors">
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Primary KPI Row - 5 Fully Interactive StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Click Total Collection -> Opens Breakdown Modal */}
        <StatCard
          label="Total Collection"
          value={formatCurrency(m.totalCollection)}
          subValue="Direct Collections + Recoveries"
          icon="account_balance_wallet"
          colorClass="text-tertiary font-bold"
          bgClass="bg-tertiary-container/30"
          onClick={() => openModal('total')}
          tooltipText="Click to view full breakdown: Collections Amount + Split Recoveries"
        />

        {/* 2. Click Collections Amount -> Opens Collections Modal */}
        <StatCard
          label="Collections Amount"
          value={formatCurrency(m.directCollection)}
          subValue={`${m.paidContributorsCount || 0} Paid Contributors`}
          icon="payments"
          colorClass="text-primary font-bold"
          bgClass="bg-primary-container/20"
          trendLabel={`${m.totalContributors || 0} Total Enrolled`}
          onClick={() => openModal('collections')}
          tooltipText="Click to view list of all contributors who paid"
        />

        {/* 3. Click Total Expenses -> Opens Expenses Modal */}
        <StatCard
          label="Total Expenses"
          value={formatCurrency(m.totalExpenses)}
          subValue="All categories combined"
          icon="receipt_long"
          colorClass="text-error"
          bgClass="bg-error-container/20"
          onClick={() => openModal('expenses')}
          tooltipText="Click to view all expense item details"
        />

        {/* 4. Click Event Balance */}
        <StatCard
          label="Event Balance"
          value={formatCurrency(m.eventBalance)}
          subValue="Total Collection minus expenses"
          icon={balancePositive ? 'trending_up' : 'trending_down'}
          colorClass={balancePositive ? 'text-tertiary' : 'text-error'}
          bgClass={balancePositive ? 'bg-tertiary-container/20' : 'bg-error-container/20'}
          onClick={() => openModal('total')}
          tooltipText="Click to view event balance summary"
        />

        {/* 5. Click Split Recoveries -> Opens Split Modal */}
        <StatCard
          label="Split Recoveries"
          value={formatCurrency(m.totalRecovered)}
          subValue={`Yet to recover: ${formatCurrency(m.yetToRecover || 0)}`}
          icon="download_done"
          colorClass="text-[#008645]"
          bgClass="bg-[#008645]/10"
          trendLabel={`Given: ${formatCurrency(m.totalSplitGiven || 0)}`}
          onClick={() => openModal('splits')}
          tooltipText="Click to view split advances given, recovered, and pending"
        />
      </div>

      {/* Category Breakdown Row - Interactive Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Working People Card */}
        <button
          type="button"
          onClick={() => openModal('working')}
          className="w-full text-left bg-surface border border-outline-variant rounded-2xl p-4 bento-hover glass-card cursor-pointer hover:border-primary transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">work</span>
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold group-hover:text-primary transition-colors">Working People</span>
            </div>
            <span className="material-symbols-outlined text-sm text-primary">touch_app</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile text-primary font-bold">{formatCurrency(m.workingCollection)}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{m.workingCount || 0} contributors enrolled</div>
          <div className="mt-3 bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${m.totalCollection > 0 ? ((m.workingCollection / m.totalCollection) * 100).toFixed(0) : 0}%` }} />
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">{m.totalCollection > 0 ? ((m.workingCollection / m.totalCollection) * 100).toFixed(1) : 0}% of total</div>
        </button>

        {/* School / College Card */}
        <button
          type="button"
          onClick={() => openModal('student')}
          className="w-full text-left bg-surface border border-outline-variant rounded-2xl p-4 bento-hover glass-card cursor-pointer hover:border-secondary transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">school</span>
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold group-hover:text-secondary transition-colors">School / College</span>
            </div>
            <span className="material-symbols-outlined text-sm text-secondary">touch_app</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile text-secondary font-bold">{formatCurrency(m.studentCollection)}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{m.studentCount || 0} students enrolled</div>
          <div className="mt-3 bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-secondary h-full rounded-full transition-all" style={{ width: `${m.totalCollection > 0 ? ((m.studentCollection / m.totalCollection) * 100).toFixed(0) : 0}%` }} />
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">{m.totalCollection > 0 ? ((m.studentCollection / m.totalCollection) * 100).toFixed(1) : 0}% of total</div>
        </button>

        {/* General Public Card */}
        <button
          type="button"
          onClick={() => openModal('collections')}
          className="w-full text-left bg-surface border border-outline-variant rounded-2xl p-4 bento-hover glass-card cursor-pointer hover:border-tertiary transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-xl">people</span>
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold group-hover:text-tertiary transition-colors">General Public</span>
            </div>
            <span className="material-symbols-outlined text-sm text-tertiary">touch_app</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile text-tertiary font-bold">{formatCurrency(m.generalPublicCollection)}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{m.generalPublicCount || 0} voluntary contributors</div>
          <div className="mt-3 bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-tertiary h-full rounded-full transition-all" style={{ width: `${m.totalCollection > 0 ? ((m.generalPublicCollection / m.totalCollection) * 100).toFixed(0) : 0}%` }} />
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">{m.totalCollection > 0 ? ((m.generalPublicCollection / m.totalCollection) * 100).toFixed(1) : 0}% of total</div>
        </button>

        {/* Split Recoveries Card */}
        <button
          type="button"
          onClick={() => openModal('splits')}
          className="w-full text-left bg-surface border border-outline-variant rounded-2xl p-4 bento-hover glass-card cursor-pointer hover:border-[#008645] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#008645] text-xl">download_done</span>
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold group-hover:text-[#008645] transition-colors">Split Recoveries</span>
            </div>
            <span className="material-symbols-outlined text-sm text-[#008645]">touch_app</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile text-[#008645] font-bold">{formatCurrency(m.totalRecovered)}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">From advance settlements</div>
          <div className="mt-3 bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#008645] h-full rounded-full transition-all" style={{ width: `${m.totalCollection > 0 ? ((m.totalRecovered / m.totalCollection) * 100).toFixed(0) : 0}%` }} />
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">{m.totalCollection > 0 ? ((m.totalRecovered / m.totalCollection) * 100).toFixed(1) : 0}% of total</div>
        </button>
      </div>

      {/* Charts + Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* MODAL 1: TOTAL COLLECTION BREAKDOWN */}
      <ModalWrapper
        isOpen={activeModal === 'total'}
        onClose={() => setActiveModal(null)}
        title="Total Collection Breakdown"
        icon="account_balance_wallet"
        iconColor="text-tertiary"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-primary-container/20 border border-primary/20 rounded-xl p-3.5 text-center">
            <div className="font-label-sm text-on-surface-variant font-medium">Collections Amount</div>
            <div className="font-headline-md text-primary font-bold mt-1">{formatCurrency(m.directCollection)}</div>
          </div>
          <div className="bg-[#008645]/10 border border-[#008645]/30 rounded-xl p-3.5 text-center">
            <div className="font-label-sm text-on-surface-variant font-medium">Split Recoveries</div>
            <div className="font-headline-md text-[#008645] font-bold mt-1">{formatCurrency(m.totalRecovered)}</div>
          </div>
          <div className="bg-tertiary-container/30 border border-tertiary/30 rounded-xl p-3.5 text-center sm:col-span-1 col-span-1">
            <div className="font-label-sm text-on-surface-variant font-semibold">Total Collection</div>
            <div className="font-headline-md text-tertiary font-extrabold mt-1">{formatCurrency(m.totalCollection)}</div>
          </div>
        </div>

        <div className="border-t border-outline-variant pt-4 space-y-3">
          <h3 className="font-title-sm font-bold text-on-background">Inflow Sources Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2.5 rounded-lg bg-surface-container">
              <span>Working People Collections ({m.workingCount || 0})</span>
              <span className="font-bold text-primary">{formatCurrency(m.workingCollection)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-surface-container">
              <span>School / College Collections ({m.studentCount || 0})</span>
              <span className="font-bold text-secondary">{formatCurrency(m.studentCollection)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-surface-container">
              <span>General Public Voluntary ({m.generalPublicCount || 0})</span>
              <span className="font-bold text-tertiary">{formatCurrency(m.generalPublicCollection)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-[#008645]/10 text-on-background">
              <span>Advance Settlements Recovered</span>
              <span className="font-bold text-[#008645]">{formatCurrency(m.totalRecovered)}</span>
            </div>
          </div>
        </div>
      </ModalWrapper>

      {/* MODAL 2: COLLECTIONS AMOUNT (All paid contributors) */}
      <ModalWrapper
        isOpen={activeModal === 'collections'}
        onClose={() => setActiveModal(null)}
        title="Collections Amount — Paid Contributors"
        icon="payments"
        iconColor="text-primary"
      >
        <div className="flex items-center justify-between bg-primary-container/20 p-3.5 rounded-xl border border-primary/20">
          <div>
            <div className="font-label-sm text-on-surface-variant">Total Direct Collection</div>
            <div className="font-headline-sm text-primary font-bold">{formatCurrency(m.directCollection)}</div>
          </div>
          <div className="text-right">
            <div className="font-label-sm text-on-surface-variant">Paid Count</div>
            <div className="font-headline-sm text-tertiary font-bold">{m.paidContributorsCount || 0} / {m.totalContributors || 0}</div>
          </div>
        </div>

        {modalLoading ? (
          <LoadingSpinner label="Loading contributor details..." />
        ) : modalData.length === 0 ? (
          <p className="text-center py-6 text-on-surface-variant font-body-md">No collection records found for {selectedYear}</p>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {modalData.map((c) => (
              <div key={c._id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-label-md font-bold text-on-background">{c.name}</div>
                  <div className="font-label-sm text-xs text-on-surface-variant">{c.phone || 'No Phone'} · {getCategoryLabel(c.category)}</div>
                </div>
                <div className="text-right">
                  <div className="font-label-md font-bold text-tertiary">{formatCurrency(c.actualAmount)}</div>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.paymentStatus === 'Received' ? 'bg-tertiary-container/40 text-tertiary' : 'bg-error-container/30 text-error'}`}>
                    {c.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalWrapper>

      {/* MODAL 3: TOTAL EXPENSES */}
      <ModalWrapper
        isOpen={activeModal === 'expenses'}
        onClose={() => setActiveModal(null)}
        title="Total Expenses Details"
        icon="receipt_long"
        iconColor="text-error"
      >
        <div className="bg-error-container/20 p-3.5 rounded-xl border border-error/30 flex items-center justify-between">
          <div>
            <div className="font-label-sm text-on-surface-variant">Total Event Expenses</div>
            <div className="font-headline-sm text-error font-bold">{formatCurrency(m.totalExpenses)}</div>
          </div>
          <span className="material-symbols-outlined text-error text-3xl">receipt_long</span>
        </div>

        {modalLoading ? (
          <LoadingSpinner label="Loading expense details..." />
        ) : modalData.length === 0 ? (
          <p className="text-center py-6 text-on-surface-variant font-body-md">No expense records found for {selectedYear}</p>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {modalData.map((e) => (
              <div key={e._id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-label-md font-bold text-on-background">{e.expenseName}</div>
                  <div className="font-label-sm text-xs text-on-surface-variant">{e.category} · {formatDate(e.date)}</div>
                  {e.description && <div className="font-body-sm text-xs text-on-surface-variant/80 mt-0.5">{e.description}</div>}
                </div>
                <div className="font-label-md font-bold text-error text-right">{formatCurrency(e.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </ModalWrapper>

      {/* MODAL 4: SPLIT RECOVERIES */}
      <ModalWrapper
        isOpen={activeModal === 'splits'}
        onClose={() => setActiveModal(null)}
        title="Split Advances & Recoveries"
        icon="download_done"
        iconColor="text-[#008645]"
      >
        <div className="grid grid-cols-3 gap-2 text-center bg-surface-container p-3 rounded-xl border border-outline-variant">
          <div>
            <div className="font-label-sm text-[11px] text-on-surface-variant">Given</div>
            <div className="font-title-md font-bold text-primary">{formatCurrency(m.totalSplitGiven)}</div>
          </div>
          <div>
            <div className="font-label-sm text-[11px] text-on-surface-variant">Recovered</div>
            <div className="font-title-md font-bold text-[#008645]">{formatCurrency(m.totalRecovered)}</div>
          </div>
          <div>
            <div className="font-label-sm text-[11px] text-on-surface-variant">Pending</div>
            <div className="font-title-md font-bold text-error">{formatCurrency(m.yetToRecover)}</div>
          </div>
        </div>

        {modalLoading ? (
          <LoadingSpinner label="Loading split settlements..." />
        ) : (modalData.splits || []).length === 0 ? (
          <p className="text-center py-6 text-on-surface-variant font-body-md">No split advance records found for {selectedYear}</p>
        ) : (
          <div className="divide-y divide-outline-variant/60 space-y-2">
            {(modalData.splits || []).map((s) => {
              const pending = Math.max(0, (s.amountGiven || 0) - (s.totalRecovered || 0));
              return (
                <div key={s._id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-label-md font-bold text-on-background">{s.personName}</div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.status === 'Completed' ? 'bg-[#008645]/20 text-[#008645]' : 'bg-error-container/30 text-error'}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="font-label-sm text-xs text-on-surface-variant">{s.purpose || 'No Purpose'} · Phone: {s.phone || '—'}</div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span>Given: <b>{formatCurrency(s.amountGiven)}</b></span>
                    <span>Recovered: <b className="text-[#008645]">{formatCurrency(s.totalRecovered || 0)}</b></span>
                    <span>Pending: <b className="text-error">{formatCurrency(pending)}</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ModalWrapper>

      {/* MODAL 5: WORKING PEOPLE */}
      <ModalWrapper
        isOpen={activeModal === 'working'}
        onClose={() => setActiveModal(null)}
        title="Working People Collections"
        icon="work"
        iconColor="text-primary"
      >
        <div className="bg-primary-container/20 p-3.5 rounded-xl border border-primary/20 flex items-center justify-between">
          <div>
            <div className="font-label-sm text-on-surface-variant">Working People Collection</div>
            <div className="font-headline-sm text-primary font-bold">{formatCurrency(m.workingCollection)}</div>
          </div>
          <div className="text-right font-label-md font-bold text-on-background">{m.workingCount || 0} Enrolled</div>
        </div>

        {modalLoading ? (
          <LoadingSpinner label="Loading working people..." />
        ) : modalData.length === 0 ? (
          <p className="text-center py-6 text-on-surface-variant font-body-md">No working people records for {selectedYear}</p>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {modalData.map((c) => (
              <div key={c._id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-label-md font-bold text-on-background">{c.name}</div>
                  <div className="font-label-sm text-xs text-on-surface-variant">{c.phone || 'No Phone'}</div>
                </div>
                <div className="text-right">
                  <div className="font-label-md font-bold text-tertiary">{formatCurrency(c.actualAmount)}</div>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.paymentStatus === 'Received' ? 'bg-tertiary-container/40 text-tertiary' : 'bg-error-container/30 text-error'}`}>
                    {c.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalWrapper>

      {/* MODAL 6: SCHOOL / COLLEGE */}
      <ModalWrapper
        isOpen={activeModal === 'student'}
        onClose={() => setActiveModal(null)}
        title="School / College Collections"
        icon="school"
        iconColor="text-secondary"
      >
        <div className="bg-secondary-container/20 p-3.5 rounded-xl border border-secondary/20 flex items-center justify-between">
          <div>
            <div className="font-label-sm text-on-surface-variant">Students Collection</div>
            <div className="font-headline-sm text-secondary font-bold">{formatCurrency(m.studentCollection)}</div>
          </div>
          <div className="text-right font-label-md font-bold text-on-background">{m.studentCount || 0} Students</div>
        </div>

        {modalLoading ? (
          <LoadingSpinner label="Loading student records..." />
        ) : modalData.length === 0 ? (
          <p className="text-center py-6 text-on-surface-variant font-body-md">No student records for {selectedYear}</p>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {modalData.map((c) => (
              <div key={c._id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-label-md font-bold text-on-background">{c.name}</div>
                  <div className="font-label-sm text-xs text-on-surface-variant">{c.phone || 'No Phone'}</div>
                </div>
                <div className="text-right">
                  <div className="font-label-md font-bold text-tertiary">{formatCurrency(c.actualAmount)}</div>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.paymentStatus === 'Received' ? 'bg-tertiary-container/40 text-tertiary' : 'bg-error-container/30 text-error'}`}>
                    {c.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalWrapper>
    </div>
  );
};
