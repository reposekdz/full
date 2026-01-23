import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { AuthProvider, useAuth, UserRole } from '@/app/contexts/AuthContext';
import { ContentProvider } from '@/app/contexts/ContentContext';
import Header from '@/app/components/Header';
import { BottomNav } from '@/app/components/BottomNav';
import HomePage from '@/app/pages/HomePage';
import SportsPage from '@/app/pages/SportsPage';
import ServicesPage from '@/app/pages/ServicesPage';
import TradesPage from '@/app/pages/TradesPage';
import ContactPage from '@/app/pages/ContactPage';
import SupportsPage from '@/app/pages/SupportsPage';
import TeamsPage from '@/app/pages/TeamsPage';
import DeveloperTeamPage from '@/app/pages/DeveloperTeamPage';
import DeveloperDetailPage from '@/app/pages/DeveloperDetailPage';
import LeadershipPage from '@/app/pages/LeadershipPage';
import LeaderDetailPage from '@/app/pages/LeaderDetailPage';
import LoginPage from '@/app/pages/LoginPage';
import ModernLoginPage from '@/app/pages/ModernLoginPage';
import RegisterPage from '@/app/pages/RegisterPage';
import ModernRegisterPage from '@/app/pages/ModernRegisterPage';
import SearchPage from '@/app/pages/SearchPage';
import RoleSelectionPage from '@/app/pages/RoleSelectionPage';
import RoleLoginPage from '@/app/pages/RoleLoginPage';
import TradesShowcasePage from '@/app/pages/TradesShowcasePage';
import AdminPage from '@/app/pages/AdminPage';
import SODTradePage from '@/app/pages/trades/SODTradePage';
import BDCTradePage from '@/app/pages/trades/BDCTradePage';
import AUTTradePage from '@/app/pages/trades/AUTTradePage';
import TradeDetailPage from '@/app/pages/TradeDetailPage';
import FootballPage from '@/app/pages/sports/FootballPage';
import VolleyballPage from '@/app/pages/sports/VolleyballPage';
import BasketballPage from '@/app/pages/sports/BasketballPage';
import FootballDetailPage from '@/app/pages/FootballDetailPage';
import VolleyballDetailPage from '@/app/pages/VolleyballDetailPage';
import NewsPage from '@/app/pages/NewsPage';
import NewsDetailPage from '@/app/pages/NewsDetailPage';
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
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
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

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    handleNavigate('role-login');
  };

  const renderPage = () => {
    // If user is logged in, always show their dashboard (never redirect to public pages)
    if (user) {
      // Only allow logout, role selection, or role login for authenticated users
      if (currentPage === 'role-selection') {
        return <RoleSelectionPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} />;
      }
      if (currentPage === 'role-login') {
        return <RoleLoginPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} selectedRole={selectedRole} />;
      }
      // For all other pages, show the dashboard
      return renderDashboard();
    }

    // For non-authenticated users, show public pages normally
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'sports':
        return <SportsPage onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
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
      case 'sport-football':
        return <FootballDetailPage onNavigate={handleNavigate} />;
      case 'sport-volleyball':
        return <VolleyballDetailPage onNavigate={handleNavigate} />;
      case 'sport-basketball':
        return <BasketballPage onNavigate={handleNavigate} />;
      case 'news':
        return <NewsPage onNavigate={handleNavigate} />;
      case currentPage.startsWith('news/') ? currentPage : '':
        const newsId = currentPage.split('/')[1];
        return <NewsDetailPage newsId={newsId} onNavigate={handleNavigate} />;
      case 'sport-athletics':
        return <SportsPage onNavigate={handleNavigate} />;
      case 'sport-handball':
        return <SportsPage onNavigate={handleNavigate} />;
      case 'sport-tennis':
        return <SportsPage onNavigate={handleNavigate} />;
      case 'contactUs':
        return <ContactPage />;
      case 'supports':
        return <SupportsPage />;
      case 'developers':
        return <DeveloperTeamPage onNavigate={handleNavigate} />;
      case currentPage.startsWith('developer/') ? currentPage : '':
        const devId = currentPage.split('/')[1];
        return <DeveloperDetailPage developerId={devId} onNavigate={handleNavigate} />;
      case 'leadership':
        return <LeadershipPage onNavigate={handleNavigate} />;
      case currentPage.startsWith('leader/') ? currentPage : '':
        const leaderId = currentPage.split('/')[1];
        return <LeaderDetailPage leaderId={leaderId} onNavigate={handleNavigate} />;
      case 'teams':
        return <TeamsPage onNavigate={handleNavigate} />;
      case 'login':
        return <ModernLoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <ModernRegisterPage onNavigate={handleNavigate} />;
      case 'role-selection':
        return <RoleSelectionPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} />;
      case 'role-login':
        return <RoleLoginPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} selectedRole={selectedRole} />;
      case 'search':
        return <SearchPage onNavigate={handleNavigate} />;
      case 'admin-panel':
        return <AdminPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-x-hidden w-full max-w-[100vw]">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSearch={() => handleNavigate('search')}
      />
      <main className="pt-14 sm:pt-16 md:pt-20 pb-16 sm:pb-20 lg:pb-0 w-full overflow-x-hidden">
        {renderPage()}
      </main>
      {!user && <Footer onNavigate={handleNavigate} />}
      {!user && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onSearch={() => handleNavigate('search')}
        />
      )}
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
