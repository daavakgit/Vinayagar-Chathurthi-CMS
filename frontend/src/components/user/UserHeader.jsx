import React from 'react';
import { YearSelector } from '../YearSelector';

export const UserHeader = () => {
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
          </div>
        </div>
      </header>
    </>
  );
};
