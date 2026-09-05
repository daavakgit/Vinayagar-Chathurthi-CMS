import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../context/YearContext';
import {
  getSplitsApi, createSplitApi, updateSplitApi, deleteSplitApi,
  createRecoveryApi, deleteRecoveryApi,
} from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { SplitFormModal } from '../components/SplitFormModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Toast } from '../components/Toast';

/* ───────────────────────────── helpers ───────────────────────────── */
const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = {
    Completed: 'bg-[#D4EFDF] text-[#27AE60]',
    Partial: 'bg-[#FEF5D1] text-[#735c00]',
    Pending: 'bg-error-container text-error',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${size === 'xs' ? 'text-[10px]' : 'text-xs'} ${cfg[status] || 'bg-surface-container text-on-surface-variant'}`}>
      {status}
    </span>
  );
};

const avatarColor = (status) => ({
  Completed: 'bg-[#D4EFDF] text-[#27AE60]',
  Partial: 'bg-secondary/15 text-secondary',
  Pending: 'bg-error-container text-error',
}[status] || 'bg-surface-container-high text-primary');

/* ───────────── Right Panel: Inspector + Inline Recovery ─────────── */
const InspectorPanel = ({ split, onRecordRecovery, onDeleteRecovery, submitting }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [amountError, setAmountError] = useState('');

  const remaining = split ? Math.max(0, split.amountGiven - (split.totalRecovered || 0)) : 0;

  useEffect(() => {
    setAmount('');
    setNotes('');
    setAmountError('');
  }, [split?._id]);

  const validate = (val) => {
    const num = parseFloat(val) || 0;
    if (num > remaining) {
      setAmountError(`Recovery amount cannot exceed remaining balance of ${formatCurrency(remaining)}.`);
    } else {
      setAmountError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (num <= 0 || num > remaining) return;
    onRecordRecovery({ amount: num, date, notes });
    setAmount('');
    setNotes('');
  };

  if (!split) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center gap-3">
        <span className="material-symbols-outlined text-4xl text-outline-variant">touch_app</span>
        <p className="font-label-md text-label-md text-on-surface-variant">
          Select a person from the table to view their split details and record a recovery.
        </p>
      </div>
    );
  }

  const progressPct = split.amountGiven > 0 ? Math.min(100, (split.totalRecovered / split.amountGiven) * 100) : 0;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-sm overflow-hidden" style={{ boxShadow: '0px 4px 20px rgba(211, 84, 0, 0.08)' }}>
      {/* Inspector Header */}
      <div className="p-4 bg-surface-container-low/60 border-b border-outline-variant/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg ${avatarColor(split.status)}`}>
            {initials(split.personName)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-title-md text-title-md text-on-surface leading-tight">{split.personName}</h2>
              <StatusBadge status={split.status} size="xs" />
            </div>
            <p className="font-label-sm text-[11px] text-on-surface-variant">{split.purpose}</p>
          </div>
        </div>
      </div>

      {/* Financial Ribbon */}
      <div className="grid grid-cols-3 divide-x divide-outline-variant/40 bg-surface py-3 border-b border-outline-variant/40 text-center">
        <div>
          <span className="font-label-sm text-[11px] text-on-surface-variant block">Total Advance</span>
          <span className="font-title-md text-title-md text-on-surface font-bold">{formatCurrency(split.amountGiven)}</span>
        </div>
        <div>
          <span className="font-label-sm text-[11px] text-on-surface-variant block">Recovered</span>
          <span className="font-title-md text-title-md text-tertiary font-bold">{formatCurrency(split.totalRecovered || 0)}</span>
        </div>
        <div className="bg-primary/5">
          <span className="font-label-sm text-[11px] text-primary font-semibold block">Balance Due</span>
          <span className="font-title-md text-title-md text-primary font-bold">{formatCurrency(remaining)}</span>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-360px)]">
        {/* Metadata */}
        <div className="bg-surface-container-low/40 p-3 rounded-lg border border-outline-variant/30 space-y-1">
          <div className="flex justify-between font-label-sm text-label-sm">
            <span className="text-on-surface-variant">Purpose:</span>
            <span className="font-semibold text-on-surface text-right max-w-[60%]">{split.purpose}</span>
          </div>
          <div className="flex justify-between font-label-sm text-label-sm">
            <span className="text-on-surface-variant">Date Issued:</span>
            <span className="font-medium text-on-surface">{formatDate(split.dateGiven)}</span>
          </div>
          <div className="flex justify-between font-label-sm text-label-sm">
            <span className="text-on-surface-variant">Recovery %:</span>
            <span className="font-bold text-tertiary">{progressPct.toFixed(0)}% recovered</span>
          </div>
          {split.notes && (
            <div className="flex justify-between font-label-sm text-label-sm">
              <span className="text-on-surface-variant">Notes:</span>
              <span className="font-medium text-on-surface text-right max-w-[60%]">{split.notes}</span>
            </div>
          )}
        </div>

        {/* Recovery Timeline */}
        <div>
          <h3 className="font-label-md text-label-md font-bold text-on-surface mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-tertiary">history</span>
            Settlement History ({(split.recoveries || []).length} Tranches)
          </h3>
          {(split.recoveries || []).length === 0 ? (
            <p className="font-label-sm text-[11px] text-on-surface-variant italic py-1">No recoveries recorded yet.</p>
          ) : (
            <div className="space-y-2 border-l-2 border-primary/30 pl-3 ml-1.5">
              {(split.recoveries || []).map((r) => (
                <div key={r._id} className="relative group">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-tertiary border-2 border-surface-container-lowest" />
                  <div className="flex items-center justify-between font-label-sm text-label-sm">
                    <div>
                      <span className="font-medium text-on-surface">{formatDate(r.date)}</span>
                      {r.notes && <span className="text-on-surface-variant"> · {r.notes}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-tertiary">+{formatCurrency(r.amount)}</span>
                      <button
                        onClick={() => onDeleteRecovery(r._id)}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-error-container/40 text-error transition-all ml-1"
                        title="Delete this recovery">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inline Recovery Form */}
        {split.status !== 'Completed' && (
          <div className="pt-3 border-t border-outline-variant/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary">payments</span>
                Record Recovery Installment
              </h3>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                Max: {formatCurrency(remaining)}
              </span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface font-medium mb-1">
                  Recovery Amount (₹) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-on-surface-variant font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={remaining}
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); validate(e.target.value); }}
                    placeholder="0.00"
                    className={`w-full pl-7 pr-16 py-2 text-sm bg-surface border rounded-lg focus:ring-2 focus:ring-primary font-semibold text-on-surface focus:outline-none ${amountError ? 'border-error text-error' : 'border-outline-variant'}`}
                  />
                  <button
                    type="button"
                    onClick={() => { setAmount(String(remaining)); validate(remaining); }}
                    className="absolute right-2 top-1.5 px-2 py-1 text-[11px] font-bold text-primary bg-primary/10 rounded hover:bg-primary/20">
                    FULL
                  </button>
                </div>
                {amountError ? (
                  <p className="font-label-sm text-[11px] text-error mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span> {amountError}
                  </p>
                ) : (
                  <p className="font-label-sm text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Remaining balance: {formatCurrency(remaining)}. Enter up to {formatCurrency(remaining)}.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface font-medium mb-1">Payment Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-on-surface" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface font-medium mb-1">Notes / Ref</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="UPI txn, cash ref..."
                    className="w-full px-3 py-1.5 text-sm bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-on-surface" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !amount || !!amountError || parseFloat(amount) <= 0}
                className="w-full min-h-[44px] bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-label-md text-label-md font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-base">check</span>
                )}
                Submit Recovery {amount && !amountError ? `(${formatCurrency(parseFloat(amount) || 0)})` : ''}
              </button>
            </form>
          </div>
        )}

        {split.status === 'Completed' && (
          <div className="pt-3 border-t border-outline-variant/40 flex items-center gap-2 text-[#27AE60]">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            <span className="font-label-md text-label-md font-semibold">Fully Settled — No Balance Due</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ──────────────────────────── Main Page ─────────────────────────── */
export const SplitPage = () => {
  const { selectedYear } = useYear();
  const [splits, setSplits] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedSplit, setSelectedSplit] = useState(null);

  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteRecoveryMeta, setDeleteRecoveryMeta] = useState(null); // { recoveryId, splitId }
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '' });

  const loadSplits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSplitsApi({ year: selectedYear, search });
      if (res.success) {
        setSplits(res.data || []);
        setMetrics(res.metrics || {});
        // Re-sync selected split with fresh data
        if (selectedSplit) {
          const refreshed = (res.data || []).find((s) => s._id === selectedSplit._id);
          setSelectedSplit(refreshed || null);
        }
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, search]);

  useEffect(() => { loadSplits(); }, [loadSplits]);

  const filteredSplits = splits.filter((s) => {
    if (activeTab === 'All') return true;
    return s.status === activeTab;
  });

  const tabCounts = {
    All: splits.length,
    Pending: splits.filter((s) => s.status === 'Pending').length,
    Partial: splits.filter((s) => s.status === 'Partial').length,
    Completed: splits.filter((s) => s.status === 'Completed').length,
  };

  const handleSplitSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editData) {
        await updateSplitApi(editData._id, formData);
        setToast({ message: 'Split record updated', type: 'success' });
      } else {
        await createSplitApi(formData);
        setToast({ message: 'Split amount recorded', type: 'success' });
      }
      setSplitModalOpen(false);
      setEditData(null);
      await loadSplits();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordRecovery = async ({ amount, date, notes }) => {
    if (!selectedSplit) return;
    try {
      setSubmitting(true);
      await createRecoveryApi(selectedSplit._id, { amount, date, notes });
      setToast({ message: `Recovery of ${formatCurrency(amount)} recorded successfully`, type: 'success' });
      await loadSplits();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSplit = async () => {
    if (!deleteId) return;
    try {
      await deleteSplitApi(deleteId);
      setToast({ message: 'Split and its recoveries deleted', type: 'success' });
      if (selectedSplit?._id === deleteId) setSelectedSplit(null);
      setDeleteId(null);
      await loadSplits();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setDeleteId(null);
    }
  };

  const handleDeleteRecovery = async (recoveryId) => {
    try {
      await deleteRecoveryApi(recoveryId);
      setToast({ message: 'Recovery record deleted', type: 'success' });
      await loadSplits();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />

      {/* Page Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold">
            Split &amp; Recovery
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Track advances given and collect settlements — {selectedYear} Event
          </p>
        </div>
        <button
          onClick={() => { setEditData(null); setSplitModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-sm hover:bg-primary-container transition-all active:scale-95">
          <span className="material-symbols-outlined text-xl">add</span>
          + Add New Split / Advance
        </button>
      </div>

      {/* Isolated Ledger Notice */}
      <div className="bg-surface-container-low border-l-4 border-secondary-container p-3 rounded-lg flex items-start gap-3 shadow-sm">
        <span className="material-symbols-outlined text-secondary text-xl mt-0.5">info</span>
        <p className="font-label-md text-label-md text-on-surface flex-1">
          <span className="font-bold text-secondary">Notice:</span> Split &amp; Advance recoveries are tracked in an isolated ledger and do not alter the regular festival balance
          <span className="font-semibold text-primary"> (Total Collection − Expenses)</span>.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Amount Given', value: formatCurrency(metrics.totalGiven), icon: 'outbox', sub: `Distributed among ${splits.length} persons`, iconBg: 'bg-surface-container', iconColor: 'text-primary', valueColor: 'text-primary' },
          { label: 'Total Recovered', value: formatCurrency(metrics.totalRecovered), icon: 'download_done', sub: metrics.totalGiven > 0 ? `${Math.round((metrics.totalRecovered / metrics.totalGiven) * 100)}% of total recovered` : '0% recovered', iconBg: 'bg-surface-container-high', iconColor: 'text-tertiary', valueColor: 'text-tertiary' },
          { label: 'Yet to Recover', value: formatCurrency(metrics.yetToRecover), icon: 'pending_actions', sub: 'Pending settlement', iconBg: 'bg-error-container', iconColor: 'text-error', valueColor: 'text-error' },
          { label: 'Status Breakdown', isStatus: true, total: splits.length, ...metrics },
        ].map((card, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 relative overflow-hidden" style={{ boxShadow: '0px 4px 20px rgba(211, 84, 0, 0.08)' }}>
            {card.isStatus ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{card.label}</span>
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-base">pie_chart</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-headline-lg text-headline-lg text-on-surface font-bold">{card.total}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Total Records</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 font-label-sm text-label-sm">
                  <span className="px-2 py-0.5 rounded-full bg-[#D4EFDF] text-[#27AE60] font-semibold">{metrics.completedCount || 0} Completed</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FEF5D1] text-[#735c00] font-semibold">{metrics.partialCount || 0} Partial</span>
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-error font-semibold">{metrics.pendingCount || 0} Pending</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{card.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                    <span className="material-symbols-outlined text-base">{card.icon}</span>
                  </div>
                </div>
                <div className={`font-headline-lg text-headline-lg leading-tight font-bold ${card.valueColor}`}>{card.value}</div>
                <div className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                  <span className={`inline-block w-2 h-2 rounded-full ${card.valueColor.replace('text-', 'bg-')}`} />
                  <span>{card.sub}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Two-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Table + Filters */}
        <section className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-sm overflow-hidden">
          {/* Filter bar */}
          <div className="p-4 border-b border-outline-variant/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search person name or purpose..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface focus:outline-none"
                />
              </div>
              <button
                onClick={() => { setEditData(null); setSplitModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary text-primary hover:bg-primary-fixed/20 font-label-sm text-label-sm transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
                Add New Split
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 border-b border-outline-variant/30 pt-1">
              {['All', 'Pending', 'Partial', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${activeTab === tab ? 'text-primary font-bold border-b-2 border-primary -mb-px' : 'text-on-surface-variant hover:text-primary'}`}>
                  <span>{tab} Splits</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredSplits.length === 0 ? (
            <EmptyState icon="handshake" title="No Split Records" description="No split/advance records match the current filter."
              actionLabel="Add New Split" onAction={() => { setEditData(null); setSplitModalOpen(true); }} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F3F5] text-on-surface font-label-sm text-label-sm border-b border-outline-variant/40">
                    <th className="py-3 px-4 font-semibold w-10 text-center">S.No</th>
                    <th className="py-3 px-4 font-semibold">Contributor / Person</th>
                    <th className="py-3 px-4 font-semibold">Purpose &amp; Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Given</th>
                    <th className="py-3 px-4 font-semibold text-right">Recovered</th>
                    <th className="py-3 px-4 font-semibold text-right">Remaining</th>
                    <th className="py-3 px-4 font-semibold w-28">Progress</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredSplits.map((s, idx) => {
                    const pct = s.amountGiven > 0 ? Math.min(100, (s.totalRecovered / s.amountGiven) * 100) : 0;
                    const isSelected = selectedSplit?._id === s._id;
                    const barColor = s.status === 'Completed' ? 'bg-[#27AE60]' : s.status === 'Partial' ? 'bg-secondary' : 'bg-error';
                    const remaining = Math.max(0, s.amountGiven - s.totalRecovered);

                    return (
                      <tr
                        key={s._id}
                        onClick={() => setSelectedSplit(s)}
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-surface-container-low/50 border-l-4 border-transparent'}`}>
                        <td className="py-3.5 px-4 text-center font-label-sm text-on-surface-variant">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor(s.status)}`}>
                              {initials(s.personName)}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface leading-tight text-sm">{s.personName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-on-surface leading-tight text-sm max-w-[160px] truncate">{s.purpose}</p>
                          <p className="font-label-sm text-xs text-on-surface-variant">{formatDate(s.dateGiven)}</p>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-on-surface text-sm">{formatCurrency(s.amountGiven)}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-tertiary text-sm">{formatCurrency(s.totalRecovered || 0)}</td>
                        <td className={`py-3.5 px-4 text-right font-bold text-sm ${remaining > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                          {formatCurrency(remaining)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                            <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`font-label-sm text-[11px] ${s.status === 'Completed' ? 'text-[#27AE60] font-semibold' : 'text-on-surface-variant'}`}>
                            {s.status === 'Completed' ? 'Settled' : `${pct.toFixed(0)}% paid`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {s.status !== 'Completed' ? (
                              <button
                                onClick={() => setSelectedSplit(s)}
                                className="p-1 rounded hover:bg-surface-container text-primary"
                                title="Record Recovery">
                                <span className="material-symbols-outlined text-base">add_card</span>
                              </button>
                            ) : (
                              <button disabled className="p-1 rounded text-on-surface-variant opacity-40 cursor-not-allowed" title="Fully Settled">
                                <span className="material-symbols-outlined text-base">check_circle</span>
                              </button>
                            )}
                            <button
                              onClick={() => { setEditData(s); setSplitModalOpen(true); }}
                              className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
                              title="Edit">
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteId(s._id)}
                              className="p-1 rounded hover:bg-surface-container text-error"
                              title="Delete">
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {filteredSplits.length > 0 && (
            <div className="p-3 bg-surface border-t border-outline-variant/30 flex items-center justify-between font-label-sm text-label-sm">
              <span className="text-on-surface-variant">
                Showing {filteredSplits.length} of {splits.length} records ({activeTab} filter)
              </span>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-sm">touch_app</span>
                <span>Click a row to view details &amp; record recovery</span>
              </div>
            </div>
          )}
        </section>

        {/* Right: Inspector Panel */}
        <section className="lg:col-span-4">
          <InspectorPanel
            split={selectedSplit}
            onRecordRecovery={handleRecordRecovery}
            onDeleteRecovery={handleDeleteRecovery}
            submitting={submitting}
          />
          <div className="bg-surface-container-low/80 border border-outline-variant/40 rounded-xl p-3 font-label-sm text-label-sm text-on-surface-variant flex items-center gap-3 mt-3">
            <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
            <span>Split recoveries are isolated from festival balance. All entries are audit-logged with date and amount.</span>
          </div>
        </section>
      </div>

      <SplitFormModal
        isOpen={splitModalOpen}
        onClose={() => { setSplitModalOpen(false); setEditData(null); }}
        onSubmit={handleSplitSubmit}
        initialData={editData}
        isSubmitting={submitting}
      />
      <ConfirmationModal
        isOpen={!!deleteId}
        title="Delete Split Record"
        message="This will permanently delete the split record and ALL associated recovery entries. This action cannot be undone."
        confirmText="Delete All"
        onConfirm={handleDeleteSplit}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
