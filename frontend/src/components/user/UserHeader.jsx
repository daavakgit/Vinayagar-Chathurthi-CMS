import React from 'react';
import { useNavigate } from 'react-router-dom';
import { YearSelector } from '../YearSelector';

export const UserHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile TopAppBar */}
      <header className="md:hidden flex justify-between items-center px-4 h-16 w-full fixed top-0 left-0 right-0 z-40 bg-surface border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
            VCMS
          </span>
          <span className="text-[10px] bg-tertiary-container/30 text-tertiary font-bold px-2 py-0.5 rounded-full">
            User Portal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <YearSelector className="scale-90" />
          <button
            onClick={() => navigate('/login')}
            className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer flex items-center justify-center"
            title="Admin Login / Access"
          >
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          </button>
        </div>
      </header>

      {/* Desktop TopAppBar */}
      <header className="hidden md:flex justify-between items-center h-16 fixed top-0 right-0 left-64 z-30 px-6 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <span className="font-title-md text-title-md text-on-background font-bold">
            Vinayagar Chathurthi User Portal
          </span>
          <YearSelector />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-tertiary-container/20 px-3 py-1.5 rounded-full border border-tertiary/30">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label-sm text-xs font-semibold text-tertiary">Public View Mode</span>
          </div>
          <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center font-label-md text-xs">
              UP
            </div>
            <div>
              <div className="font-label-sm text-xs text-on-background font-bold">Community Member</div>
              <div className="font-label-sm text-[10px] text-on-surface-variant">View-Only Access</div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="ml-2 px-3 py-1.5 rounded-xl border border-primary/40 text-primary hover:bg-primary hover:text-on-primary text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-xs"
              title="Admin Login Page"
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
