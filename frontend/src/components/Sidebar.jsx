import React from 'react';
import { NavLink } from 'react-router-dom';
import { useYear } from '../context/YearContext';

export const Sidebar = () => {
  const { selectedYear } = useYear();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'Collections', path: '/collections', icon: 'payments' },
    { label: 'Expenses', path: '/expenses', icon: 'receipt_long' },
    { label: 'Split & Advance', path: '/split', icon: 'handshake' },
    { label: 'Reports', path: '/reports', icon: 'analytics' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant shadow-sm z-40 py-md">
      <div className="px-md pb-lg">
        <div className="font-headline-lg text-headline-lg text-primary tracking-tight">
          VCMS {selectedYear}
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant mt-xs">
          Festival Finance
        </div>
      </div>

      <ul className="flex-1 px-base space-y-xs overflow-y-auto">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md transition-colors duration-200 active:scale-95 transition-transform group ${
                  isActive
                    ? 'text-primary border-r-4 border-primary bg-surface-container-high font-bold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined transition-colors ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}
                    data-icon={item.icon}
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

      <div className="p-md mt-auto border-t border-outline-variant flex items-center gap-3 bg-surface-container-lowest">
        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
          VC
        </div>
        <div>
          <div className="font-label-sm text-label-sm text-on-background font-bold">
            Vinayagar Event
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant font-normal">
            Year {selectedYear}
          </div>
        </div>
      </div>
    </nav>
  );
};
