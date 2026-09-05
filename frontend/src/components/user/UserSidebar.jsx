import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useYear } from '../../context/YearContext';

export const UserSidebar = () => {
  const { selectedYear } = useYear();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/user/home', icon: 'home' },
    { label: 'Collections', path: '/user/collections', icon: 'payments' },
    { label: 'Expenses', path: '/user/expenses', icon: 'receipt_long' },
    { label: 'Split & Recovery', path: '/user/split', icon: 'handshake' },
    { label: 'Reports', path: '/user/reports', icon: 'analytics' },
    { label: 'Settings', path: '/user/settings', icon: 'settings' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant shadow-sm z-40 py-md">
      <div className="px-md pb-lg">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪔</span>
          <div className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            PPP-VCMS
          </div>
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant mt-xs flex items-center justify-between">
          <span>Public User Portal</span>
          <span className="text-[10px] bg-tertiary-container/40 text-tertiary font-bold px-2 py-0.5 rounded-full">View Only</span>
        </div>
      </div>

      <ul className="flex-1 px-base space-y-xs overflow-y-auto">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-label-md text-sm transition-all duration-150 active:scale-95 group ${
                  isActive
                    ? 'text-primary bg-primary/10 border-l-4 border-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined transition-colors ${
                      isActive ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-primary'
                    }`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="p-md mt-auto border-t border-outline-variant space-y-3 bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            UP
          </div>
          <div>
            <div className="font-label-sm text-label-sm text-on-background font-bold">
              Community Member
            </div>
            <div className="font-label-sm text-[10px] text-on-surface-variant font-normal">
              Year {selectedYear} · View Only
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/portal')}
          className="w-full py-2 rounded-xl border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-surface-container text-xs font-label-md transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span>Switch Portal</span>
        </button>
      </div>
    </nav>
  );
};
