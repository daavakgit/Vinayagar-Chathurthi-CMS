import React, { useState, useEffect } from 'react';
import { useYear } from '../context/YearContext';

export const ExpenseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const { currentSetting, selectedYear } = useYear();

  const defaultCategories = [
    'Decoration', 'Food', 'Sound System', 'Pooja Items',
    'Electricity', 'Transport', 'Printing', 'Cleaning', 'Hall/Ground', 'Other',
  ];

  const expenseCategories = currentSetting?.expenseCategories?.length > 0
    ? currentSetting.expenseCategories
    : defaultCategories;

  const [formData, setFormData] = useState({
    expenseName: '',
    category: expenseCategories[0] || 'Decoration',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });

  const [customCategory, setCustomCategory] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      const isExisting = expenseCategories.includes(initialData.category);
      setUseCustom(!isExisting);
      setCustomCategory(isExisting ? '' : initialData.category);
      setFormData({
        expenseName: initialData.expenseName || '',
        category: isExisting ? initialData.category : expenseCategories[0],
        amount: initialData.amount || '',
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        expenseName: '',
        category: expenseCategories[0] || 'Other',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        description: '',
      });
      setCustomCategory('');
      setUseCustom(false);
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.expenseName.trim()) {
      setErrorMsg('Expense name is required');
      return;
    }

    const finalCategory = useCustom ? customCategory.trim() : formData.category;
    if (!finalCategory) {
      setErrorMsg('Please select or enter a category');
      return;
    }

    const numAmount = Number(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Expense amount must be a positive number');
      return;
    }

    onSubmit({
      ...formData,
      category: finalCategory,
      amount: numAmount,
      year: selectedYear,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">receipt_long</span>
            <h3 className="font-title-md text-title-md text-on-background font-bold">
              {initialData ? 'Edit Expense' : `New Expense (${selectedYear})`}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="bg-error-container/60 border border-error/30 text-on-error-container p-3 rounded-lg font-label-md text-label-md flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
              Expense Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pandal Decoration Setup"
              value={formData.expenseName}
              onChange={(e) => setFormData({ ...formData, expenseName: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
              Category <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              {!useCustom ? (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md focus:ring-2 focus:ring-secondary focus:outline-none"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter custom category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              )}
              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors"
              >
                {useCustom ? 'List' : 'Custom'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-on-background font-bold mb-1">
                Amount (₹) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-surface-container-lowest border-2 border-secondary rounded-lg px-3 py-2 font-body-md text-body-md text-secondary font-bold focus:ring-2 focus:ring-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
                Expense Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md focus:ring-2 focus:ring-secondary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
              Description / Vendor Details
            </label>
            <textarea
              rows="2"
              placeholder="Vendor name, receipt no., details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md focus:ring-2 focus:ring-secondary focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-secondary text-on-secondary font-label-md font-bold hover:bg-secondary-container shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {initialData ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
