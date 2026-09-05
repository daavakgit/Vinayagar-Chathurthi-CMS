import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../../context/YearContext';
import { getDashboardApi, getCollectionsApi, getExpensesApi, getSettingsApi } from '../../services/api';
import { formatCurrency, formatDate, getCategoryLabel } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const UserHomePage = () => {
  const { selectedYear } = useYear();
  const [metrics, setMetrics] = useState(null);
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, colRes, expRes, setRes] = await Promise.all([
        getDashboardApi(selectedYear),
        getCollectionsApi({ year: selectedYear, limit: 5 }),
        getExpensesApi({ year: selectedYear, limit: 5 }),
        getSettingsApi(),
      ]);
      if (dashRes?.success) setMetrics(dashRes.data);
      if (colRes?.success) setCollections(colRes.data || []);
      if (expRes?.success) setExpenses(expRes.data || []);
      if (setRes?.success) setSettings(setRes.data);
    } catch (err) {
      console.error('Error loading User Home data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => { loadHomeData(); }, [loadHomeData]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner label="Loading festival summary..." />
    </div>
  );

  const m = metrics || {};
  const s = settings || {};
  const announcements = s.announcements || 'May Lord Ganesha bless our community with peace, harmony, and prosperity!';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-container/40 via-surface to-tertiary-container/30 border border-outline-variant p-6 rounded-3xl shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪔</span>
          <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">Welcome Community Member</span>
        </div>
        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-background">
          Vinayagar Chathurthi {selectedYear}
        </h1>
        <p className="font-body-md text-on-surface-variant text-sm md:text-base">
          Transparent real-time overview of collections, expenses, recoveries, and event updates.
        </p>
      </div>

      {/* Announcement Banner */}
      <div className="bg-surface border border-outline-variant p-4 rounded-2xl flex items-start gap-3 glass-card">
        <span className="material-symbols-outlined text-primary text-xl mt-0.5">campaign</span>
        <div>
          <div className="font-title-sm font-bold text-on-background">Latest Event Announcement</div>
          <div className="font-body-sm text-xs text-on-surface-variant mt-1">{announcements}</div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Total Collection</span>
            <span className="material-symbols-outlined text-tertiary text-xl">account_balance_wallet</span>
          </div>
          <div className="font-headline-md text-2xl font-bold text-tertiary">{formatCurrency(m.totalCollection)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Direct + Split Recoveries</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Total Expenses</span>
            <span className="material-symbols-outlined text-error text-xl">receipt_long</span>
          </div>
          <div className="font-headline-md text-2xl font-bold text-error">{formatCurrency(m.totalExpenses)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">All categories combined</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Current Balance</span>
            <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
          </div>
          <div className="font-headline-md text-2xl font-bold text-primary">{formatCurrency(m.eventBalance)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Total Collection minus expenses</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Total Contributors</span>
            <span className="material-symbols-outlined text-secondary text-xl">groups</span>
          </div>
          <div className="font-headline-md text-2xl font-bold text-secondary">{m.totalContributors || 0}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">{m.paidContributorsCount || 0} Paid Contributors</div>
        </div>
      </div>

      {/* Recent Collections & Recent Expenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Collections */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">payments</span>
              Recent Collections
            </h2>
            <span className="font-label-sm text-xs text-on-surface-variant">View Only</span>
          </div>

          {collections.length === 0 ? (
            <p className="text-center py-6 text-on-surface-variant text-xs">No collections recorded yet</p>
          ) : (
            <div className="divide-y divide-outline-variant/50">
              {collections.map((c) => (
                <div key={c._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-on-background">{c.name}</div>
                    <div className="text-on-surface-variant text-[11px]">{getCategoryLabel(c.category)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-tertiary">{formatCurrency(c.actualAmount)}</div>
                    <span className="text-[10px] text-on-surface-variant">{c.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-error">receipt</span>
              Recent Expenses
            </h2>
            <span className="font-label-sm text-xs text-on-surface-variant">View Only</span>
          </div>

          {expenses.length === 0 ? (
            <p className="text-center py-6 text-on-surface-variant text-xs">No expenses recorded yet</p>
          ) : (
            <div className="divide-y divide-outline-variant/50">
              {expenses.map((e) => (
                <div key={e._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-on-background">{e.expenseName}</div>
                    <div className="text-on-surface-variant text-[11px]">{e.category} · {formatDate(e.date)}</div>
                  </div>
                  <div className="font-bold text-error">{formatCurrency(e.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
