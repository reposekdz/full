import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { AuthProvider, useAuth, UserRole } from '@/app/contexts/AuthContext';
import { ContentProvider } from '@/app/contexts/ContentContext';
import Header from '@/app/components/Header';
import { BottomNav } from '@/app/components/BottomNav';
import HomePage from '@/app/pages/HomePage';
import SportsPage from '@/app/pages/SportsPage';
import EnhancedSportsPage from '@/app/pages/EnhancedSportsPage';
import EnhancedSportsPageNew from '@/app/pages/EnhancedSportsPageNew';
import BeautifulSportsPage from '@/app/pages/BeautifulSportsPage';
import ModernSportsPage from '@/app/pages/ModernSportsPage';
import PowerfulSportsPage from '@/app/pages/PowerfulSportsPage';
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
import AdvancedSearchPage from '@/app/pages/AdvancedSearchPage';
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
import ModernTeamDetailPage from '@/app/pages/ModernTeamDetailPage';
import NewsPage from '@/app/pages/NewsPage';
import NewsDetailPage from '@/app/pages/NewsDetailPage';
import AdminDashboard from '@/app/pages/dashboards/AdminDashboard';
import StudentDashboard from '@/app/pages/dashboards/StudentDashboard';
import ParentDashboard from '@/app/pages/dashboards/ParentDashboard';
import ModernParentDashboard from '@/app/pages/dashboards/ModernParentDashboard';
import PowerfulParentDashboard from '@/app/pages/dashboards/PowerfulParentDashboard';
import ParentPortalComprehensiveDashboard from '@/app/pages/dashboards/ParentPortalComprehensiveDashboard';
import AdvisorDashboard from '@/app/pages/dashboards/AdvisorDashboard';
import DirectorStudyDashboard from '@/app/pages/dashboards/DirectorStudyDashboard';
import DODDashboard from '@/app/pages/dashboards/DODDashboard';
import DOSDashboard from '@/app/pages/dashboards/DOSDashboard';
import ModernHeadmasterDashboard from '@/app/pages/dashboards/ModernHeadmasterDashboard';
import ModernStockManagerDashboard from '@/app/pages/dashboards/ModernStockManagerDashboard';
import DODDisciplinePage from '@/app/pages/dod/DODDisciplinePage';
import DODLeavePage from '@/app/pages/dod/DODLeavePage';
import DODExamsPage from '@/app/pages/dod/DODExamsPage';
import DODStudentsPage from '@/app/pages/dod/DODStudentsPage';
import DODProfilePage from '@/app/pages/dod/DODProfilePage';
import DODReportsPage from '@/app/pages/dod/DODReportsPage';
import DODPunishmentsPage from '@/app/pages/dod/DODPunishmentsPage';
import DODParentNotificationsPage from '@/app/pages/dod/DODParentNotificationsPage';
import DODStudentSheetsPage from '@/app/pages/dod/DODStudentSheetsPage';
import DODParentManagementPage from '@/app/pages/dod/DODParentManagementPage';
import DODLeaveManagementPage from '@/app/pages/dod/DODLeaveManagementPage';
import UniversalProfilePage from '@/app/pages/common/UniversalProfilePage';
import HeadMasterDashboard from '@/app/pages/dashboards/HeadMasterDashboard';
import TeacherDashboard from '@/app/pages/teacher/TeacherDashboard';
import TeacherGradingPage from '@/app/pages/teacher/TeacherGradingPage';
import TeacherCreateAssignmentPage from '@/app/pages/teacher/TeacherCreateAssignmentPage';
import TeacherAttendancePage from '@/app/pages/teacher/TeacherAttendancePage';
import TeacherProfilePage from '@/app/pages/teacher/TeacherProfilePage';
import TeacherSearchPage from '@/app/pages/teacher/TeacherSearchPage';
import TeacherNotificationsPage from '@/app/pages/teacher/TeacherNotificationsPage';
import TeacherClassesPage from '@/app/pages/teacher/TeacherClassesPage';
import TeacherStudentsPage from '@/app/pages/teacher/TeacherStudentsPage';
import TeacherGradesPage from '@/app/pages/teacher/TeacherGradesPage';
import TeacherAssignmentsPage from '@/app/pages/teacher/TeacherAssignmentsPage';
import TeacherResourcesPage from '@/app/pages/teacher/TeacherResourcesPage';
import TeacherSchedulePage from '@/app/pages/teacher/TeacherSchedulePage';
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
import TeamOverviewManagement from '@/app/pages/admin/TeamOverviewManagement';
import MedicalManagementSystem from '@/app/pages/systems/MedicalManagementSystem';
import { Toaster } from 'sonner';
import LibraryManagementSystem from '@/app/pages/systems/LibraryManagementSystem';
import ExamManagementSystem from '@/app/pages/systems/ExamManagementSystem';
import HostelManagementSystem from '@/app/pages/systems/HostelManagementSystem';
import NYTArticleViewPage from '@/app/pages/NYTArticleViewPage';
import AdminArticleManagementPage from '@/app/pages/AdminArticleManagementPage';
import Footer from '@/app/components/Footer';
import { GlobalMobileMenu } from '@/app/components/GlobalMobileMenu';
import ComprehensiveAdvisorPortal from '@/app/pages/portals/ComprehensiveAdvisorPortal';
import HeadmasterStudentManagement from '@/app/pages/headmaster/HeadmasterStudentManagement';
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
import DODManagement from '@/app/pages/dashboards/DODManagement';
import DOSManagementUltraAdvanced from '@/app/pages/dos/DOSManagementUltraAdvanced';
import StudentManagementUltraAdvanced from '@/app/pages/StudentManagementUltraAdvanced';
import StaffManagementPage from '@/app/pages/StaffManagementPage';

