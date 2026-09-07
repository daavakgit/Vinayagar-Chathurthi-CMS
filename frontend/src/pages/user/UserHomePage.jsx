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
  const [showQrModal, setShowQrModal] = useState(false);

  const handleDownloadQr = (e) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = '/phonepe-qr.jpg';
    link.download = 'Vinayagar-Chathurthi-PhonePe-QR.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

      {/* High-visibility QR Contribution Banner Card */}
      <div 
        onClick={() => setShowQrModal(true)}
        className="group relative overflow-hidden bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900 border-2 border-purple-500/70 hover:border-purple-400 p-4 md:p-5 rounded-2xl cursor-pointer shadow-[0_0_25px_rgba(147,51,234,0.35)] hover:shadow-[0_0_35px_rgba(147,51,234,0.55)] transition-all duration-300 transform hover:-translate-y-0.5"
      >
        {/* Decorative Background Shimmer Accent */}
        <div className="absolute -right-12 -top-12 w-44 h-44 bg-purple-500/15 rounded-full blur-2xl group-hover:bg-purple-500/25 transition-all duration-500 pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-amber-500/15 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all duration-500 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* PhonePe QR Thumbnail Badge */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white p-1 shadow-md border-2 border-purple-400 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/phonepe-qr.jpg" 
                  alt="PhonePe QR Code Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white text-[9px] font-bold shadow">
                ✓
              </span>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-title-sm font-extrabold text-base md:text-lg text-white tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-purple-400 text-xl">qr_code_2</span>
                  UPI / PhonePe Contribution QR
                </span>
                <span className="bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                  Scan & Pay
                </span>
              </div>
              <p className="font-body-sm text-xs md:text-sm text-purple-100/90 leading-snug">
                Click here to open & scan the PhonePe QR Code for festival contributions (<span className="font-semibold text-amber-300">Harish C</span>).
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <button
              onClick={handleDownloadQr}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg hover:shadow-amber-500/30 transition-all border border-amber-400/50"
              title="Download QR Image"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span className="hidden xs:inline">Download</span>
            </button>
            <div className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg group-hover:shadow-purple-500/40 transition-all border border-purple-400/40">
              <span>View QR</span>
              <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">open_in_full</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Popup Modal */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="relative bg-gradient-to-b from-gray-900 via-slate-900 to-black border-2 border-purple-500/80 rounded-3xl p-4 sm:p-6 max-w-[340px] sm:max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(147,51,234,0.4)] text-center space-y-3.5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all focus:outline-none z-10"
              title="Close QR Code"
            >
              <span className="material-symbols-outlined text-lg block">close</span>
            </button>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/50 px-3 py-0.5 rounded-full text-purple-200 text-[11px] sm:text-xs font-bold shadow-inner">
              <span className="text-amber-400">🪔</span>
              Vinayagar Chathurthi Contribution
            </div>

            {/* QR Image Container (Reduced & Responsive Size) */}
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xl border-4 border-purple-400/80 inline-block relative mx-auto max-w-[180px] sm:max-w-[210px] w-full group">
              <img 
                src="/phonepe-qr.jpg" 
                alt="PhonePe QR Code - Harish C" 
                className="w-full h-auto max-h-[220px] rounded-lg object-contain mx-auto"
              />
              <button
                onClick={handleDownloadQr}
                className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-amber-500 text-amber-400 hover:text-slate-950 p-1.5 rounded-lg border border-amber-400/40 shadow-lg transition-all flex items-center justify-center gap-1 text-[11px] font-bold"
                title="Download Image"
              >
                <span className="material-symbols-outlined text-xs">download</span>
              </button>
            </div>

            {/* Payment Info */}
            <div className="space-y-0.5 bg-surface-container-low/50 p-2.5 rounded-xl border border-outline-variant/40">
              <div className="font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5">
                <span className="text-purple-400">Account:</span> Harish C
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-300">
                Scan & Pay using PhonePe or any UPI App
              </p>
            </div>

            {/* Close & Download Action Footer */}
            <div className="flex gap-2 pt-0.5">
              <button
                onClick={handleDownloadQr}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Download
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-lg shadow-purple-600/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
