import React from 'react';
import { useNavigate } from 'react-router-dom';
import { YearSelector } from './YearSelector';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const navigate = useNavigate();
  const { logoutAdmin } = useAuth();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/portal');
  };

  return (
    <>
      {/* Mobile TopAppBar */}
      <header className="md:hidden flex justify-between items-center px-margin-mobile h-16 w-full fixed top-0 z-40 bg-surface border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
            VCMS
          </span>
          <span className="text-[10px] bg-secondary-container/40 text-secondary font-bold px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <YearSelector className="scale-90" />
          <button
            onClick={handleLogout}
            title="Logout Admin"
            className="p-1.5 text-error hover:bg-error-container/20 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      {/* Desktop TopAppBar */}
      <header className="hidden md:flex justify-between items-center h-16 fixed top-0 right-0 left-64 z-30 px-margin-desktop bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <span className="font-title-md text-title-md text-on-background font-bold">
            Vinayagar Chathurthi Admin CMS
          </span>
          <YearSelector />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              Live Admin Mode
            </span>
          </div>
          <div className="flex items-center gap-3 border-l border-outline-variant pl-4">
            <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center font-label-md text-xs">
              ADM
            </div>
            <div>
              <div className="font-label-sm text-xs text-on-background font-bold">Organizer Admin</div>
              <div className="font-label-sm text-[10px] text-on-surface-variant">Full Access</div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 rounded-xl border border-error/40 text-error hover:bg-error hover:text-on-error text-xs font-label-md transition-all active:scale-95 flex items-center gap-1 font-bold shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
