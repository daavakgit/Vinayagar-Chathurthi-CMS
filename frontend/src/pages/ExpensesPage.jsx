import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../context/YearContext';
import { getExpensesApi, createExpenseApi, updateExpenseApi, deleteExpenseApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { FilterBar } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Toast } from '../components/Toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#9e3d00', '#735c00', '#006a35', '#203243', '#ba1a1a', '#c64f00', '#008645', '#574500'];

export const ExpensesPage = () => {
  const { selectedYear, currentSetting } = useYear();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [largestExpense, setLargestExpense] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '' });

  const expenseCategories = currentSetting?.expenseCategories || [
    'Decoration', 'Food', 'Sound System', 'Pooja Items', 'Electricity', 'Transport', 'Printing', 'Cleaning', 'Hall/Ground', 'Other',
  ];

  const categoryList = expenseCategories.map((c) => ({ value: c, label: c }));

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = { year: selectedYear, search, category };
      const res = await getExpensesApi(params);
      if (res.success) {
        setExpenses(res.data || []);
        setTotalExpenseAmount(res.totalExpenseAmount || 0);
        setLargestExpense(res.largestExpense || 0);
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, search, category]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editData) {
        await updateExpenseApi(editData._id, formData);
        setToast({ message: 'Expense updated successfully', type: 'success' });
      } else {
        await createExpenseApi(formData);
        setToast({ message: 'Expense added successfully', type: 'success' });
      }
      setModalOpen(false);
      setEditData(null);
      loadExpenses();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExpenseApi(deleteId);
      setToast({ message: 'Expense deleted successfully', type: 'success' });
      setDeleteId(null);
      loadExpenses();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setDeleteId(null);
    }
  };

  // Category breakdown for pie chart
  const categoryMap = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value], i) => ({
    name, value, fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold">Expenses</h1>
          <p className="font-body-md text-on-surface-variant">Track all expenditures for {selectedYear} event</p>
        </div>
        <button onClick={() => { setEditData(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md font-bold shadow-sm hover:bg-secondary-container transition-all active:scale-95">
          <span className="material-symbols-outlined text-xl">add</span>
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-error font-bold">{formatCurrency(totalExpenseAmount)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Total Expenses</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-secondary font-bold">{expenses.length}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Expense Records</div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-surface border border-outline-variant rounded-xl p-4 text-center glass-card">
          <div className="font-headline-lg text-headline-lg-mobile text-primary font-bold">{formatCurrency(largestExpense)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant mt-1">Largest Expense</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Expense Table (left 2/3) */}
        <div className="md:col-span-2 space-y-4">
          <FilterBar search={search} onSearchChange={setSearch} category={category} onCategoryChange={setCategory}
            categoriesList={categoryList} onResetFilters={() => { setSearch(''); setCategory('all'); }}
            placeholder="Search by expense name or category..." />

          {loading ? (
            <LoadingSpinner />
          ) : expenses.length === 0 ? (
            <EmptyState icon="receipt_long" title="No Expenses Found" description="No expense records match your current filters."
              actionLabel="Add Expense" onAction={() => { setEditData(null); setModalOpen(true); }} />
          ) : (
            <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      {['Expense Name', 'Category', 'Amount', 'Date', 'Description', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-label-md text-label-md text-on-surface-variant font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e, idx) => (
                      <tr key={e._id} className={`border-b border-outline-variant/60 hover:bg-surface-container-low/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-surface-container-lowest/40'}`}>
                        <td className="px-4 py-3 font-label-md text-label-md text-on-background font-medium">{e.expenseName}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-[11px] font-semibold border border-secondary/20">{e.category}</span>
                        </td>
                        <td className="px-4 py-3 font-label-md text-label-md text-error font-bold">{formatCurrency(e.amount)}</td>
                        <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">{formatDate(e.date)}</td>
                        <td className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant max-w-[160px] truncate">{e.description || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => { setEditData(e); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-secondary transition-colors">
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button onClick={() => setDeleteId(e._id)} className="p-1.5 rounded-lg hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-colors">
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-outline-variant/60">
                {expenses.map((e) => (
                  <div key={e._id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-label-md text-label-md text-on-background font-bold truncate">{e.expenseName}</div>
                        <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">{e.category} · {formatDate(e.date)}</div>
                        {e.description && <div className="font-label-sm text-[11px] text-on-surface-variant mt-1 truncate max-w-[200px]">{e.description}</div>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-label-md text-label-md text-error font-bold">{formatCurrency(e.amount)}</div>
                        <div className="flex gap-1 mt-2 justify-end">
                          <button onClick={() => { setEditData(e); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-surface-container text-secondary transition-colors">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button onClick={() => setDeleteId(e._id)} className="p-1.5 rounded-lg hover:bg-error-container/30 text-error transition-colors">
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
        </div>

        {/* Pie Chart Sidebar */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-5 glass-card h-fit">
          <h2 className="font-title-md text-title-md text-on-background font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">donut_large</span>
            By Category
          </h2>
          {pieData.length === 0 ? (
            <p className="text-center text-on-surface-variant font-body-md py-8">No data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                      <span className="font-label-sm text-[11px] text-on-surface-variant truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="font-label-sm text-[11px] font-bold text-on-background">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ExpenseFormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSubmit={handleSubmit} initialData={editData} isSubmitting={submitting} />
      <ConfirmationModal isOpen={!!deleteId} title="Delete Expense" message="This expense record will be permanently deleted." confirmText="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};
