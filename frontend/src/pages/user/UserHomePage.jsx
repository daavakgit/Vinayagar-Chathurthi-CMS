import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../../context/YearContext';
import { getDashboardApi, getCollectionsApi, getExpensesApi, getSettingsApi, getMaterialContributionsApi } from '../../services/api';
import { formatCurrency, formatDate, getCategoryLabel } from '../../utils/formatters';
import { QrPaymentModal } from '../../components/QrPaymentModal';

const SummarySkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-surface-container-low border border-outline-variant/60 p-6 rounded-3xl h-36" />
    <div className="bg-surface-container-low border border-outline-variant/60 p-5 rounded-2xl h-24" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface-container-low border border-outline-variant/60 p-5 rounded-2xl h-28" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 h-64" />
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 h-64" />
    </div>
  </div>
);

export const UserHomePage = () => {
  const { selectedYear } = useYear();
  const cacheKey = `vcm_summary_cache_${selectedYear}`;

  // Try reading from cache immediately for 0ms load
  const [metrics, setMetrics] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`${cacheKey}_metrics`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [collections, setCollections] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`${cacheKey}_collections`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`${cacheKey}_expenses`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`${cacheKey}_settings`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [materials, setMaterials] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`${cacheKey}_materials`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(!metrics);
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

  const loadHomeData = useCallback(async (yearKey, key) => {
    try {
      const [dashRes, colRes, expRes, setRes, matRes] = await Promise.all([
        getDashboardApi(yearKey),
        getCollectionsApi({ year: yearKey, limit: 5 }),
        getExpensesApi({ year: yearKey, limit: 5 }),
        getSettingsApi(),
        getMaterialContributionsApi({ year: yearKey }),
      ]);

      if (dashRes?.success) {
        setMetrics(dashRes.data);
        try { sessionStorage.setItem(`${key}_metrics`, JSON.stringify(dashRes.data)); } catch { /* ignore */ }
      }
      if (colRes?.success) {
        setCollections(colRes.data || []);
        try { sessionStorage.setItem(`${key}_collections`, JSON.stringify(colRes.data || [])); } catch { /* ignore */ }
      }
      if (expRes?.success) {
        setExpenses(expRes.data || []);
        try { sessionStorage.setItem(`${key}_expenses`, JSON.stringify(expRes.data || [])); } catch { /* ignore */ }
      }
      if (setRes?.success) {
        setSettings(setRes.data);
        try { sessionStorage.setItem(`${key}_settings`, JSON.stringify(setRes.data)); } catch { /* ignore */ }
      }
      if (matRes?.success) {
        setMaterials(matRes.data || []);
        try { sessionStorage.setItem(`${key}_materials`, JSON.stringify(matRes.data || [])); } catch { /* ignore */ }
      }
    } catch (err) {
      console.error('Error loading User Home data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If no cache for this year, ensure loading spinner shows
    const hasCachedMetrics = (() => { try { return !!sessionStorage.getItem(`${cacheKey}_metrics`); } catch { return false; } })();
    if (!hasCachedMetrics) {
      setMetrics(null);
      setCollections([]);
      setExpenses([]);
      setSettings(null);
      setMaterials([]);
      setLoading(true);
    }
    loadHomeData(selectedYear, cacheKey);
  }, [selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !metrics) return <SummarySkeleton />;

  const m = metrics || {};
  const s = settings || {};
  const announcements = s.announcements || 'May Lord Ganesha bless our community with peace, harmony, and prosperity!';

  return (
    <div className="space-y-6 animate-splash-fade-in">
      {/* Devotional Festive Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/80 via-orange-950/70 to-slate-950 border border-amber-500/40 p-6 md:p-8 rounded-3xl shadow-[0_4px_25px_rgba(245,158,11,0.15)] space-y-3">
        {/* Glow Accents */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🪔</span>
            <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs sm:text-sm font-extrabold tracking-wider">
              நமது விழா • நமது பங்களிப்பு
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-100 drop-shadow-sm">
            விநாயகர் சதுர்த்தி விழா {selectedYear}
          </h1>
          <p className="font-body-md text-amber-100/80 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed">
            {announcements}
          </p>
        </div>
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
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-950 p-1 shadow-md border-2 border-purple-400 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/phonepe-qr.jpg" 
                  alt="PhonePe QR Code Preview" 
                  className="w-full h-full object-cover object-center rounded-lg"
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

      {/* QR Popup Modal with Premium Micro-interactions & Animations */}
      <QrPaymentModal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)} 
      />

      {/* Summary KPI Cards with Vibrant Hover Micro-Interactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-2 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Total Collection</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">account_balance_wallet</span>
            </div>
          </div>
          <div className="font-headline-md text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(m.totalCollection)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Direct + Split Recoveries</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-2 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-error/40">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-xl">receipt_long</span>
            </div>
          </div>
          <div className="font-headline-md text-2xl font-bold text-error">{formatCurrency(m.totalExpenses)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">All categories combined</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-2 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Current Balance</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
            </div>
          </div>
          <div className="font-headline-md text-2xl font-bold text-primary">{formatCurrency(m.eventBalance)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Total Collection minus expenses</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-2 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Total Contributors</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">groups</span>
            </div>
          </div>
          <div className="font-headline-md text-2xl font-bold text-amber-600 dark:text-amber-400">{m.totalContributors || 0}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">{m.paidContributorsCount || 0} Paid Contributors</div>
        </div>
      </div>

      {/* Recent Collections & Recent Expenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Collections */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">payments</span>
              Recent Collections
            </h2>
            <span className="font-label-sm text-xs text-on-surface-variant font-medium bg-surface-container px-2 py-0.5 rounded-full">View Only</span>
          </div>

          {collections.length === 0 ? (
            <p className="text-center py-6 text-on-surface-variant text-xs">No collections recorded yet</p>
          ) : (
            <div className="divide-y divide-outline-variant/50">
              {collections.map((c) => (
                <div key={c._id} className="py-2.5 flex items-center justify-between text-xs hover:bg-surface-container-low/40 px-2 rounded-lg transition-colors">
                  <div>
                    <div className="font-bold text-on-background">{c.name}</div>
                    <div className="text-on-surface-variant text-[11px]">{getCategoryLabel(c.category)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(c.actualAmount)}</div>
                    <span className="text-[10px] text-on-surface-variant">{c.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
            <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-error">receipt</span>
              Recent Expenses
            </h2>
            <span className="font-label-sm text-xs text-on-surface-variant font-medium bg-surface-container px-2 py-0.5 rounded-full">View Only</span>
          </div>

          {expenses.length === 0 ? (
            <p className="text-center py-6 text-on-surface-variant text-xs">No expenses recorded yet</p>
          ) : (
            <div className="divide-y divide-outline-variant/50">
              {expenses.map((e) => (
                <div key={e._id} className="py-2.5 flex items-center justify-between text-xs hover:bg-surface-container-low/40 px-2 rounded-lg transition-colors">
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

      {/* Material Contributions Summary */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">inventory_2</span>
            Material Contributions
          </h2>
          <span className="font-label-sm text-xs text-on-surface-variant font-medium bg-surface-container px-2 py-0.5 rounded-full">View Only</span>
        </div>

        {materials.length === 0 ? (
          <p className="text-center py-6 text-on-surface-variant text-xs">No material contributions recorded yet</p>
        ) : (
          <>
            {/* Metric chips */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold border border-purple-500/20">
                {materials.length} Item{materials.length !== 1 ? 's' : ''} Total
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
                {materials.filter(m => m.status === 'Received').length} Received
              </span>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-500/20">
                {materials.filter(m => m.status === 'Pledged').length} Pledged
              </span>
            </div>
            <div className="divide-y divide-outline-variant/50">
              {materials.slice(0, 5).map((m) => (
                <div key={m._id} className="py-2.5 flex items-center justify-between text-xs hover:bg-surface-container-low/40 px-2 rounded-lg transition-colors">
                  <div>
                    <div className="font-bold text-on-background">{m.donorName}</div>
                    <div className="text-on-surface-variant text-[11px]">{m.itemName} · Qty: {m.quantity} · {m.category}</div>
                  </div>
                  <div className="text-right">
                    {m.estimatedValue > 0 && (
                      <div className="font-bold text-purple-600 dark:text-purple-400">₹{m.estimatedValue.toLocaleString('en-IN')}</div>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      m.status === 'Received' ? 'bg-emerald-500/10 text-emerald-600' :
                      m.status === 'Used' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
            {materials.length > 5 && (
              <div className="text-center text-xs text-on-surface-variant border-t border-outline-variant/40 pt-2">
                + {materials.length - 5} more item{materials.length - 5 !== 1 ? 's' : ''} — visit the Material page to see all
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
