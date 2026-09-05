import React from 'react';

export const LoadingSpinner = ({ label = 'Loading event data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="w-12 h-12 border-4 border-primary-container border-t-primary rounded-full animate-spin"></div>
      <p className="font-label-md text-label-md text-on-surface-variant font-medium animate-pulse">
        {label}
      </p>
    </div>
  );
};
