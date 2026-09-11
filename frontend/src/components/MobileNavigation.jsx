import React from 'react';
import { NavLink } from 'react-router-dom';

export const MobileNavigation = () => {
  const navItems = [
    { label: 'Home', path: '/admin', icon: 'home', end: true },
    { label: 'Collect', path: '/admin/collections', icon: 'payments' },
    { label: 'Spend', path: '/admin/expenses', icon: 'receipt_long' },
    { label: 'Material', path: '/admin/material', icon: 'inventory_2' },
    { label: 'Split', path: '/admin/split', icon: 'handshake' },
    { label: 'Stats', path: '/admin/reports', icon: 'bar_chart' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <nav className="md:hidden flex justify-around items-center h-16 pb-safe px-1 fixed bottom-0 left-0 right-0 w-full z-50 bg-surface border-t border-outline-variant shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-90 flex-1 min-w-0 ${
              isActive
                ? 'text-primary font-bold bg-primary/10 border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-lg"
                data-icon={item.icon}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-[9px] mt-0.5 truncate w-full text-center leading-none">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
