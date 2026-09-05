import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useYear } from '../context/YearContext';
import {
  getCollectionsApi, createCollectionApi, updateCollectionApi, deleteCollectionApi,
} from '../services/api';
import { formatCurrency, formatDate, getCategoryLabel } from '../utils/formatters';
import { CollectionFormModal } from '../components/CollectionFormModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { FilterBar } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Toast } from '../components/Toast';

const categoryList = [
  { value: 'working', label: 'Working People' },
  { value: 'student', label: 'School / College' },
  { value: 'general_public', label: 'General Public' },
];

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${
    status === 'Received'
      ? 'bg-tertiary-container/30 text-tertiary border border-tertiary/20'
      : 'bg-error-container/30 text-error border border-error/20'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'Received' ? 'bg-tertiary' : 'bg-error'}`} />
    {status}
  </span>
);

const CategoryBadge = ({ category }) => {
  const classes = {
    working: 'bg-primary-container/20 text-primary border-primary/20',
    student: 'bg-secondary-container/30 text-secondary border-secondary/20',
    general_public: 'bg-tertiary-container/20 text-tertiary border-tertiary/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-[11px] border ${classes[category] || 'bg-surface-container text-on-surface-variant'}`}>
      {getCategoryLabel(category)}
    </span>
  );
};

export const CollectionsPage = () => {
  const { selectedYear } = useYear();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [collections, setCollections] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategory(cat);
    }
  }, [searchParams]);

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const params = { year: selectedYear, search, category, paymentStatus, startDate, endDate };
      const res = await getCollectionsApi(params);
      if (res.success) {
        setCollections(res.data || []);
        setMetrics(res.metrics || {});
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, search, category, paymentStatus, startDate, endDate]);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editData) {
        await updateCollectionApi(editData._id, formData);
        setToast({ message: 'Collection updated successfully', type: 'success' });
      } else {
        await createCollectionApi(formData);
        setToast({ message: 'Collection added successfully', type: 'success' });
      }
      setModalOpen(false);
      setEditData(null);
      loadCollections();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCollectionApi(deleteId);
      setToast({ message: 'Collection record deleted', type: 'success' });
      setDeleteId(null);
      loadCollections();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setDeleteId(null);
    }
  };

  const handleEdit = (collection) => {
    setEditData(collection);
    setModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setPaymentStatus('all');
    setStartDate('');
    setEndDate('');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold">
            Collections
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Manage contributions for {selectedYear} event {category !== 'all' && `(${getCategoryLabel(category)})`}
          </p>
        </div>
        <button
          onClick={() => { setEditData(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-sm hover:bg-primary-container transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Collection
        </button>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-tertiary font-bold">{formatCurrency(metrics.totalActualReceived)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Total Received</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-primary font-bold">{collections.length}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Total Records</div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-secondary font-bold">{formatCurrency(metrics.totalExpected)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Total Expected</div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={(val) => { setCategory(val); setSearchParams(val === 'all' ? {} : { category: val }); }}
        categoriesList={categoryList}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={setPaymentStatus}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onResetFilters={handleResetFilters}
        placeholder="Search by name, phone or notes..."
      />

      {/* Table / List */}
      {loading ? (
        <LoadingSpinner />
      ) : collections.length === 0 ? (
        <EmptyState icon="payments" title="No Collections Found" description="No contributions match your current filter. Add a new collection or reset your filters."
          actionLabel="Add Collection" onAction={() => { setEditData(null); setModalOpen(true); }} />
      ) : (
        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['Name', 'Phone', 'Category', 'Expected', 'Actual Received', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-label-md text-label-md text-on-surface-variant font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {collections.map((c, idx) => (
                  <tr key={c._id} className={`border-b border-outline-variant/60 hover:bg-surface-container-low/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-surface-container-lowest/40'}`}>
                    <td className="px-4 py-3 font-label-md text-label-md text-on-background font-medium">{c.name}</td>
                    <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">{c.phone || '—'}</td>
                    <td className="px-4 py-3"><CategoryBadge category={c.category} /></td>
                    <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">{c.expectedAmount ? formatCurrency(c.expectedAmount) : '—'}</td>
                    <td className="px-4 py-3 font-label-md text-label-md text-tertiary font-bold">{formatCurrency(c.actualAmount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.paymentStatus} /></td>
                    <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">{formatDate(c.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-outline-variant/60">
            {collections.map((c) => (
              <div key={c._id} className="p-4 hover:bg-surface-container-low/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-label-md text-label-md text-on-background font-bold truncate">{c.name}</div>
                    <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">{c.phone || '—'} · {formatDate(c.date)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <CategoryBadge category={c.category} />
                      <StatusBadge status={c.paymentStatus} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-label-md text-label-md text-tertiary font-bold">{formatCurrency(c.actualAmount)}</div>
                    {c.expectedAmount && (
                      <div className="font-label-sm text-[11px] text-on-surface-variant">Exp: {formatCurrency(c.expectedAmount)}</div>
                    )}
                    <div className="flex gap-1 mt-2 justify-end">
                      <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-error-container/30 text-error transition-colors">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CollectionFormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSubmit={handleSubmit} initialData={editData} isSubmitting={submitting} />
      <ConfirmationModal
        isOpen={!!deleteId}
        title="Delete Collection Record"
        message="This will permanently remove this contribution record. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
