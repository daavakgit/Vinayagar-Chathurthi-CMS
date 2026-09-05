import React from 'react';

export const FilterBar = ({
  search = '',
  onSearchChange,
  category = 'all',
  onCategoryChange,
  categoriesList = [],
  paymentStatus = 'all',
  onPaymentStatusChange,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  onResetFilters,
  placeholder = 'Search by name or details...',
}) => {
  const hasActiveFilters =
    search ||
    category !== 'all' ||
    (paymentStatus && paymentStatus !== 'all') ||
    startDate ||
    endDate;

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-4 mb-6 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-background"
            >
              <span className="material-symbols-outlined text-lg">cancel</span>
            </button>
          )}
        </div>

        {/* Category filter */}
        {categoriesList && categoriesList.length > 0 && (
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-label-md text-label-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat.value || cat} value={cat.value || cat}>
                {cat.label || cat}
              </option>
            ))}
          </select>
        )}

        {/* Payment Status filter if applicable */}
        {onPaymentStatusChange && (
          <select
            value={paymentStatus}
            onChange={(e) => onPaymentStatusChange(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-label-md text-label-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Received">Received</option>
            <option value="Pending">Pending</option>
          </select>
        )}
      </div>

      {/* Date filter row */}
      {(onStartDateChange || onEndDateChange) && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-outline-variant/40">
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">filter_alt</span> Date Range:
          </span>
          {onStartDateChange && (
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1 font-label-md text-label-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
          )}
          <span className="text-on-surface-variant font-label-sm">to</span>
          {onEndDateChange && (
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1 font-label-md text-label-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
          )}

          {hasActiveFilters && onResetFilters && (
            <button
              onClick={onResetFilters}
              className="ml-auto text-primary hover:underline font-label-sm text-label-sm flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span> Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
