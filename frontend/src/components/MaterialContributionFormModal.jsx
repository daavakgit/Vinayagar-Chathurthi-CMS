import React, { useState, useEffect } from 'react';
import { useYear } from '../context/YearContext';

export const MaterialContributionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const { selectedYear } = useYear();

  const categories = [
    'Food / Annadhanam',
    'Pooja Supplies',
    'Decoration',
    'Lighting / Electrical',
    'Utensils / Equipment',
    'Prasadam Materials',
    'Clothing / Vastram',
    'Flowers / Garlands',
    'Other',
  ];

  const statuses = ['Received', 'Pledged', 'Used'];

  const [formData, setFormData] = useState({
    donorName: '',
    phone: '',
    itemName: '',
    quantity: '',
    estimatedValue: '',
    category: categories[0],
    status: 'Received',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const [customCategory, setCustomCategory] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      const isExistingCategory = categories.includes(initialData.category);
      setUseCustom(!isExistingCategory);
      setCustomCategory(isExistingCategory ? '' : initialData.category || '');
      setFormData({
        donorName: initialData.donorName || '',
        phone: initialData.phone || '',
        itemName: initialData.itemName || '',
        quantity: initialData.quantity || '',
        estimatedValue: initialData.estimatedValue !== undefined && initialData.estimatedValue !== null ? initialData.estimatedValue : '',
        category: isExistingCategory ? initialData.category : categories[0],
        status: initialData.status || 'Received',
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        donorName: '',
        phone: '',
        itemName: '',
        quantity: '',
        estimatedValue: '',
        category: categories[0],
        status: 'Received',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setCustomCategory('');
      setUseCustom(false);
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.donorName.trim()) {
      setErrorMsg('Donor name is required');
      return;
    }

    if (!formData.itemName.trim()) {
      setErrorMsg('Item name is required');
      return;
    }

    if (!formData.quantity.trim()) {
      setErrorMsg('Quantity is required (e.g., 25 kg, 2 bags)');
      return;
    }

    const finalCategory = useCustom ? customCategory.trim() : formData.category;
    if (!finalCategory) {
      setErrorMsg('Please select or enter a category');
      return;
    }

    const numValue = formData.estimatedValue !== '' ? Number(formData.estimatedValue) : 0;
    if (isNaN(numValue) || numValue < 0) {
      setErrorMsg('Estimated value must be a valid positive number or zero');
      return;
    }

    onSubmit({
      ...formData,
      category: finalCategory,
      estimatedValue: numValue,
      year: selectedYear,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-outline-variant rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-outline-variant bg-surface-container-low/80 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
            <div className="w-9 h-9 rounded-xl bg-tertiary-container/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-tertiary text-xl">inventory_2</span>
            </div>
            <h3 className="font-title-md text-base sm:text-lg text-on-background font-bold truncate">
              {initialData ? 'Edit Material Contribution' : `New Material Contribution (${selectedYear})`}
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

          <form id="material-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Donor Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Item Name / Description <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raw Rice Bag (50kg)"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Quantity <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 bags, 50 kg, 10 Litres"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Estimated Value (₹) <span className="text-on-surface-variant font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="0.00"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Category <span className="text-error">*</span>
                </label>
                <div className="flex gap-2">
                  {!useCustom ? (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Custom category..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setUseCustom(!useCustom)}
                    className="px-3 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container text-xs sm:text-sm font-medium transition-colors min-h-[46px]"
                  >
                    {useCustom ? 'List' : 'Custom'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Contribution Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                Notes / Additional Details
              </label>
              <textarea
                rows="2"
                placeholder="Remarks, delivery note, sponsor details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none resize-none"
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
              form="material-form"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
            >
              {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{initialData ? 'Update Contribution' : 'Save Contribution'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
