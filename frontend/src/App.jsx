import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { YearProvider } from './context/YearContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNavigation } from './components/MobileNavigation';
import { DashboardPage } from './pages/DashboardPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { SplitPage } from './pages/SplitPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <YearProvider>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <Header />

          {/* Main Content */}
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
    </Router>
  );
}

export default App;
