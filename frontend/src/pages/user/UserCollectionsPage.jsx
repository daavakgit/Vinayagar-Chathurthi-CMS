import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../../context/YearContext';
import { getCollectionsApi } from '../../services/api';
import { formatCurrency, formatDate, getCategoryLabel } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const UserCollectionsPage = () => {
  const { selectedYear } = useYear();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCollectionsApi({ year: selectedYear, category: categoryFilter });
      if (res?.success) {
        setCollections(res.data || []);
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, categoryFilter]);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  // Derived metrics
  const totalAmount = collections.reduce((acc, c) => acc + (c.actualAmount || 0), 0);
  const contributorCount = collections.length;
  const count500 = collections.filter(c => (c.actualAmount || 0) === 500).length;
  const count2000 = collections.filter(c => (c.actualAmount || 0) === 2000).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-background">
            Collections Overview
          </h1>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
            Vinayagar Chathurthi {selectedYear} · Contributor Ledger (View Only)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'working', 'student', 'general_public'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-label-sm text-xs font-semibold capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant p-4 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Direct Collections</div>
          <div className="font-headline-md text-2xl font-bold text-tertiary">{formatCurrency(totalAmount)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Active Filtered Records</div>
        </div>

        <div className="bg-surface border border-outline-variant p-4 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Number of Contributors</div>
          <div className="font-headline-md text-2xl font-bold text-primary">{contributorCount}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Total Enrolled People</div>
        </div>

        <div className="bg-surface border border-outline-variant p-4 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">₹500 Contributions</div>
          <div className="font-headline-md text-2xl font-bold text-secondary">{count500} People</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Total: {formatCurrency(count500 * 500)}</div>
        </div>

        <div className="bg-surface border border-outline-variant p-4 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">₹2,000 Contributions</div>
          <div className="font-headline-md text-2xl font-bold text-[#008645]">{count2000} People</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Total: {formatCurrency(count2000 * 2000)}</div>
        </div>
      </div>

      {/* Collection History Table / List */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">payments</span>
            Collection Ledger History
          </h2>
          <span className="text-xs bg-tertiary-container/30 text-tertiary font-bold px-2.5 py-1 rounded-full">
            Read Only Access
          </span>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSpinner label="Loading collection ledger..." />
          </div>
        ) : collections.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant text-sm">
            No collection records found for {selectedYear} ({categoryFilter}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant">
                <tr>
                  <th className="p-3.5">Contributor Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment Date</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {collections.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-3.5 font-bold text-on-background">{c.name}</td>
                    <td className="p-3.5 text-on-surface-variant">{getCategoryLabel(c.category)}</td>
                    <td className="p-3.5 text-on-surface-variant">{c.phone || '—'}</td>
                    <td className="p-3.5 font-bold text-tertiary">{formatCurrency(c.actualAmount)}</td>
                    <td className="p-3.5 text-on-surface-variant">{formatDate(c.paymentDate)}</td>
                    <td className="p-3.5 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.paymentStatus === 'Received'
                          ? 'bg-tertiary-container/40 text-tertiary'
                          : 'bg-error-container/30 text-error'
                      }`}>
                        {c.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
