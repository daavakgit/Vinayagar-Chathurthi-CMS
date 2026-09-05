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
        expectedAmount: initialData.expectedAmount !== null ? initialData.expectedAmount : '',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-outline-variant rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              {initialData ? 'edit_note' : 'add_card'}
            </span>
            <h3 className="font-title-md text-title-md text-on-background font-bold">
              {initialData ? 'Edit Collection Record' : `New Collection (${selectedYear})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
          >
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
          {/* Contributor Name */}
          <div>
            <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
              Contributor Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Anbu Selvan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
              Phone Number <span className="text-on-surface-variant text-xs">(Optional)</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
              Category <span className="text-error">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="working">
                Working People (Year Default: ₹{currentSetting ? currentSetting.workingDefaultAmount : 2000})
              </option>
              <option value="student">
                School / College Student (Year Default: ₹{currentSetting ? currentSetting.studentDefaultAmount : 500})
              </option>
              <option value="general_public">General Public (Voluntary Contribution)</option>
            </select>
          </div>

          {/* Amounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expected Amount */}
            <div>
              <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
                Expected Amount (₹)
                {formData.category === 'general_public' && (
                  <span className="text-on-surface-variant text-xs font-normal ml-1">(N/A)</span>
                )}
              </label>
              <input
                type="number"
                disabled={formData.category === 'general_public'}
                placeholder={formData.category === 'general_public' ? 'N/A' : '2000'}
                value={formData.expectedAmount}
                onChange={(e) => setFormData({ ...formData, expectedAmount: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:bg-surface-container-high"
              />
            </div>

            {/* Actual Amount Received */}
            <div>
              <label className="block font-label-md text-label-md text-on-background font-bold mb-1">
                Actual Amount Received (₹) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Amount paid"
                value={formData.actualAmount}
                onChange={(e) => setFormData({ ...formData, actualAmount: e.target.value })}
                className="w-full bg-surface-container-lowest border-2 border-primary rounded-lg px-3 py-2 font-body-md text-body-md text-primary font-bold focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <p className="font-label-sm text-[11px] text-on-surface-variant mt-1">
                Amount received for event metrics
              </p>
            </div>
          </div>

          {/* Payment Status & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Received">Received (Paid)</option>
                <option value="Pending">Pending (Pledged)</option>
              </select>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
                Collection Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-label-md text-label-md text-on-background font-medium mb-1">
              Notes / Receipt Details
            </label>
            <textarea
              rows="2"
              placeholder="Add optional payment details or notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            ></textarea>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              <span>{initialData ? 'Update Collection' : 'Save Collection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
