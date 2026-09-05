import React from 'react';
import { Outlet } from 'react-router-dom';
import { YearProvider } from '../../context/YearContext';
import { UserSidebar } from '../../components/user/UserSidebar';
import { UserHeader } from '../../components/user/UserHeader';
import { UserMobileNavigation } from '../../components/user/UserMobileNavigation';

export const UserLayout = () => {
  return (
    <YearProvider>
      <div className="min-h-screen bg-background text-on-background">
        <UserSidebar />
        <UserHeader />

        {/* Main Content Area */}
        <main className="md:ml-64 pt-16 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <Outlet />
          </div>
        </main>

        <UserMobileNavigation />
      </div>
    </YearProvider>
  );
};
