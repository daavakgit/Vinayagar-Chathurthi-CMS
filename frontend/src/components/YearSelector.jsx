import React from 'react';
import { useYear } from '../context/YearContext';

export const YearSelector = ({ className = '' }) => {
  const { selectedYear, setSelectedYear, availableYears } = useYear();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="material-symbols-outlined text-primary text-xl" data-icon="calendar_month">
        calendar_month
      </span>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 font-label-md text-label-md text-primary font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer transition-all shadow-sm"
      >
        {availableYears.map((yr) => (
          <option key={yr} value={yr}>
            {yr} Event
          </option>
        ))}
      </select>
    </div>
  );
};
