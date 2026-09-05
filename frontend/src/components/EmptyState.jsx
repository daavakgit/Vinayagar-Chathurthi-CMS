import React from 'react';

export const EmptyState = ({
  icon = 'inbox',
  title = 'No records found',
  description = 'There are no items matching your current filters for this year.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-outline-variant rounded-2xl shadow-sm my-6">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 text-primary">
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <h3 className="font-title-md text-title-md text-on-background mb-1">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary text-on-primary hover:bg-primary-container px-5 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
