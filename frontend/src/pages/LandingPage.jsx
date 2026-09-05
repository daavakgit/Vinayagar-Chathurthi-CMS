import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardApi, getSettingsApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [dashRes, setRes] = await Promise.all([
          getDashboardApi(2026),
          getSettingsApi(),
        ]);
        if (dashRes?.success) setMetrics(dashRes.data);
        if (setRes?.success) setSettings(setRes.data);
      } catch (err) {
        console.error('Public landing page data fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  const m = metrics || {};
  const s = settings || {};

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-4 md:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center text-xl shadow-md">
            🪔
          </div>
          <div>
            <div className="font-title-md font-bold text-primary tracking-tight">PPP-VCMS</div>
            <div className="font-label-sm text-xs text-on-surface-variant">Vinayagar Chathurthi 2026</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/portal')}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>Enter Portal</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-primary-container/20 via-surface to-background px-4 md:px-12 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label-sm text-xs text-on-surface-variant font-semibold">
              Official Community Portal · Celebration 2026
            </span>
          </div>

          <h1 className="font-headline-lg text-4xl md:text-6xl font-black text-on-background tracking-tight leading-tight">
            Vinayagar Chathurthi <span className="text-primary">2026</span>
          </h1>

          <p className="font-body-lg text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto">
            Welcome to the official digital portal of Vinayagar Chathurthi celebrations. Experience complete financial transparency, event schedules, voluntary contributions, and community announcements in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/portal')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary text-on-primary font-title-md font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Enter Portal</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <a
              href="#event-highlights"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-surface border border-outline-variant text-on-surface font-title-md font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2"
            >
              <span>View Event Details</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </a>
          </div>
        </div>
      </section>

      {/* Live Financial Statistics Cards */}
      <section className="px-4 md:px-12 -mt-10 relative z-20 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card shadow-lg flex items-center justify-between">
            <div>
              <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Collection</div>
              <div className="font-headline-md text-2xl font-bold text-tertiary mt-1">
                {loading ? '...' : formatCurrency(m.totalCollection || 17000)}
              </div>
              <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">Direct + Recoveries</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/30 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
            </div>
          </div>

          <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card shadow-lg flex items-center justify-between">
            <div>
              <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Expenses</div>
              <div className="font-headline-md text-2xl font-bold text-error mt-1">
                {loading ? '...' : formatCurrency(m.totalExpenses || 2000)}
              </div>
              <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">All event costs</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error-container/30 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
          </div>

          <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card shadow-lg flex items-center justify-between">
            <div>
              <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Total Contributors</div>
              <div className="font-headline-md text-2xl font-bold text-primary mt-1">
                {loading ? '...' : `${m.totalContributors || 6} Enrolled`}
              </div>
              <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">Working, Students, General</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
          </div>

          <div className="bg-surface border border-outline-variant p-5 rounded-2xl glass-card shadow-lg flex items-center justify-between">
            <div>
              <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Event Year</div>
              <div className="font-headline-md text-2xl font-bold text-secondary mt-1">
                2026
              </div>
              <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">Active Celebration</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
          </div>
        </div>
      </section>

      {/* About & Feature Highlights Section */}
      <section id="event-highlights" className="py-16 px-4 md:px-12 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-headline-md text-3xl font-bold text-on-background">
            Transparent Festival Management
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
            PPP-VCMS provides end-to-end auditability and transparent reporting for all community members, organizers, and contributors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 rounded-2xl border border-outline-variant space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <h3 className="font-title-md font-bold text-on-background">Collection Management</h3>
            <p className="font-body-sm text-on-surface-variant">
              Track contributions across Working People, Students, and Voluntary General Public donors with instant receipts.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-outline-variant space-y-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined">receipt</span>
            </div>
            <h3 className="font-title-md font-bold text-on-background">Expense Accountability</h3>
            <p className="font-body-sm text-on-surface-variant">
              Itemized tracking of idol creation, pooja items, pandal decoration, prasadam, and cultural arrangements.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-outline-variant space-y-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <h3 className="font-title-md font-bold text-on-background">Financial Reporting</h3>
            <p className="font-body-sm text-on-surface-variant">
              Real-time balance summaries, visual charts, and downloadable PDF/Excel reports accessible to all.
            </p>
          </div>
        </div>

        {/* Festival Information Banner */}
        <div className="bg-gradient-to-r from-primary-container/30 via-surface-container to-secondary-container/30 p-8 rounded-3xl border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">Festival Information</span>
            <h3 className="font-headline-sm text-2xl font-bold text-on-background">
              {s.eventTitle || 'Vinayagar Chathurthi Grand Celebration'} 2026
            </h3>
            <p className="font-body-md text-on-surface-variant">
              Venue: {s.venue || 'Main Street Temple Ground, Community Center'} · Organized by {s.organizerName || 'Organizers Committee'}
            </p>
          </div>
          <button
            onClick={() => navigate('/portal')}
            className="px-6 py-3 rounded-xl bg-primary text-on-primary font-title-sm font-bold shadow-md hover:bg-primary/90 transition-all flex-shrink-0"
          >
            Enter Portal →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-surface-container-low border-t border-outline-variant px-4 md:px-12 py-8 text-center md:text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-title-sm font-bold text-primary">PPP-VCMS · Vinayagar Chathurthi 2026</div>
            <div className="font-label-sm text-xs text-on-surface-variant mt-1">
              Dedicated to transparent festival financial management & community harmony.
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-label-md text-on-surface-variant">
            <button onClick={() => navigate('/portal')} className="hover:text-primary transition-colors">Portal Access</button>
            <span>·</span>
            <span>Contact: {s.organizerContact || '+91 98765 43210'}</span>
            <span>·</span>
            <span>Support: support@vcms.org</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
