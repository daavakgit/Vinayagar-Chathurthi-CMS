import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useYear } from '../../context/YearContext';
import { getCollectionsApi } from '../../services/api';
import { formatCurrency, formatDate, getCategoryLabel } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const RECORDS_PER_PAGE = 10;

export const UserCollectionsPage = () => {
  const { selectedYear } = useYear();
  const cacheKey = `vcm_collections_${selectedYear}`;

  // Initialise from sessionStorage cache immediately — prevents flicker to 0
  const [collections, setCollections] = useState(() => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try { return !sessionStorage.getItem(cacheKey); }
    catch { return true; }
  });

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const loadCollections = useCallback(async () => {
    try {
      // Only show full loading spinner if we have no cached data at all
      const hasCached = collections.length > 0;
      if (!hasCached) setLoading(true);

      const res = await getCollectionsApi({ year: selectedYear });
      if (res?.success) {
        const data = res.data || [];
        setCollections(data);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* ignore quota */ }
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh cache key when year changes — reset page and clear stale cache for new year
  useEffect(() => {
    setCurrentPage(1);
    setCategoryFilter('all');
    // Check if we have a cache for the new year; if not force loading
    try {
      if (!sessionStorage.getItem(cacheKey)) {
        setCollections([]);
        setLoading(true);
      }
    } catch { /* ignore */ }
    loadCollections();
  }, [selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset page when filter changes
  useEffect(() => { setCurrentPage(1); }, [categoryFilter]);

  // Derived metrics (use ALL unfiltered collections for totals)
  const totalAmount = collections.reduce((acc, c) => acc + (c.actualAmount || 0), 0);
  const contributorCount = collections.length;
  const count500 = collections.filter(c => (c.actualAmount || 0) === 500).length;
  const count2000 = collections.filter(c => (c.actualAmount || 0) === 2000).length;

  // Apply category filter
  const filteredCollections = useMemo(() =>
    categoryFilter === 'all'
      ? collections
      : collections.filter(c => c.category === categoryFilter),
    [collections, categoryFilter]
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCollections.length / RECORDS_PER_PAGE);
  const paginatedCollections = useMemo(() => {
    const start = (currentPage - 1) * RECORDS_PER_PAGE;
    return filteredCollections.slice(start, start + RECORDS_PER_PAGE);
  }, [filteredCollections, currentPage]);

  // Build visible page numbers (max 5 around current)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

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
        <div className="flex flex-wrap items-center gap-2">
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
          <div className="font-label-sm text-[11px] text-on-surface-variant">All Recorded Records</div>
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

      {/* Collection Ledger History — single existing container with internal pagination */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {/* Box Header */}
        <div className="p-4 md:p-5 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">payments</span>
            Collection Ledger History
          </h2>
          <div className="flex items-center gap-2">
            {!loading && filteredCollections.length > 0 && (
              <span className="text-xs text-on-surface-variant">
                {filteredCollections.length} record{filteredCollections.length !== 1 ? 's' : ''}
              </span>
            )}
            <span className="text-xs bg-tertiary-container/30 text-tertiary font-bold px-2.5 py-1 rounded-full">
              Read Only Access
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSpinner label="Loading collection ledger..." />
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant text-sm">
            No collection records found for {selectedYear} ({categoryFilter}).
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Contributor Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Payment Date</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {paginatedCollections.map((c, idx) => (
                    <tr key={c._id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-3.5 text-on-surface-variant">
                        {(currentPage - 1) * RECORDS_PER_PAGE + idx + 1}
                      </td>
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

            {/* Pagination Controls — only show when more than 10 records */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3.5 border-t border-outline-variant bg-surface-container-low/40 flex-wrap">
                {/* Left: page info */}
                <span className="text-xs text-on-surface-variant whitespace-nowrap">
                  Page <span className="font-bold text-on-background">{currentPage}</span> of{' '}
                  <span className="font-bold text-on-background">{totalPages}</span>
                  {' '}·{' '}
                  Records {(currentPage - 1) * RECORDS_PER_PAGE + 1}–{Math.min(currentPage * RECORDS_PER_PAGE, filteredCollections.length)}
                </span>

                {/* Right: Pagination buttons */}
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed
                      enabled:hover:bg-primary enabled:hover:text-on-primary enabled:hover:border-primary
                      bg-surface border-outline-variant text-on-surface-variant"
                    aria-label="Previous page"
                  >
                    <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Page Numbers */}
                  {pageNumbers.map((page, i) =>
                    page === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-on-surface-variant text-xs select-none">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[32px] h-[32px] rounded-lg text-xs font-bold border transition-all ${
                          currentPage === page
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed
                      enabled:hover:bg-primary enabled:hover:text-on-primary enabled:hover:border-primary
                      bg-surface border-outline-variant text-on-surface-variant"
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
