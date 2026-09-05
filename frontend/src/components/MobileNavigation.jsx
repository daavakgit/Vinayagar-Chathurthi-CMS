import React from 'react';
import { NavLink } from 'react-router-dom';

export const MobileNavigation = () => {
  const navItems = [
    { label: 'Home', path: '/admin', icon: 'home', end: true },
    { label: 'Collect', path: '/admin/collections', icon: 'payments' },
    { label: 'Spend', path: '/admin/expenses', icon: 'receipt_long' },
    { label: 'Split', path: '/admin/split', icon: 'handshake' },
    { label: 'Stats', path: '/admin/reports', icon: 'bar_chart' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <nav className="md:hidden flex justify-around items-center h-16 pb-safe px-2 fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 active:scale-90 ${
              isActive
                ? 'text-primary font-bold bg-primary/10 border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-xl"
                data-icon={item.icon}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-[10px] mt-0.5">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
