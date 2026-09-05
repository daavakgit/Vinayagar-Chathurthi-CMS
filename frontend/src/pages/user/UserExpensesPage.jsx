import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../../context/YearContext';
import { getExpensesApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const UserExpensesPage = () => {
  const { selectedYear } = useYear();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getExpensesApi({ year: selectedYear });
      if (res?.success) {
        setExpenses(res.data || []);
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  // Unique categories
  const categories = Array.from(new Set(expenses.map(e => e.category))).filter(Boolean);

  // Filtered expenses
  const filteredExpenses = categoryFilter === 'all'
    ? expenses
    : expenses.filter(e => e.category === categoryFilter);

  const totalExpenseSum = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-background">
            Expenses Log
          </h1>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
            Vinayagar Chathurthi {selectedYear} · Itemized Expenditure (View Only)
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-label-sm text-xs font-semibold transition-all ${
              categoryFilter === 'all'
                ? 'bg-error text-on-error shadow-sm'
                : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-label-sm text-xs font-semibold capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-error text-on-error shadow-sm'
                  : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Expenses (Filtered)</div>
          <div className="font-headline-md text-2xl font-bold text-error">{formatCurrency(totalExpenseSum)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Sum of selected items</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Expense Items</div>
          <div className="font-headline-md text-2xl font-bold text-on-background">{filteredExpenses.length} Items</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Receipts logged</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Expense Categories</div>
          <div className="font-headline-md text-2xl font-bold text-primary">{categories.length} Categories</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Pooja, Idol, Prasadam, etc.</div>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-xl">receipt_long</span>
            Expense Receipts Ledger
          </h2>
          <span className="text-xs bg-error-container/30 text-error font-bold px-2.5 py-1 rounded-full">
            Read Only Access
          </span>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSpinner label="Loading expense records..." />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant text-sm">
            No expense records found for {selectedYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant">
                <tr>
                  <th className="p-3.5">Expense Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Paid To</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredExpenses.map((e) => (
                  <tr key={e._id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-3.5 font-bold text-on-background">{e.expenseName}</td>
                    <td className="p-3.5 text-on-surface-variant">{e.category}</td>
                    <td className="p-3.5 text-on-surface-variant">{e.paidTo || '—'}</td>
                    <td className="p-3.5 text-on-surface-variant max-w-xs truncate">{e.description || '—'}</td>
                    <td className="p-3.5 text-on-surface-variant">{formatDate(e.date)}</td>
                    <td className="p-3.5 font-bold text-error text-right">{formatCurrency(e.amount)}</td>
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
