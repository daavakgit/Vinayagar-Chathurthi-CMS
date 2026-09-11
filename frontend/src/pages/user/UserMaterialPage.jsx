import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../../context/YearContext';
import { getMaterialContributionsApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FilterBar } from '../../components/FilterBar';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const UserMaterialPage = () => {
  const { selectedYear } = useYear();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalEstimatedValue: 0,
    receivedCount: 0,
    pledgedCount: 0,
  });

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
    } catch (err) {
      console.error('Failed to load material contributions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, search, category, status]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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
      {/* Page Header */}
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold flex items-center gap-2">
          <span>📦</span>
          <span>Material Contributions</span>
        </h1>
        <p className="font-body-md text-on-surface-variant">
          Community material donations & physical offerings for {selectedYear}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-primary font-bold">{metrics.totalItems}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Total Items Donated</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-emerald-600 font-bold">
            {formatCurrency(metrics.totalEstimatedValue)}
          </div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Total Est. Value</div>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-emerald-600 font-bold">{metrics.receivedCount}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Received Offerings</div>
        </div>
      </div>

      {/* Filter Bar & Status Filter */}
      <div className="space-y-3">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categoriesList={categoriesList}
          onResetFilters={() => { setSearch(''); setCategory('all'); setStatus('all'); }}
          placeholder="Search by donor name, item or details..."
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

      {/* Main List */}
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="No Material Contributions Recorded"
          description={
            search || category !== 'all' || status !== 'all'
              ? 'No material contribution records match your current filter criteria.'
              : `No material contributions recorded for ${selectedYear} yet.`
          }
        />
      ) : (
        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['Donor Name', 'Item Description', 'Quantity', 'Est. Value', 'Category', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-label-md text-label-md text-on-surface-variant font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item._id}
                    className={`border-b border-outline-variant/60 hover:bg-surface-container-low/50 transition-colors ${
                      idx % 2 === 0 ? '' : 'bg-surface-container-lowest/40'
                    }`}
                  >
                    <td className="px-4 py-3 font-label-md text-label-md text-on-background font-medium">
                      {item.donorName}
                    </td>
                    <td className="px-4 py-3 font-label-md text-label-md text-on-background">
                      <div className="font-semibold">{item.itemName}</div>
                      {item.notes && <div className="text-[11px] text-on-surface-variant max-w-[240px] truncate">{item.notes}</div>}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-outline-variant/60">
            {items.map((item) => (
              <div key={item._id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-label-md text-label-md text-on-background font-bold truncate">
                      {item.donorName}
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
