import React, { useState, useEffect } from 'react';
import { apiService } from '@/app/services/apiService';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, BookOpen, LogOut, Settings, Bell, Activity, Shield, Database, FileText, BarChart3, Award, Target, Clock, DollarSign, Package, Newspaper, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useAuth } from '@/app/contexts/AuthContext';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/app/components/ui/dropdown-menu';
import { Progress } from '@/app/components/ui/progress';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import ProfilePage from '../admin/ProfilePage';
import SearchPage from '../admin/SearchPage';
import NotificationsPage from '../admin/NotificationsPage';
import UsersManagementPage from '../admin/UsersManagementPage';
import AnalyticsPage from '../admin/AnalyticsPage';
import ReportsPage from '../admin/ReportsPage';
import SettingsPage from '../admin/SettingsPage';
import SecurityPage from '../admin/SecurityPage';
import BackupPage from '../admin/BackupPage';
import LogsPage from '../admin/LogsPage';
import StaffManagementPage from '../StaffManagementPage';
import AdminStaffManagement from '../admin/AdminStaffManagement';
import ContentManagementPage from '../admin/ContentManagementPage';
import ComprehensiveContentManagement from '../admin/ComprehensiveContentManagement';
import ComprehensiveStaffManagement from '../admin/ComprehensiveStaffManagement';
import StudentManagementPage from '../admin/StudentManagementPage';
import DisciplineManagementPage from '../admin/DisciplineManagementPage';
import AdminStudentSheetsPage from '../admin/AdminStudentSheetsPage';
import HomeworkManagementPage from '../admin/HomeworkManagementPage';
import AssignmentsManagementPage from '../admin/AssignmentsManagementPage';
import LiveChatManagementPage from '../admin/LiveChatManagementPage';
import GamificationSystemPage from '../admin/GamificationSystemPage';
import LiveStudySessionsPage from '../admin/LiveStudySessionsPage';
import CollaborationStudyGroupsPage from '../admin/CollaborationStudyGroupsPage';
import QuizSystemPage from '../admin/QuizSystemPage';
import SportsManagementPage from '../admin/SportsManagementPage';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';
import ClassLevelSheetsDashboard from '@/app/components/admin/ClassLevelSheetsDashboard';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  const handleNavigation = (page: string) => {
    setCurrentView(page);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <ProfilePage />;
      case 'search':
        return <SearchPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'users':
        return <UsersManagementPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'security':
        return <SecurityPage />;
      case 'backup':
        return <BackupPage />;
      case 'logs':
        return <LogsPage />;
      case 'staff-management':
        return user?.role === 'admin' ? <AdminStaffManagement /> : <StaffManagementPage onNavigate={handleNavigate} />;
      case 'content-management':
        return <ContentManagementPage />;
      case 'comprehensive-content':
        return <ComprehensiveContentManagement />;
      case 'comprehensive-staff':
        return <ComprehensiveStaffManagement />;
      case 'student-management':
        return <StudentManagementPage />;
      case 'discipline-management':
        return <DisciplineManagementPage />;
      case 'student-sheets':
        return <AdminStudentSheetsPage />;
      case 'homework-management':
        return <HomeworkManagementPage />;
      case 'assignments-management':
        return <AssignmentsManagementPage />;
      case 'live-chat':
        return <LiveChatManagementPage />;
      case 'gamification':
        return <GamificationSystemPage />;
      case 'live-study':
        return <LiveStudySessionsPage />;
      case 'collaboration':
        return <CollaborationStudyGroupsPage />;
      case 'quiz-system':
        return <QuizSystemPage />;
      case 'sports-management':
        return <SportsManagementPage />;
      case 'class-sheets':
        return <ClassLevelSheetsDashboard userRole="admin" userId={user?.id || 1} />;
      case 'articles':
        onNavigate('admin-articles');
        return null;
      default:
        return <DashboardHome onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-lime-50 overflow-hidden">
      <UniversalMessagingWidget />
      <AdvancedLeftSidebar currentPage={currentView} onNavigate={handleNavigation} onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-yellow-500 to-green-600 p-3 rounded-xl shadow-lg">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">ADMIN DASHBOARD</h1>
                  <p className="text-gray-600 text-sm">Welcome back, {user?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-green-200 hover:bg-green-50"
                  onClick={() => {
                    const dashboardHome = document.querySelector('[data-dashboard-home]');
                    if (dashboardHome) {
                      // Trigger refresh via custom event or just let it re-mount if we had a key
                      // For now, I'll just call the fetchData in DashboardHome if I can
                    }
                    window.location.reload(); // Simple way for now if no shared state
                  }}
                >
                  <RefreshCw className="w-5 h-5 text-green-600" />
                </Button>
                <Button variant="outline" size="icon" className="relative border-green-200 hover:bg-green-50" onClick={() => handleNavigation('notifications')}>
                  <Bell className="w-5 h-5 text-green-600" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full hover:bg-green-50">
                      <Avatar className="h-8 w-8 border-2 border-green-200">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-600 text-white font-bold">{user?.name?.charAt(0) || 'A'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleNavigation('profile')}>
                      <Settings className="w-4 h-4 mr-2 text-green-600" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('settings')}>
                      <Settings className="w-4 h-4 mr-2 text-yellow-600" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-orange-600 focus:text-orange-700">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, parents: 0, staff: 0, courses: 0, revenue: 0, stock: 0 });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, logsRes] = await Promise.all([
        apiService.getAdminAnalytics(),
        apiService.getSecurityLogs({ limit: 4 })
      ]);
      
      if (analyticsRes.success) setStats(analyticsRes.analytics);
      if (logsRes.success) setActivities(logsRes.logs);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: Users, bgColor: 'bg-yellow-50', iconBg: 'bg-yellow-100', textColor: 'text-yellow-600' },
    { title: 'Total Teachers', value: stats.teachers, icon: Award, bgColor: 'bg-green-50', iconBg: 'bg-green-100', textColor: 'text-green-600' },
    { title: 'Total Parents', value: stats.parents, icon: Users, bgColor: 'bg-lime-50', iconBg: 'bg-lime-100', textColor: 'text-lime-600' },
    { title: 'Total Staff', value: stats.staff, icon: Users, bgColor: 'bg-amber-50', iconBg: 'bg-amber-100', textColor: 'text-amber-600' },
    { title: 'Active Courses', value: stats.courses, icon: BookOpen, bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-100', textColor: 'text-emerald-600' },
    { title: 'Revenue (RWF)', value: formatCurrency(stats.revenue), icon: DollarSign, bgColor: 'bg-yellow-50', iconBg: 'bg-yellow-100', textColor: 'text-yellow-600' },
    { title: 'Stock Items', value: stats.stock, icon: Package, bgColor: 'bg-green-50', iconBg: 'bg-green-100', textColor: 'text-green-600' },
  ];

  const quickActions = [
    { title: 'Gucunga Ibikubiyemo', desc: 'All Content', icon: LayoutDashboard, color: 'from-yellow-500 to-green-500', link: 'comprehensive-content' },
    { title: 'Gucunga Abakozi', desc: 'Staff & Trades', icon: Users, color: 'from-green-500 to-yellow-500', link: 'comprehensive-staff' },
    { title: 'User Management', desc: 'Manage all users', icon: Users, color: 'from-yellow-600 to-green-600', link: 'users' },
    { title: 'Sports Management', desc: 'Manage sports', icon: Award, color: 'from-green-600 to-yellow-600', link: 'sports-management' },
    { title: 'News Articles', desc: 'Manage articles', icon: Newspaper, color: 'from-yellow-500 to-green-500', link: 'articles' },
    { title: 'Analytics', desc: 'View statistics', icon: BarChart3, color: 'from-green-500 to-yellow-500', link: 'analytics' },
    { title: 'Reports', desc: 'Generate reports', icon: FileText, color: 'from-yellow-600 to-green-600', link: 'reports' },
    { title: 'Security', desc: 'Security logs', icon: Shield, color: 'from-green-600 to-yellow-600', link: 'security' },
    { title: 'Backup', desc: 'Database backup', icon: Database, color: 'from-yellow-500 to-green-500', link: 'backup' },
    { title: 'Settings', desc: 'System settings', icon: Settings, color: 'from-green-500 to-yellow-500', link: 'settings' },
  ];

  const getActivityIcon = (action: string) => {
    if (action?.includes('user') || action?.includes('student')) return Users;
    if (action?.includes('report')) return FileText;
    if (action?.includes('backup')) return Database;
    return Shield;
  };

  const getActivityColor = (action: string) => {
    if (action?.includes('user')) return { text: 'text-blue-600', bg: 'bg-blue-50' };
    if (action?.includes('report')) return { text: 'text-green-600', bg: 'bg-green-50' };
    if (action?.includes('backup')) return { text: 'text-purple-600', bg: 'bg-purple-50' };
    return { text: 'text-teal-600', bg: 'bg-teal-50' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={stat.title}>
            <Card className={`border-2 border-transparent hover:border-blue-200 transition-all hover:shadow-xl ${stat.bgColor}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                    <p className="text-2xl font-black text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.iconBg} p-3 rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <motion.button
                key={action.title}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(action.link)}
                className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className={`bg-gradient-to-br ${action.color} p-3 rounded-xl mb-3 shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 text-center">{action.title}</p>
                <p className="text-xs text-gray-500 text-center mt-1">{action.desc}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recent activities</div>
              ) : (
                activities.map((activity, idx) => {
                  const Icon = getActivityIcon(activity.action);
                  const colors = getActivityColor(activity.action);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className={`${colors.bg} p-2 rounded-lg`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action || 'System activity'}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Server Health</span>
                <span className="text-sm font-bold text-green-600">Online</span>
              </div>
              <Progress value={100} className="h-2 bg-green-100" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Database</span>
                <span className="text-sm font-bold text-green-600">Connected</span>
              </div>
              <Progress value={100} className="h-2 bg-green-100" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">API Response</span>
                <span className="text-sm font-bold text-green-600">Active</span>
              </div>
              <Progress value={100} className="h-2 bg-green-100" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-green-700">All Systems Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