const AppContent: React.FC = () => {
  // Mirror role-based navigation visibility used in Header
  const roleNavVisibility: Record<string, string[]> = {
    school_owner: ['home','academics','sports','services','trades','leadership','staff-management-advanced','contactUs','supports','developers'],
    admin: ['home','academics','sports','services','trades','leadership','staff-management-advanced','contactUs','supports','developers'],
    super_admin: ['home','academics','sports','services','trades','leadership','staff-management-advanced','contactUs','supports','developers'],
    headmaster: ['home','academics','leadership','staff-management-advanced','contactUs','supports'],
    director_study: ['home','academics','leadership','staff-management-advanced','contactUs','supports'],
    director_discipline: ['home','academics','leadership','staff-management-advanced','contactUs','supports'],
    dod: ['home','academics','leadership','staff-management-advanced','contactUs','supports'],
    accountant: ['home','services','staff-management-advanced','leadership','supports','contactUs'],
    stock_manager: ['home','trades','services','staff-management-advanced','supports','contactUs'],
    teacher: ['home','academics','leadership','contactUs','supports'],
    advisor: ['home','academics','leadership','contactUs','supports'],
    patron: ['home','academics','leadership','contactUs','supports'],
    matron: ['home','academics','leadership','contactUs','supports'],
    support_staff: ['home','services','supports','contactUs'],
    parent: ['home','academics','sports','supports','contactUs'],
    student: ['home','academics','sports','services','trades','supports','contactUs']
  };

  const roleExtraAllowed: Record<string, string[]> = {
    school_owner: ['profile','student-sheets'],
    admin: ['profile','student-sheets','admin','admin-panel','admin/team-overview','admin-developers','admin-articles'],
    super_admin: ['profile','student-sheets','admin','admin-panel','admin/team-overview','admin-developers','admin-articles'],
    headmaster: ['profile','headmaster-students','student-sheets','dashboard-headmaster'],
    director_study: ['profile','dos-students','dos-report-cards','dos-teacher-marks','dos-parent-access','dos-sms','student-sheets','dashboard-director-study','dashboard-dos'],
    director_discipline: ['profile','dod-profile','dod-discipline','dod-leave','dod-leave-management','dod-parent-management','dod-exams','dod-students','dod-reports','dod-punishments','dod-parent-notifications','dod-student-sheets','dod-management','dod-notifications','student-sheets','dashboard-director-discipline'],
    dod: ['profile','dod-profile','dod-discipline','dod-leave','dod-leave-management','dod-parent-management','dod-exams','dod-students','dod-reports','dod-punishments','dod-parent-notifications','dod-student-sheets','dod-management','dod-notifications','student-sheets','dashboard-director-discipline'],
    accountant: ['profile','student-sheets','dashboard-accountant','payments-management','expenses-management','invoices-management','budgets-management','salaries-management','transactions-management','financial-reports','timetable-view','students-management','student-payments-management'],
    stock_manager: ['profile','dashboard-stock','staff-management-advanced'],
    teacher: ['profile','search','notifications','classes','students','gradebook','attendance','assignments','resources','schedule','teacher-grading','teacher-create-assignment','student-sheets','dashboard-teacher'],
    advisor: ['profile','student-sheets','dashboard-advisor'],
    parent: ['profile','dashboard-parent'],
    student: ['profile','dashboard-student'],
    patron: ['profile'],
    matron: ['profile'],
    support_staff: ['profile'],
    default: []
  };

  const isPageAllowed = (page: string, role?: string | null) => {
    if (!role) return true; // public guard handled later
    const base = roleNavVisibility[role] || roleNavVisibility[role as string] || [];
    const extras = roleExtraAllowed[role] || roleExtraAllowed.default || [];
    // allow dashboard routes that start with dashboard- for that role
    const normalizedPage = page.split('/')[0];
    const dashboardPage = (role: string) => `dashboard-${role.replace('_', '-')}`;
    if (normalizedPage === dashboardPage(role)) return true;
    if (base.includes(normalizedPage) || extras.includes(normalizedPage)) return true;
    return false;
  };

  const [currentPage, setCurrentPage] = useState(() => {
    // Get page from URL path first, then localStorage
    const path = window.location.pathname.slice(1) || 'home';
    return path;
  });
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { user, logout, getRoleDashboard } = useAuth();

  // Sync URL with currentPage
  useEffect(() => {
    const path = window.location.pathname.slice(1) || 'home';
    if (path !== currentPage) {
      setCurrentPage(path);
    }
  }, []);

  // Update URL when currentPage changes
  useEffect(() => {
    const path = window.location.pathname.slice(1) || 'home';
    if (path !== currentPage) {
      window.history.pushState({}, '', `/${currentPage}`);
    }
  }, [currentPage]);

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
    // Allow certain pages to be accessed regardless of authentication status
    const publicPages = ['home', 'trades', 'sports', 'services', 'contactUs', 'supports', 'developers', 'leadership', 'news', 'login', 'register', 'search'];
    
    if (publicPages.includes(page)) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (user && !isPageAllowed(page, user.role)) {
      const safe = getRoleDashboard(user.role);
      setCurrentPage(safe);
      window.history.pushState({}, '', `/${safe}`);
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
      case 'super_admin':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="admin" />;
        if (currentPage === 'student-sheets') return <GlobalStudentSheets onNavigate={handleNavigate} />;
        return <AdminDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'student':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="dashboard-student" />;
        return <StudentDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'parent':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="dashboard-parent" />;
        return <ParentPortalComprehensiveDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'advisor':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="dashboard-advisor" />;
        if (currentPage === 'student-sheets') return <GlobalStudentSheets onNavigate={handleNavigate} />;
        return <AdvisorDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'director_study':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="dashboard-director-study" />;
        if (currentPage === 'dos-students') return <StudentManagementUltraAdvanced onNavigate={handleNavigate} />;
        if (currentPage === 'dos-report-cards') return <DOSManagementUltraAdvanced onNavigate={handleNavigate} />;
        if (currentPage === 'dos-teacher-marks') return <DOSManagementUltraAdvanced onNavigate={handleNavigate} />;
        if (currentPage === 'dos-parent-access') return <DOSManagementUltraAdvanced onNavigate={handleNavigate} />;
        if (currentPage === 'dos-sms') return <DOSManagementUltraAdvanced onNavigate={handleNavigate} />;
        if (currentPage === 'student-sheets') return <GlobalStudentSheets onNavigate={handleNavigate} />;
        return <DirectorStudyDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'dod':
      case 'director_discipline':
      case 'matron':
      case 'patron':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="dashboard-director-discipline" />;
        if (currentPage === 'dod-profile') return <DODProfilePage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-discipline') return <DODDisciplinePage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-leave') return <DODLeavePage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-leave-management') return <DODLeaveManagementPage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-parent-management') return <DODParentManagementPage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-exams') return <DODExamsPage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-students') return <DODStudentsPage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-reports') return <DODReportsPage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-punishments') return <DODPunishmentsPage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-parent-notifications') return <DODParentNotificationsPage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-student-sheets') return <DODStudentSheetsPage onNavigate={handleNavigate} />;
        if (currentPage === 'dod-management') return <DODManagement onNavigate={handleNavigate} onLogout={logout} />;
        if (currentPage === 'dod-notifications') return <DODDashboard onNavigate={handleNavigate} onLogout={logout} />;
        if (currentPage === 'student-sheets') return <GlobalStudentSheets onNavigate={handleNavigate} />;
        return <DODDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'headmaster':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="dashboard-headmaster" />;
        if (currentPage === 'headmaster-students') return <HeadmasterStudentManagement onNavigate={handleNavigate} />;
        if (currentPage === 'student-sheets') return <GlobalStudentSheets onNavigate={handleNavigate} />;
        return <ModernHeadmasterDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'teacher':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="dashboard-teacher" />;
        if (currentPage === 'search') return <TeacherSearchPage onNavigate={handleNavigate} />;
        if (currentPage === 'notifications') return <TeacherNotificationsPage onNavigate={handleNavigate} />;
        if (currentPage === 'classes') return <TeacherClassesPage onNavigate={handleNavigate} />;
        if (currentPage === 'students') return <TeacherStudentsPage onNavigate={handleNavigate} />;
        if (currentPage === 'gradebook') return <TeacherGradesPage onNavigate={handleNavigate} />;
        if (currentPage === 'attendance') return <TeacherAttendancePage onNavigate={handleNavigate} />;
        if (currentPage === 'assignments') return <TeacherAssignmentsPage onNavigate={handleNavigate} />;
        if (currentPage === 'resources') return <TeacherResourcesPage onNavigate={handleNavigate} />;
        if (currentPage === 'schedule') return <TeacherSchedulePage onNavigate={handleNavigate} />;
        if (currentPage === 'teacher-grading') return <TeacherGradingPage teacherId={user.id} onNavigate={handleNavigate} />;
        if (currentPage === 'teacher-create-assignment') return <TeacherCreateAssignmentPage teacherId={user.id} onNavigate={handleNavigate} />;
        if (currentPage === 'student-sheets') return <GlobalStudentSheets onNavigate={handleNavigate} />;
        return <TeacherDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'accountant':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="dashboard-accountant" />;
        if (currentPage === 'student-sheets') return <GlobalStudentSheets onNavigate={handleNavigate} />;
        if (currentPage.startsWith('payments-') || currentPage.startsWith('student-payments') || currentPage.startsWith('expenses-') || currentPage.startsWith('invoices-') || currentPage.startsWith('budgets-') || currentPage.startsWith('salaries-') || currentPage.startsWith('transactions-') || currentPage.startsWith('financial-') || currentPage.startsWith('timetable') || currentPage === 'students-management') {
          return null;
        }
        return <AccountantDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'stock_manager':
        if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="dashboard-stock" />;
        return <ModernStockManagerDashboard onNavigate={handleNavigate} onLogout={logout} />;
      default:
        return null;
    }
  };

  // Auto-redirect authenticated users to their dashboard only from home page
  useEffect(() => {
    if (user && currentPage === 'home') {
      // Don't auto-redirect from home page, let users browse freely
      // const dashboardPage = getRoleDashboard(user.role);
      // handleNavigate(dashboardPage);
    }
  }, [user, currentPage, getRoleDashboard]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    handleNavigate('role-login');
  };

  const renderPage = () => {
    // Check for dashboard routes first
    if (currentPage === 'admin' && user?.role === 'admin') return <AdminDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-student' && user?.role === 'student') return <StudentDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-parent' && user?.role === 'parent') return <ParentPortalComprehensiveDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-advisor' && user?.role === 'advisor') return <AdvisorDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-director-study' && user?.role === 'director_study') return <DirectorStudyDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-dos' && user?.role === 'director_study') return <DOSDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-director-discipline' && user?.role === 'director_discipline') return <DODDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-headmaster' && user?.role === 'headmaster') return <ModernHeadmasterDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-teacher' && user?.role === 'teacher') return <TeacherDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-accountant' && user?.role === 'accountant') return <AccountantDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-stock' && user?.role === 'stock_manager') return <ModernStockManagerDashboard onNavigate={handleNavigate} onLogout={logout} />;

    // Check for dynamic routes first (works for all users)
    if (currentPage.startsWith('article/')) {
      const articleId = currentPage.split('/')[1];
      return <NYTArticleViewPage articleId={articleId} onNavigate={handleNavigate} />;
    }
    if (currentPage.startsWith('trade-detail/')) {
      const detailTradeId = currentPage.split('/')[1];
      return <TradeDetailPage tradeId={detailTradeId} onNavigate={handleNavigate} />;
    }
    if (currentPage.startsWith('trade/')) {
      const tradeId = currentPage.split('/')[1];
      return <TradeDetailPage tradeId={tradeId} onNavigate={handleNavigate} />;
    }
    if (currentPage.startsWith('sport-team/')) {
      const teamId = currentPage.split('/')[1];
      return <ModernTeamDetailPage teamId={teamId} onNavigate={handleNavigate} />;
    }
    if (currentPage.startsWith('news/')) {
      const newsId = currentPage.split('/')[1];
      return <NewsDetailPage newsId={newsId} onNavigate={handleNavigate} />;
    }
    if (currentPage.startsWith('developer/')) {
      const devId = currentPage.split('/')[1];
      if (devId === '1') return <DeveloperDetailPage developerId={devId} onNavigate={handleNavigate} />;
      if (devId === '2') return <MusoniDetailPage onNavigate={handleNavigate} />;
      if (devId === '3') return <ZamiruDetailPage onNavigate={handleNavigate} />;
      if (devId === '4') return <NiyonsengaDetailPage onNavigate={handleNavigate} />;
      return <DeveloperDetailPage developerId={devId} onNavigate={handleNavigate} />;
    }
    if (currentPage.startsWith('leader/')) {
      const leaderId = currentPage.split('/')[1];
      return <LeaderDetailPage leaderId={leaderId} onNavigate={handleNavigate} />;
    }

    // Public pages that work for both authenticated and non-authenticated users
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'sports':
        return <PowerfulSportsPage onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'trades':
        return <TradesPage onNavigate={handleNavigate} />;
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
      case 'leadership':
        return <LeadershipPage onNavigate={handleNavigate} />;
      case 'teams':
        return <TeamsPage onNavigate={handleNavigate} />;
      case 'login':
        return <ModernLoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <ModernRegisterPage onNavigate={handleNavigate} />;
      case 'search':
        return <AdvancedSearchPage onNavigate={handleNavigate} />;
    }

    // If user is logged in, check for special pages
    if (user) {
      // Accountant management pages
      if (currentPage === 'students-management') return <StudentsManagementPage onNavigate={handleNavigate} />;
      if (currentPage === 'student-payments-management') return <EnhancedStudentPayments onNavigate={handleNavigate} />;
      if (currentPage === 'admin-articles') return <AdminArticleManagementPage onNavigate={handleNavigate} />;
      if (currentPage === 'payments-management') return <PaymentsManagement onNavigate={handleNavigate} />;
      if (currentPage === 'expenses-management') return <ExpensesManagement onNavigate={handleNavigate} />;
      if (currentPage === 'invoices-management') return <InvoicesManagement onNavigate={handleNavigate} />;
      if (currentPage === 'budgets-management') return <BudgetsManagement onNavigate={handleNavigate} />;
      if (currentPage === 'salaries-management') return <SalariesManagement onNavigate={handleNavigate} />;
      if (currentPage === 'transactions-management') return <TransactionsManagement onNavigate={handleNavigate} />;
      if (currentPage === 'financial-reports') return <FinancialReports onNavigate={handleNavigate} />;
      if (currentPage === 'timetable-view') return <TimetableView onNavigate={handleNavigate} />;
      if (currentPage === 'medical-system') return <MedicalManagementSystem />;
      if (currentPage === 'library-system') return <LibraryManagementSystem />;
      if (currentPage === 'exam-management') return <ExamManagementSystem />;
      if (currentPage === 'hostel-management') return <HostelManagementSystem />;
      if (currentPage === 'staff-management') return <StaffManagementPage onNavigate={handleNavigate} />;
      if (currentPage === 'staff-management-advanced') return <StaffManagementPage onNavigate={handleNavigate} />;
      
      // Role selection pages
      if (currentPage === 'role-selection') {
        return <RoleSelectionPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} />;
      }
      if (currentPage === 'role-login') {
        return <RoleLoginPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} selectedRole={selectedRole} />;
      }
      // For all other pages, show the dashboard
      return renderDashboard();
    }

    // Additional public pages for non-authenticated users
    switch (currentPage) {
      case 'role-selection':
        return <RoleSelectionPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} />;
      case 'role-login':
        return <RoleLoginPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} selectedRole={selectedRole} />;
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
      case 'admin/team-overview':
        return <TeamOverviewManagement />;
      case 'admin-articles':
        return <AdminArticleManagementPage onNavigate={handleNavigate} />;
      case 'staff-management-advanced':
        return <StaffManagementPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-x-hidden w-full max-w-[100vw]">
      {/* Global Mobile Menu - Shows everywhere for authenticated users */}
      <GlobalMobileMenu currentPage={currentPage} onNavigate={handleNavigate} />
      
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
          <Toaster position="top-right" richColors />
        </ContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
