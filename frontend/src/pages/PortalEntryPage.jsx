import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PortalEntryPage = () => {
  const navigate = useNavigate();
  const { loginAdmin, loading: adminLoginLoading } = useAuth();

  // Admin login form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = adminEmail.trim();
    const cleanPassword = adminPassword.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both Admin email and password.');
      return;
    }

    const result = await loginAdmin(cleanEmail, cleanPassword);
    if (result.success) {
      navigate('/admin');
    } else {
      setErrorMsg(result.message || 'Invalid Admin credentials.');
    }
  };

  const handleUserEntry = () => {
    navigate('/user');
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between font-sans px-4 py-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Landing Page</span>
        </button>
        <div className="font-title-sm font-bold text-primary">PPP-VCMS Portal</div>
      </div>

      {/* Main Entry Cards Container */}
      <div className="max-w-4xl mx-auto w-full my-auto py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-background">
            Select Portal Access
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
            Choose how you wish to access the Vinayagar Chathurthi 2026 Management System.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. USER PORTAL CARD (Direct Entry, No Password) */}
          <div className="bg-surface border-2 border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl bento-hover relative overflow-hidden group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-3xl">group</span>
              </div>
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-tertiary bg-tertiary-container/30 px-3 py-1 rounded-full mb-2">
                  Public Access · View Only
                </span>
                <h2 className="font-headline-sm text-2xl font-bold text-on-background">User Portal</h2>
                <p className="font-body-sm text-on-surface-variant mt-2">
                  Direct access for community members to inspect collections, expenses, split recoveries, visual charts, and festival reports.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-base">check_circle</span>
                  <span>Instant access without credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-base">check_circle</span>
                  <span>View collections, expenses & reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-base">check_circle</span>
                  <span>Mobile-friendly responsive views</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={handleUserEntry}
                className="w-full py-4 rounded-2xl bg-primary text-on-primary font-title-md font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter User Dashboard</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* 2. ADMIN PORTAL CARD (Secured Login) */}
          <div className="bg-surface border-2 border-outline-variant rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl bento-hover relative">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-secondary bg-secondary-container/30 px-3 py-1 rounded-full mb-2">
                  Organizers · Full CRUD Access
                </span>
                <h2 className="font-headline-sm text-2xl font-bold text-on-background">Admin Portal</h2>
                <p className="font-body-sm text-on-surface-variant mt-2">
                  Secured area for festival committee organizers to add, edit, delete, and manage financial records.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-on-error-container text-xs flex items-center gap-2 animate-fade-in">
                  <span className="material-symbols-outlined text-base text-error">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@vcms.org"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-background text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-background text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminLoginLoading}
                  className="w-full py-3.5 rounded-2xl bg-secondary text-on-secondary font-title-md font-bold hover:bg-secondary/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  {adminLoginLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Admin Login</span>
                      <span className="material-symbols-outlined">lock_open</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center font-label-sm text-xs text-on-surface-variant">
        PPP-VCMS 2026 · Secure Dual-Portal Architecture
      </div>
    </div>
  );
};
