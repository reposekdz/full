import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { AuthProvider, useAuth, UserRole } from '@/app/contexts/AuthContext';
import { ContentProvider } from '@/app/contexts/ContentContext';
import Header from '@/app/components/Header';
import { BottomNav } from '@/app/components/BottomNav';
import HomePage from '@/app/pages/HomePage';
import SportsPage from '@/app/pages/SportsPage';
import EnhancedSportsPage from '@/app/pages/EnhancedSportsPage';
import ServicesPage from '@/app/pages/ServicesPage';
import TradesPage from '@/app/pages/TradesPage';
import ContactPage from '@/app/pages/ContactPage';
import SupportsPage from '@/app/pages/SupportsPage';
import ModernSupportPage from '@/app/pages/ModernSupportPage';
import AdvancedSupportPage from '@/app/pages/AdvancedSupportPage';
import TeamsPage from '@/app/pages/TeamsPage';
import DeveloperTeamPage from '@/app/pages/DeveloperTeamPage';
import DeveloperDetailPage from '@/app/pages/DeveloperDetailPage';
import DevelopersAdmin from '@/app/components/developers/DevelopersAdmin';
import MusoniDetailPage from '@/app/pages/MusoniDetailPage';
import ZamiruDetailPage from '@/app/pages/ZamiruDetailPage';
import NiyonsengaDetailPage from '@/app/pages/NiyonsengaDetailPage';
import LeadershipPage from '@/app/pages/LeadershipPage';
import LeaderDetailPage from '@/app/pages/LeaderDetailPage';
import ModernLoginPage from '@/app/pages/ModernLoginPage';
import ModernRegisterPage from '@/app/pages/ModernRegisterPage';
import SearchPage from '@/app/pages/SearchPage';
import RoleSelectionPage from '@/app/pages/RoleSelectionPage';
import RoleLoginPage from '@/app/pages/RoleLoginPage';
import TradesShowcasePage from '@/app/pages/TradesShowcasePage';
import ModernTradesPage from '@/app/pages/ModernTradesPage';
import TradeDetailPage from '@/app/pages/TradeDetailPage';
import AdminPage from '@/app/pages/AdminPage';
import SODTradePage from '@/app/pages/trades/SODTradePage';
import BDCTradePage from '@/app/pages/trades/BDCTradePage';
import AUTTradePage from '@/app/pages/trades/AUTTradePage';

import BasketballPage from '@/app/pages/sports/BasketballPage';
import FootballDetailPage from '@/app/pages/FootballDetailPage';
import VolleyballDetailPage from '@/app/pages/VolleyballDetailPage';
import TeamDetailPage from '@/app/pages/TeamDetailPage';
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
import ResponsesPage from '@/app/pages/ResponsesPage';
import StudentsManagementPage from '@/app/pages/StudentsManagementPage';
import PaymentsManagement from '@/app/pages/accountant/PaymentsManagement';
import { ExpensesManagement, InvoicesManagement } from '@/app/pages/accountant/AllAccountantPages';
import EnhancedStudentPayments from '@/app/pages/accountant/EnhancedStudentPayments';
import BudgetsManagement from '@/app/pages/accountant/BudgetsManagementPage';
import SalariesManagement from '@/app/pages/accountant/SalariesManagementPage';
import TransactionsManagement from '@/app/pages/accountant/TransactionsManagementPage';
import FinancialReports from '@/app/pages/accountant/FinancialReportsPage';
import TimetableView from '@/app/pages/accountant/TimetableView';
import Footer from '@/app/components/Footer';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    // Restore page from localStorage on mount
    const saved = localStorage.getItem('app_current_page');
    return saved || 'home';
  });
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { user, logout, getRoleDashboard } = useAuth();

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('app_current_page', currentPage);
  }, [currentPage]);

  // Restore scroll position after page loads
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('app_scroll_position');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem('app_scroll_position');
      }, 100);
    }
  }, []);

  // Auto-logout on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        logout();
        localStorage.removeItem('app_current_page');
        sessionStorage.clear();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, logout]);

  // Save scroll position before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('app_scroll_position', window.scrollY.toString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
        if (currentPage.startsWith('payments-') || currentPage.startsWith('student-payments') || currentPage.startsWith('expenses-') || currentPage.startsWith('invoices-') || currentPage.startsWith('budgets-') || currentPage.startsWith('salaries-') || currentPage.startsWith('transactions-') || currentPage.startsWith('financial-') || currentPage.startsWith('timetable') || currentPage === 'students-management') {
          return null;
        }
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
        return <EnhancedSportsPage onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'trades':
        return <TradesPage onNavigate={handleNavigate} />;
      case 'trades-showcase':
        return <TradesShowcasePage onNavigate={handleNavigate} />;
      case currentPage.startsWith('trade-detail/') ? currentPage : '':
        const detailTradeId = currentPage.split('/')[1];
        return <TradeDetailPage tradeId={detailTradeId} onNavigate={handleNavigate} />;
      case currentPage.startsWith('trade/') ? currentPage : '':
        const tradeId = currentPage.split('/')[1];
        return <TradeDetailPage tradeId={tradeId} onNavigate={handleNavigate} />;
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
      case currentPage.startsWith('sport-team/') ? currentPage : '':
        const teamId = currentPage.split('/')[1];
        return <TeamDetailPage teamId={teamId} onNavigate={handleNavigate} />;
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
        return <AdvancedSupportPage />;
      case 'developers':
        return <DeveloperTeamPage onNavigate={handleNavigate} />;
      case currentPage.startsWith('developer/') ? currentPage : '':
        const devId = currentPage.split('/')[1];
        if (devId === '1') return <DeveloperDetailPage developerId={devId} onNavigate={handleNavigate} />;
        if (devId === '2') return <MusoniDetailPage onNavigate={handleNavigate} />;
        if (devId === '3') return <ZamiruDetailPage onNavigate={handleNavigate} />;
        if (devId === '4') return <NiyonsengaDetailPage onNavigate={handleNavigate} />;
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
      case 'admin-developers':
        return <DevelopersAdmin />;
      case 'responses':
        return <ResponsesPage />;
      case 'students-management':
        return <StudentsManagementPage onNavigate={handleNavigate} />;
      case 'student-payments-management':
        return <EnhancedStudentPayments onNavigate={handleNavigate} />;
      case 'payments-management':
        return <PaymentsManagement onNavigate={handleNavigate} />;
      case 'expenses-management':
        return <ExpensesManagement onNavigate={handleNavigate} />;
      case 'invoices-management':
        return <InvoicesManagement onNavigate={handleNavigate} />;
      case 'budgets-management':
        return <BudgetsManagement onNavigate={handleNavigate} />;
      case 'salaries-management':
        return <SalariesManagement onNavigate={handleNavigate} />;
      case 'transactions-management':
        return <TransactionsManagement onNavigate={handleNavigate} />;
      case 'financial-reports':
        return <FinancialReports onNavigate={handleNavigate} />;
      case 'timetable-view':
        return <TimetableView onNavigate={handleNavigate} />;
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
      <main className="pt-14 sm:pt-16 md:pt-20 w-full overflow-x-hidden">
        {renderPage()}
      </main>
      {!user && <Footer onNavigate={handleNavigate} />}
      <BottomNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSearch={() => handleNavigate('search')}
      />
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
