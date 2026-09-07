import React, { useState, useEffect } from 'react';
import { useYear } from '../context/YearContext';

export const CollectionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const { currentSetting, selectedYear } = useYear();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'working',
    expectedAmount: '',
    actualAmount: '',
    paymentStatus: 'Received',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Prefill or reset form on modal open
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        category: initialData.category || 'working',
        expectedAmount: initialData.expectedAmount !== null && initialData.expectedAmount !== undefined ? initialData.expectedAmount : '',
        actualAmount: initialData.actualAmount || '',
        paymentStatus: initialData.paymentStatus || 'Received',
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        notes: initialData.notes || '',
      });
    } else {
      const defaultWorking = currentSetting ? currentSetting.workingDefaultAmount : 2000;
      setFormData({
        name: '',
        phone: '',
        category: 'working',
        expectedAmount: defaultWorking,
        actualAmount: defaultWorking,
        paymentStatus: 'Received',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
      });
    }
    setErrorMsg('');
  }, [initialData, isOpen, currentSetting]);

  // When category changes in "Add" mode, prefill defaults
  const handleCategoryChange = (newCat) => {
    let newExpected = '';
    let newActual = '';

    if (newCat === 'working') {
      newExpected = currentSetting ? currentSetting.workingDefaultAmount : 2000;
      newActual = newExpected;
    } else if (newCat === 'student') {
      newExpected = currentSetting ? currentSetting.studentDefaultAmount : 500;
      newActual = newExpected;
    } else if (newCat === 'general_public') {
      newExpected = '';
      newActual = 1000; // Voluntary default suggestion
    }

    setFormData((prev) => ({
      ...prev,
      category: newCat,
      expectedAmount: newExpected,
      actualAmount: newActual,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Contributor name is required');
      return;
    }

    const numActual = Number(formData.actualAmount);
    if (isNaN(numActual) || numActual <= 0) {
      setErrorMsg('Actual received amount must be a positive number');
      return;
    }

    onSubmit({
      ...formData,
      year: selectedYear,
      actualAmount: numActual,
      expectedAmount: formData.category === 'general_public' || formData.expectedAmount === '' ? null : Number(formData.expectedAmount),
    });
  };

  if (!isOpen) return null;

  const workingDefault = currentSetting ? currentSetting.workingDefaultAmount : 2000;
  const studentDefault = currentSetting ? currentSetting.studentDefaultAmount : 500;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-outline-variant rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-outline-variant bg-surface-container-low/80 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
            <div className="w-9 h-9 rounded-xl bg-primary-container/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">
                {initialData ? 'edit_note' : 'add_card'}
              </span>
            </div>
            <h3 className="font-title-md text-base sm:text-lg text-on-background font-bold truncate">
              {initialData ? 'Edit Collection Record' : `New Collection (${selectedYear})`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="bg-error-container/60 border border-error/30 text-on-error-container p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="collection-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Contributor Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                Contributor Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anbu Selvan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                Phone Number <span className="text-on-surface-variant text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                Category <span className="text-error">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px] truncate"
              >
                <option value="working">Working People (Default: ₹{workingDefault})</option>
                <option value="student">School / College (Default: ₹{studentDefault})</option>
                <option value="general_public">General Public (Voluntary)</option>
              </select>
            </div>

            {/* Amounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Expected Amount */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Expected Amount (₹)
                  {formData.category === 'general_public' && (
                    <span className="text-on-surface-variant text-xs font-normal ml-1">(N/A)</span>
                  )}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  disabled={formData.category === 'general_public'}
                  placeholder={formData.category === 'general_public' ? 'N/A' : '2000'}
                  value={formData.expectedAmount}
                  onChange={(e) => setFormData({ ...formData, expectedAmount: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:bg-surface-container-high min-h-[46px]"
                />
              </div>

              {/* Actual Amount Received */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-primary mb-1.5">
                  Actual Received (₹) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  required
                  min="1"
                  placeholder="Amount paid"
                  value={formData.actualAmount}
                  onChange={(e) => setFormData({ ...formData, actualAmount: e.target.value })}
                  className="w-full bg-surface-container-lowest border-2 border-primary rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-primary font-bold focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                />
              </div>
            </div>

            {/* Payment Status & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                >
                  <option value="Received">Received (Paid)</option>
                  <option value="Pending">Pending (Pledged)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                  Collection Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none min-h-[46px]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-on-background mb-1.5">
                Notes / Receipt Details
              </label>
              <textarea
                rows="2"
                placeholder="Add optional payment details or notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-on-background focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-outline-variant bg-surface-container-low/50 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-label-md text-sm font-semibold hover:bg-surface-container transition-colors min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="collection-form"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
            >
              {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{initialData ? 'Update Collection' : 'Save Collection'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
