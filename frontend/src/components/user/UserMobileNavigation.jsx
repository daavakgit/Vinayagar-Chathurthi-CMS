import React from 'react';
import { NavLink } from 'react-router-dom';

export const UserMobileNavigation = () => {
  const navItems = [
    { label: 'Home', path: '/user/home', icon: 'home' },
    { label: 'Collections', path: '/user/collections', icon: 'payments' },
    { label: 'Expenses', path: '/user/expenses', icon: 'receipt_long' },
    { label: 'Split', path: '/user/split', icon: 'handshake' },
    { label: 'Reports', path: '/user/reports', icon: 'bar_chart' },
    { label: 'Settings', path: '/user/settings', icon: 'settings' },
  ];

  return (
    <nav className="md:hidden flex justify-around items-center h-16 pb-safe px-1 fixed bottom-0 left-0 right-0 w-full z-50 bg-surface border-t border-outline-variant shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 active:scale-90 min-w-0 ${
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
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-[9px] sm:text-[10px] mt-0.5 truncate max-w-[52px]">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
