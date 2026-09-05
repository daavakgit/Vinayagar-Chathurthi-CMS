import React, { useEffect } from 'react';

export const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 animate-bounce">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${
          isError
            ? 'bg-error-container text-on-error-container border-error/30'
            : 'bg-tertiary-container text-on-tertiary-container border-tertiary/30'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">
          {isError ? 'error' : 'check_circle'}
        </span>
        <span className="font-label-md text-label-md font-semibold">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity p-1 rounded-full"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};
