import React, { useState, useEffect } from 'react';
import { useYear } from '../context/YearContext';

export const SplitFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const { selectedYear } = useYear();
  const [formData, setFormData] = useState({
    personName: '',
    amountGiven: '',
    dateGiven: new Date().toISOString().slice(0, 10),
    purpose: '',
    notes: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        personName: initialData.personName || '',
        amountGiven: initialData.amountGiven || '',
        dateGiven: initialData.dateGiven ? new Date(initialData.dateGiven).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        purpose: initialData.purpose || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({ personName: '', amountGiven: '', dateGiven: new Date().toISOString().slice(0, 10), purpose: '', notes: '' });
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.personName.trim()) return setErrorMsg('Person name is required');
    const num = Number(formData.amountGiven);
    if (isNaN(num) || num <= 0) return setErrorMsg('Amount must be a positive number');
    if (!formData.purpose.trim()) return setErrorMsg('Purpose is required');
    onSubmit({ ...formData, amountGiven: num, year: selectedYear });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-2xl">handshake</span>
            <h3 className="font-title-md text-title-md text-on-background font-bold">
              {initialData ? 'Edit Split / Advance' : `Record Split Amount (${selectedYear})`}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="bg-error-container/60 border border-error/30 text-on-error-container p-3 rounded-lg font-label-md flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-on-background font-medium mb-1">Person Name <span className="text-error">*</span></label>
            <input type="text" required placeholder="e.g. Arun Kumar" value={formData.personName}
              onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-tertiary focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-on-background font-bold mb-1">Amount Given (₹) <span className="text-error">*</span></label>
              <input type="number" required min="1" placeholder="0" value={formData.amountGiven}
                onChange={(e) => setFormData({ ...formData, amountGiven: e.target.value })}
                className="w-full bg-surface-container-lowest border-2 border-tertiary rounded-lg px-3 py-2 font-body-md text-tertiary font-bold focus:ring-2 focus:ring-tertiary focus:outline-none" />
            </div>
            <div>
              <label className="block font-label-md text-on-background font-medium mb-1">Date Given</label>
              <input type="date" value={formData.dateGiven}
                onChange={(e) => setFormData({ ...formData, dateGiven: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-tertiary focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-on-background font-medium mb-1">Purpose <span className="text-error">*</span></label>
            <input type="text" required placeholder="e.g. Advance for Grocery Purchases"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-tertiary focus:outline-none" />
          </div>

          <div>
            <label className="block font-label-md text-on-background font-medium mb-1">Notes</label>
            <textarea rows="2" placeholder="Settlement date, additional context..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-tertiary focus:outline-none resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-tertiary text-on-tertiary font-label-md font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {initialData ? 'Update Split' : 'Record Split'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
