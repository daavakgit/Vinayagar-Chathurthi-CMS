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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-outline-variant rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-outline-variant bg-surface-container-low/80 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
            <div className="w-9 h-9 rounded-xl bg-secondary-container/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-xl">receipt_long</span>
            </div>
            <h3 className="font-title-md text-base sm:text-lg text-on-background font-bold truncate">
              {initialData ? 'Edit Expense' : `New Expense (${selectedYear})`}
            </h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors flex-shrink-0" aria-label="Close">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="bg-error-container/60 border border-error/30 text-on-error-container p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                Expense Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pandal Decoration Setup"
                value={formData.expenseName}
                onChange={(e) => setFormData({ ...formData, expenseName: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-secondary focus:outline-none min-h-[46px]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                Category <span className="text-error">*</span>
              </label>
              <div className="flex gap-2">
                {!useCustom ? (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-secondary focus:outline-none min-h-[46px]"
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
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-secondary focus:outline-none min-h-[46px]"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setUseCustom(!useCustom)}
                  className="px-3.5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container text-xs sm:text-sm font-medium transition-colors min-h-[46px]"
                >
                  {useCustom ? 'List' : 'Custom'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-secondary mb-1.5">
                  Amount (₹) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  required
                  min="1"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-surface-container-lowest border-2 border-secondary rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-secondary font-bold focus:ring-2 focus:ring-secondary focus:outline-none min-h-[46px]"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Expense Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-secondary focus:outline-none min-h-[46px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                Description / Vendor Details
              </label>
              <textarea
                rows="2"
                placeholder="Vendor name, receipt no., details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-secondary focus:outline-none resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-5 border-t border-outline-variant bg-surface-container-low/50 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-colors min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="expense-form"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-secondary text-on-secondary text-sm font-bold shadow-md hover:bg-secondary-container active:scale-95 transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
            >
              {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{initialData ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
