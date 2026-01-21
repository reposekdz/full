import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { AuthProvider, useAuth, UserRole } from '@/app/contexts/AuthContext';
import { ContentProvider } from '@/app/contexts/ContentContext';
import Header from '@/app/components/Header';
import HomePage from '@/app/pages/HomePage';
import SportsPage from '@/app/pages/SportsPage';
import ServicesPage from '@/app/pages/ServicesPage';
import TradesPage from '@/app/pages/TradesPage';
import ContactPage from '@/app/pages/ContactPage';
import SupportsPage from '@/app/pages/SupportsPage';
import TeamsPage from '@/app/pages/TeamsPage';
import LoginPage from '@/app/pages/LoginPage';
import RegisterPage from '@/app/pages/RegisterPage';
import SearchPage from '@/app/pages/SearchPage';
import RoleSelectionPage from '@/app/pages/RoleSelectionPage';
import TradesShowcasePage from '@/app/pages/TradesShowcasePage';
import AdminPage from '@/app/pages/AdminPage';
import SODTradePage from '@/app/pages/trades/SODTradePage';
import BDCTradePage from '@/app/pages/trades/BDCTradePage';
import AUTTradePage from '@/app/pages/trades/AUTTradePage';
import AdminDashboard from '@/app/pages/dashboards/AdminDashboard';
import StudentDashboard from '@/app/pages/dashboards/StudentDashboard';
import ParentDashboard from '@/app/pages/dashboards/ParentDashboard';
import DirectorStudyDashboard from '@/app/pages/dashboards/DirectorStudyDashboard';
import DirectorDisciplineDashboard from '@/app/pages/dashboards/DirectorDisciplineDashboard';
import HeadMasterDashboard from '@/app/pages/dashboards/HeadMasterDashboard';
import TeacherDashboard from '@/app/pages/dashboards/TeacherDashboard';
import AccountantDashboard from '@/app/pages/dashboards/AccountantDashboard';
import StockManagerDashboard from '@/app/pages/dashboards/StockManagerDashboard';
import Footer from '@/app/components/Footer';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { user, logout, login, getRoleDashboard } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
      case 'super_admin':
        return <AdminDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'student':
        return <StudentDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'parent':
        return <ParentDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'director_study':
        return <DirectorStudyDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'director_discipline':
        return <DirectorDisciplineDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'headmaster':
        return <HeadMasterDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'teacher':
        return <TeacherDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'accountant':
        return <AccountantDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'stock_manager':
        return <StockManagerDashboard onNavigate={handleNavigate} onLogout={logout} />;
      default:
        return null;
    }
  };

  // Auto-redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && currentPage === 'home') {
      const dashboardPage = getRoleDashboard(user.role);
      handleNavigate(dashboardPage);
    }
  }, [user, currentPage, getRoleDashboard]);

  const handleRoleSelect = async (role: UserRole) => {
    const loginResult = await login('demo@school.com', 'password', role);
    if (loginResult.success && loginResult.dashboardPage) {
      // Automatically redirect to the appropriate dashboard
      handleNavigate(loginResult.dashboardPage);
    }
  };

  const renderPage = () => {
    // If user is logged in, always show their dashboard (never redirect to public pages)
    if (user) {
      // Only allow logout or role selection for authenticated users
      if (currentPage === 'role-selection') {
        return <RoleSelectionPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} />;
      }
      // For all other pages, show the dashboard
      return renderDashboard();
    }

    // For non-authenticated users, show public pages normally
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'sports':
        return <SportsPage />;
      case 'services':
        return <ServicesPage />;
      case 'trades':
        return <TradesPage />;
      case 'trades-showcase':
        return <TradesShowcasePage onNavigate={handleNavigate} />;
      case 'trade-sod':
        return <SODTradePage onNavigate={handleNavigate} />;
      case 'trade-bdc':
        return <BDCTradePage onNavigate={handleNavigate} />;
      case 'trade-aut':
        return <AUTTradePage onNavigate={handleNavigate} />;
      case 'contactUs':
        return <ContactPage />;
      case 'supports':
        return <SupportsPage />;
      case 'teams':
        return <TeamsPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'role-selection':
        return <RoleSelectionPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} />;
      case 'search':
        return <SearchPage onNavigate={handleNavigate} />;
      case 'admin-panel':
        return <AdminPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSearch={() => handleNavigate('search')}
      />
      <main className="pt-20">
        {renderPage()}
      </main>
      {!user && <Footer onNavigate={handleNavigate} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ContentProvider>
          <AppContent />
        </ContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
