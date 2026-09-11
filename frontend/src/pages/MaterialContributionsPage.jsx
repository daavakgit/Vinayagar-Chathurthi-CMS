import React, { useState, useEffect, useCallback, useMemo } from 'react';

const RECORDS_PER_PAGE = 10;
import { useYear } from '../context/YearContext';
import {
  getMaterialContributionsApi,
  createMaterialContributionApi,
  updateMaterialContributionApi,
  deleteMaterialContributionApi,
} from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { MaterialContributionFormModal } from '../components/MaterialContributionFormModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { FilterBar } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Toast } from '../components/Toast';

export const MaterialContributionsPage = () => {
  const { selectedYear } = useYear();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalEstimatedValue: 0,
    receivedCount: 0,
    pledgedCount: 0,
    usedCount: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const categoriesList = [
    { value: 'Food / Annadhanam', label: 'Food / Annadhanam' },
    { value: 'Pooja Supplies', label: 'Pooja Supplies' },
    { value: 'Decoration', label: 'Decoration' },
    { value: 'Lighting / Electrical', label: 'Lighting / Electrical' },
    { value: 'Utensils / Equipment', label: 'Utensils / Equipment' },
    { value: 'Prasadam Materials', label: 'Prasadam Materials' },
    { value: 'Clothing / Vastram', label: 'Clothing / Vastram' },
    { value: 'Flowers / Garlands', label: 'Flowers / Garlands' },
    { value: 'Other', label: 'Other' },
  ];

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = { year: selectedYear, search, category, status };
      const res = await getMaterialContributionsApi(params);
      if (res.success) {
        setItems(res.data || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
        setCurrentPage(1);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, search, category, status]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editData) {
        await updateMaterialContributionApi(editData._id, formData);
        setToast({ message: 'Material contribution updated successfully', type: 'success' });
      } else {
        await createMaterialContributionApi(formData);
        setToast({ message: 'Material contribution added successfully', type: 'success' });
      }
      setModalOpen(false);
      setEditData(null);
      loadItems();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMaterialContributionApi(deleteId);
      setToast({ message: 'Material contribution deleted successfully', type: 'success' });
      setDeleteId(null);
      loadItems();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setDeleteId(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(items.length / RECORDS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * RECORDS_PER_PAGE;
    return items.slice(start, start + RECORDS_PER_PAGE);
  }, [items, currentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const left = Math.max(2, currentPage - 2);
    const right = Math.min(totalPages - 1, currentPage + 2);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const getStatusBadgeClass = (st) => {
    switch (st) {
      case 'Received':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Pledged':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Used':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-secondary-container/20 text-secondary border-secondary/20';
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold flex items-center gap-2">
            <span>📦</span>
            <span>Material Contributions</span>
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Track physical items & material donations for {selectedYear} event
          </p>
        </div>
        <button
          onClick={() => { setEditData(null); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          <span>Add Contribution</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-primary font-bold">{metrics.totalItems}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Total Donated Items</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-emerald-600 font-bold">
            {formatCurrency(metrics.totalEstimatedValue)}
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Est. Total Value</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-emerald-600 font-bold">{metrics.receivedCount}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Received Items</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-amber-600 font-bold">{metrics.pledgedCount}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Pledged / Pending</div>
        </div>
      </div>

      {/* Filter Bar & Status Chips */}
      <div className="space-y-3">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categoriesList={categoriesList}
          onResetFilters={() => { setSearch(''); setCategory('all'); setStatus('all'); }}
          placeholder="Search by donor name, item, phone or notes..."
        />

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-label-sm text-xs text-on-surface-variant font-semibold mr-1">Status Filter:</span>
          {['all', 'Received', 'Pledged', 'Used'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-3 py-1 rounded-full text-xs font-label-md transition-colors ${
                status === st
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="No Material Contributions Found"
          description={
            search || category !== 'all' || status !== 'all'
              ? 'No material contribution records match your current filters.'
              : `No material contributions recorded for ${selectedYear} yet.`
          }
          actionLabel="Add Contribution"
          onAction={() => { setEditData(null); setModalOpen(true); }}
        />
      ) : (
        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['Donor Name', 'Item Description', 'Quantity', 'Est. Value', 'Category', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-label-md text-label-md text-on-surface-variant font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, idx) => (
                  <tr
                    key={item._id}
                    className={`border-b border-outline-variant/60 hover:bg-surface-container-low/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-surface-container-lowest/40'}`}
                  >
                    <td className="px-4 py-3 font-label-md text-label-md text-on-background font-medium">
                      <div>{item.donorName}</div>
                      {item.phone && <div className="text-[11px] text-on-surface-variant">{item.phone}</div>}
                    </td>
                    <td className="px-4 py-3 font-label-md text-label-md text-on-background">
                      <div className="font-semibold">{item.itemName}</div>
                      {item.notes && <div className="text-[11px] text-on-surface-variant max-w-[200px] truncate">{item.notes}</div>}
                    </td>
                    <td className="px-4 py-3 font-label-md text-label-md text-primary font-bold">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 font-label-md text-label-md text-on-background font-semibold">
                      {item.estimatedValue > 0 ? formatCurrency(item.estimatedValue) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold border border-outline-variant">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold border ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditData(item); setModalOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-1.5 rounded-lg hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3.5 border-t border-outline-variant bg-surface-container-low/40 flex-wrap">
              <span className="text-xs text-on-surface-variant whitespace-nowrap">
                Page <span className="font-bold text-on-background">{currentPage}</span> of{' '}
                <span className="font-bold text-on-background">{totalPages}</span>
                {' '}·{' '}
                {(currentPage - 1) * RECORDS_PER_PAGE + 1}–{Math.min(currentPage * RECORDS_PER_PAGE, items.length)} of {items.length}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-surface border-outline-variant text-on-surface-variant enabled:hover:bg-primary enabled:hover:text-on-primary enabled:hover:border-primary">
                  <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                  <span className="hidden sm:inline">Prev</span>
                </button>
                {pageNumbers.map((page, i) =>
                  page === '...' ? (
                    <span key={`m-${i}`} className="px-2 text-on-surface-variant text-xs select-none">…</span>
                  ) : (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] h-[32px] rounded-lg text-xs font-bold border transition-all ${currentPage === page ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
                      {page}
                    </button>
                  )
                )}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-surface border-outline-variant text-on-surface-variant enabled:hover:bg-primary enabled:hover:text-on-primary enabled:hover:border-primary">
                  <span className="hidden sm:inline">Next</span>
                  <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-outline-variant/60">
            {paginatedItems.map((item) => (
              <div key={item._id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md text-on-background font-bold truncate">
                        {item.donorName}
                      </span>
                      {item.phone && <span className="text-[11px] text-on-surface-variant">({item.phone})</span>}
                    </div>
                    <div className="font-label-md text-base text-primary font-bold mt-1">
                      {item.itemName} &bull; <span className="text-on-background font-semibold">{item.quantity}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold border flex-shrink-0 ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/40">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-semibold">
                      {item.category}
                    </span>
                    <span>{formatDate(item.date)}</span>
                  </div>
                  {item.estimatedValue > 0 && (
                    <div className="font-bold text-on-background">
                      Est: {formatCurrency(item.estimatedValue)}
                    </div>
                  )}
                </div>

                {item.notes && (
                  <p className="text-xs text-on-surface-variant italic bg-surface-container-low/50 p-2 rounded-lg">
                    "{item.notes}"
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => { setEditData(item); setModalOpen(true); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteId(item._id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-error-container/20 text-error text-xs font-semibold hover:bg-error-container/40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-outline-variant bg-surface-container-low/40 md:hidden">
              <span className="text-xs text-on-surface-variant">
                Page <b className="text-on-background">{currentPage}</b> / <b className="text-on-background">{totalPages}</b>
              </span>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 bg-surface border-outline-variant text-on-surface-variant enabled:hover:bg-primary enabled:hover:text-on-primary">
                  Prev
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 bg-surface border-outline-variant text-on-surface-variant enabled:hover:bg-primary enabled:hover:text-on-primary">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <MaterialContributionFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        initialData={editData}
        isSubmitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        title="Delete Material Contribution"
        message="Are you sure you want to delete this material contribution record?"
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
