import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

export const RecoveryFormModal = ({ isOpen, onClose, onSubmit, split, isSubmitting = false }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const remaining = split ? (split.amountGiven - (split.totalRecovered || 0)) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const num = Number(amount);
    if (isNaN(num) || num <= 0) return setErrorMsg('Recovery amount must be a positive number');
    if (num > remaining) return setErrorMsg(`Cannot exceed remaining amount of ${formatCurrency(remaining)}`);
    onSubmit({ amount: num, date, notes });
    setAmount('');
    setNotes('');
  };

  if (!isOpen || !split) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-2xl">currency_rupee</span>
            <h3 className="font-title-md text-title-md text-on-background font-bold">Record Recovery</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Split Info Summary */}
        <div className="bg-tertiary-container/20 border border-tertiary/20 rounded-xl p-4 space-y-1">
          <p className="font-label-md text-label-md text-on-tertiary-container font-bold">{split.personName}</p>
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">{split.purpose}</p>
          <div className="flex gap-4 mt-2">
            <div>
              <span className="font-label-sm text-[11px] text-on-surface-variant block">Total Given</span>
              <span className="font-label-md text-label-md text-on-background font-bold">{formatCurrency(split.amountGiven)}</span>
            </div>
            <div>
              <span className="font-label-sm text-[11px] text-on-surface-variant block">Recovered</span>
              <span className="font-label-md text-label-md text-tertiary font-bold">{formatCurrency(split.totalRecovered || 0)}</span>
            </div>
            <div>
              <span className="font-label-sm text-[11px] text-on-surface-variant block">Remaining</span>
              <span className="font-label-md text-label-md text-error font-bold">{formatCurrency(remaining)}</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-error-container/60 border border-error/30 text-on-error-container p-3 rounded-lg font-label-md flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-on-background font-bold mb-1">
              Recovery Amount (₹) <span className="text-error">*</span>
              <span className="text-on-surface-variant font-normal ml-2 text-xs">Max: {formatCurrency(remaining)}</span>
            </label>
            <input type="number" required min="1" max={remaining} placeholder="Amount recovered"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-container-lowest border-2 border-tertiary rounded-lg px-3 py-2 font-body-md text-tertiary font-bold focus:ring-2 focus:ring-tertiary focus:outline-none" />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setAmount(remaining)}
                className="text-xs bg-surface-container-high px-2 py-1 rounded font-label-sm hover:bg-surface-container border border-outline-variant transition-colors">
                Full Amount ({formatCurrency(remaining)})
              </button>
              {remaining >= 2 && (
                <button type="button" onClick={() => setAmount(Math.floor(remaining / 2))}
                  className="text-xs bg-surface-container-high px-2 py-1 rounded font-label-sm hover:bg-surface-container border border-outline-variant transition-colors">
                  Half Amount
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block font-label-md text-on-background font-medium mb-1">Recovery Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-tertiary focus:outline-none" />
          </div>

          <div>
            <label className="block font-label-md text-on-background font-medium mb-1">Notes</label>
            <input type="text" placeholder="e.g. Received with bills and receipts"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-tertiary focus:outline-none" />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || remaining <= 0}
              className="px-6 py-2 rounded-lg bg-tertiary text-on-tertiary font-label-md font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Record Recovery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
