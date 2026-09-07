import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { loginAdmin, loading: adminLoginLoading, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in as admin, redirect to /admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both Admin email and password.');
      return;
    }

    const result = await loginAdmin(cleanEmail, cleanPassword);
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setErrorMsg(result.message || 'Invalid Admin credentials. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between font-sans px-4 py-8">
      {/* Top Navigation Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <button
          onClick={() => navigate('/portal')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md transition-colors cursor-pointer text-xs md:text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to User Portal</span>
        </button>
        <div className="font-title-sm font-bold text-primary">PPP-VCMS</div>
      </div>

      {/* Admin Login Card */}
      <div className="max-w-md mx-auto w-full my-auto py-6">
        <div className="bg-surface border-2 border-primary/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          {/* Header Emblem */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mx-auto flex items-center justify-center border border-secondary/20 shadow-sm">
              <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <h1 className="font-headline-sm text-2xl md:text-3xl font-bold text-on-background pt-2">
              Admin Login
            </h1>
            <p className="font-body-sm text-xs md:text-sm text-on-surface-variant">
              Sign in to manage event records
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-error-container/40 border border-error/40 text-on-error-container text-xs flex items-center gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-error text-lg flex-shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1.5">
                Admin Email / Username
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@vcms.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-lg pointer-events-none">
                  mail
                </span>
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-xs font-semibold text-on-surface-variant mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-lg pointer-events-none">
                  lock
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-on-surface-variant hover:text-on-background transition-colors focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-lg block">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-on-surface-variant/80">Authorized organizers only</span>
              <button
                type="button"
                onClick={() => alert('Please contact the committee super admin to reset your admin password.')}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full py-3.5 rounded-2xl bg-secondary text-on-secondary font-title-md font-bold hover:bg-secondary/90 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
            >
              {adminLoginLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Login to Admin Dashboard</span>
                  <span className="material-symbols-outlined">lock_open</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center font-label-sm text-xs text-on-surface-variant">
        PPP-VCMS 2026 · Secure Admin Gateway
      </div>
    </div>
  );
};
