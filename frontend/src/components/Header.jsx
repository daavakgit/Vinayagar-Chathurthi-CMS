import React from 'react';
import { YearSelector } from './YearSelector';

export const Header = () => {
  return (
    <>
      {/* Mobile TopAppBar */}
      <header className="md:hidden flex justify-between items-center px-margin-mobile h-16 w-full fixed top-0 z-40 bg-surface border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
            VCMS
          </span>
          <YearSelector className="scale-90" />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined text-primary" data-icon="notifications">
              notifications
            </span>
          </button>
        </div>
      </header>

      {/* Desktop TopAppBar */}
      <header className="hidden md:flex justify-between items-center h-16 fixed top-0 right-0 left-64 z-30 px-margin-desktop bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <span className="font-title-md text-title-md text-on-background">
            Vinayagar Chathurthi CMS
          </span>
          <YearSelector />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Live Event Mode</span>
          </div>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined text-primary" data-icon="notifications">
              notifications
            </span>
          </button>
          <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary font-bold flex items-center justify-center font-label-md text-label-md">
              OU
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-on-background font-bold">Organizer</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant text-[10px]">Admin</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
