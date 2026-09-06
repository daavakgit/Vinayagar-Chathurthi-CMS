import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { YearProvider } from './context/YearContext';

// Existing Admin Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNavigation } from './components/MobileNavigation';
import { DashboardPage } from './pages/DashboardPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { SplitPage } from './pages/SplitPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

// New Public & User Components
import { SplashScreen } from './components/SplashScreen';
import { LandingPage } from './pages/LandingPage';
import { PortalEntryPage } from './pages/PortalEntryPage';
import { UserLayout } from './pages/user/UserLayout';
import { UserHomePage } from './pages/user/UserHomePage';
import { UserCollectionsPage } from './pages/user/UserCollectionsPage';
import { UserExpensesPage } from './pages/user/UserExpensesPage';
import { UserSplitPage } from './pages/user/UserSplitPage';
import { UserReportsPage } from './pages/user/UserReportsPage';
import { UserSettingsPage } from './pages/user/UserSettingsPage';

// Protected Admin System Layout Wrapper
const AdminLayout = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <YearProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Header />

        {/* Existing Admin Main Content */}
        <main className="md:ml-64 pt-16 pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/split" element={<SplitPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>

        <MobileNavigation />
      </div>
    </YearProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Initial Entry Experience: Vinayagar Splash Screen (2000ms -> /portal) */}
          <Route path="/" element={<SplashScreen />} />

          {/* Existing Public Landing Page */}
          <Route path="/landing" element={<LandingPage />} />

          {/* Portal Selector & Existing Admin Login Entry Page */}
          <Route path="/portal" element={<PortalEntryPage />} />

          {/* User Portal Experience (View-Only) */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/user/home" replace />} />
            <Route path="home" element={<UserHomePage />} />
            <Route path="collections" element={<UserCollectionsPage />} />
            <Route path="expenses" element={<UserExpensesPage />} />
            <Route path="split" element={<UserSplitPage />} />
            <Route path="reports" element={<UserReportsPage />} />
            <Route path="settings" element={<UserSettingsPage />} />
          </Route>

          {/* Existing Protected Admin Portal */}
          <Route path="/admin/*" element={<AdminLayout />} />

          {/* Backward Compatibility Redirects */}
          <Route path="/collections" element={<Navigate to="/admin/collections" replace />} />
          <Route path="/expenses" element={<Navigate to="/admin/expenses" replace />} />
          <Route path="/split" element={<Navigate to="/admin/split" replace />} />
          <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
          <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
