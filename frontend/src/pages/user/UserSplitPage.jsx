import React, { useState, useEffect, useCallback } from 'react';
import { useYear } from '../../context/YearContext';
import { getSplitsApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const UserSplitPage = () => {
  const { selectedYear } = useYear();
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSplits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSplitsApi({ year: selectedYear });
      if (res?.success) {
        setSplits(res.data || []);
      }
    } catch (err) {
      console.error('Error loading splits:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => { loadSplits(); }, [loadSplits]);

  // Derived metrics
  const totalGiven = splits.reduce((acc, s) => acc + (s.amountGiven || 0), 0);
  const totalRecovered = splits.reduce((acc, s) => acc + (s.totalRecovered || 0), 0);
  const totalPending = Math.max(0, totalGiven - totalRecovered);
  const recoveryPct = totalGiven > 0 ? Math.min(100, Math.round((totalRecovered / totalGiven) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-background">
          Split Advances & Recoveries
        </h1>
        <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
          Vinayagar Chathurthi {selectedYear} · Advance Settlement Ledger (View Only)
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Advances Given</div>
          <div className="font-headline-md text-2xl font-bold text-primary">{formatCurrency(totalGiven)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">{splits.length} Persons Allocated</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Recovered</div>
          <div className="font-headline-md text-2xl font-bold text-[#008645]">{formatCurrency(totalRecovered)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Settled back into collection</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Amount Pending</div>
          <div className="font-headline-md text-2xl font-bold text-error">{formatCurrency(totalPending)}</div>
          <div className="font-label-sm text-[11px] text-on-surface-variant">Yet to be recovered</div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card space-y-1">
          <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Recovery Progress</div>
          <div className="font-headline-md text-2xl font-bold text-tertiary">{recoveryPct}%</div>
          <div className="w-full bg-surface-container rounded-full h-2 mt-2 overflow-hidden">
            <div className="bg-tertiary h-full rounded-full transition-all" style={{ width: `${recoveryPct}%` }} />
          </div>
        </div>
      </div>

      {/* Split Ledger Table */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-title-md font-bold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[#008645] text-xl">handshake</span>
            Split Advance Ledger
          </h2>
          <span className="text-xs bg-[#008645]/10 text-[#008645] font-bold px-2.5 py-1 rounded-full">
            Read Only Access
          </span>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSpinner label="Loading split records..." />
          </div>
        ) : splits.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant text-sm">
            No split advance records found for {selectedYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant">
                <tr>
                  <th className="p-3.5">Person Name</th>
                  <th className="p-3.5">Purpose</th>
                  <th className="p-3.5">Amount Given</th>
                  <th className="p-3.5">Recovered</th>
                  <th className="p-3.5">Pending</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {splits.map((s) => {
                  const pending = Math.max(0, (s.amountGiven || 0) - (s.totalRecovered || 0));
                  return (
                    <tr key={s._id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-3.5 font-bold text-on-background">{s.personName}</td>
                      <td className="p-3.5 text-on-surface-variant">{s.purpose || '—'}</td>
                      <td className="p-3.5 font-bold text-primary">{formatCurrency(s.amountGiven)}</td>
                      <td className="p-3.5 font-bold text-[#008645]">{formatCurrency(s.totalRecovered || 0)}</td>
                      <td className="p-3.5 font-bold text-error">{formatCurrency(pending)}</td>
                      <td className="p-3.5 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.status === 'Completed'
                            ? 'bg-[#008645]/20 text-[#008645]'
                            : 'bg-error-container/30 text-error'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
