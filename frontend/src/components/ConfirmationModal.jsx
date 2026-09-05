import React from 'react';

export const ConfirmationModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to delete this record?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-2xl border border-outline-variant max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-error">
          <div className="p-3 bg-error-container/50 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-error">warning</span>
          </div>
          <h3 className="font-title-md text-title-md text-on-background">{title}</h3>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg font-label-md text-label-md text-on-primary shadow-sm transition-transform active:scale-95 ${
              isDanger
                ? 'bg-error hover:bg-error/90'
                : 'bg-primary hover:bg-primary-container'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
