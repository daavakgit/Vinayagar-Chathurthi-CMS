import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useYear } from '../context/YearContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { selectedYear } = useYear();
  const { logoutAdmin, adminUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/portal');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: 'dashboard', end: true },
    { label: 'Collections', path: '/admin/collections', icon: 'payments' },
    { label: 'Expenses', path: '/admin/expenses', icon: 'receipt_long' },
    { label: 'Split & Advance', path: '/admin/split', icon: 'handshake' },
    { label: 'Reports', path: '/admin/reports', icon: 'analytics' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant shadow-sm z-40 py-md">
      <div className="px-md pb-lg">
        <div className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
          VCMS {selectedYear}
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant mt-xs flex items-center justify-between">
          <span>Admin Portal</span>
          <span className="text-[10px] bg-secondary-container/40 text-secondary font-bold px-2 py-0.5 rounded-full">
            Full Access
          </span>
        </div>
      </div>

      <ul className="flex-1 px-base space-y-xs overflow-y-auto">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.end}
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

        {/* Quick Logout link under Settings */}
        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-label-md text-sm text-error/80 hover:text-error hover:bg-error-container/20 transition-all duration-150 active:scale-95 group"
          >
            <span className="material-symbols-outlined text-error/80 group-hover:text-error">
              logout
            </span>
            <span>Logout</span>
          </button>
        </li>
      </ul>

      <div className="p-md mt-auto border-t border-outline-variant space-y-2 bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center text-xs">
            ADM
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-label-sm text-xs text-on-background font-bold truncate">
              {adminUser?.email || 'Organizers Committee'}
            </div>
            <div className="font-label-sm text-[10px] text-on-surface-variant font-normal">
              Admin Session Active
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-1.5 rounded-lg border border-outline-variant text-error hover:bg-error/10 text-xs font-label-md transition-colors flex items-center justify-center gap-1 font-semibold"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span>Logout Admin</span>
        </button>
      </div>
    </nav>
  );
};
