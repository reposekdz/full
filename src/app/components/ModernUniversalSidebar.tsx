import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Calendar, BookOpen, Trophy, Users, Bell, Clock, FileText, TrendingUp, Activity,
  ChevronRight, ChevronDown, DollarSign, BarChart3, ClipboardList, LogOut, Settings,
  Package, Shield, GraduationCap, Award, MessageSquare, Heart, Menu, X, User, 
  ChevronLeft, School, CheckCircle2, Eye, Zap, Plus, Download, LayoutDashboard,
  AlertTriangle, UserCheck, Building, Library, Bed, Video, Brain
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface MenuItem {
  key: string;
  icon: any;
  label: string;
  labelRw: string;
  badge?: string | number;
  color?: string;
  children?: MenuItem[];
}

interface ModernUniversalSidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onProfileView?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ModernUniversalSidebar: React.FC<ModernUniversalSidebarProps> = ({ 
  currentPage, 
  onNavigate, 
  onLogout,
  onProfileView,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onLogout?.();
    onNavigate?.('home');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const roleMenus: Record<UserRole, MenuItem[]> = {
    student: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelRw: 'Ikibaho', color: 'from-blue-600 to-indigo-600' },
      { 
        key: 'academics', icon: BookOpen, label: 'Academics', labelRw: 'Amasomo', color: 'from-green-600 to-teal-600',
        children: [
          { key: 'courses', icon: BookOpen, label: 'My Courses', labelRw: 'Amasomo Yanjye' },
          { key: 'timetable', icon: Calendar, label: 'Timetable', labelRw: 'Gahunda' },
          { key: 'exams', icon: FileText, label: 'Exams', labelRw: 'Ibizamini', badge: 3 },
          { key: 'results', icon: Award, label: 'Results', labelRw: 'Ibisubizo' },
          { key: 'library', icon: Library, label: 'Library', labelRw: 'Isomero' }
        ]
      },
      { 
        key: 'performance', icon: TrendingUp, label: 'Performance', labelRw: 'Imikorere', color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'grades', icon: BarChart3, label: 'Grades', labelRw: 'Amanota' },
          { key: 'attendance', icon: UserCheck, label: 'Attendance', labelRw: 'Kwitabira' },
          { key: 'progress', icon: TrendingUp, label: 'Progress Report', labelRw: 'Raporo' }
        ]
      },
      { 
        key: 'activities', icon: Trophy, label: 'Activities', labelRw: 'Ibikorwa', color: 'from-orange-600 to-red-600',
        children: [
          { key: 'sports', icon: Trophy, label: 'Sports', labelRw: 'Siporo' },
          { key: 'events', icon: Calendar, label: 'Events', labelRw: 'Ibirori' },
          { key: 'clubs', icon: Users, label: 'Clubs', labelRw: 'Amatsinda' }
        ]
      },
      { key: 'settings', icon: Settings, label: 'Settings', labelRw: 'Igenamiterere', color: 'from-gray-600 to-gray-700' }
    ],
    parent: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelRw: 'Ikibaho', color: 'from-blue-600 to-indigo-600' },
      { 
        key: 'children', icon: Users, label: 'My Children', labelRw: 'Abana Banjye', color: 'from-green-600 to-teal-600',
        children: [
          { key: 'child-performance', icon: TrendingUp, label: 'Performance', labelRw: 'Imikorere' },
          { key: 'child-attendance', icon: UserCheck, label: 'Attendance', labelRw: 'Kwitabira' },
          { key: 'child-results', icon: Award, label: 'Results', labelRw: 'Ibisubizo' }
        ]
      },
      { 
        key: 'financial', icon: DollarSign, label: 'Financial', labelRw: 'Amafaranga', color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'fees', icon: FileText, label: 'School Fees', labelRw: 'Amashuri' },
          { key: 'payments', icon: DollarSign, label: 'Payments', labelRw: 'Kwishyura' }
        ]
      },
      { key: 'settings', icon: Settings, label: 'Settings', labelRw: 'Igenamiterere', color: 'from-gray-600 to-gray-700' }
    ],
    teacher: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelRw: 'Ikibaho', color: 'from-blue-600 to-indigo-600' },
      { 
        key: 'classes', icon: BookOpen, label: 'My Classes', labelRw: 'Amaklasi Yanjye', color: 'from-green-600 to-teal-600',
        children: [
          { key: 'all-classes', icon: School, label: 'All Classes', labelRw: 'Amaklasi Yose' },
          { key: 'timetable', icon: Calendar, label: 'Timetable', labelRw: 'Gahunda' },
          { key: 'attendance', icon: UserCheck, label: 'Attendance', labelRw: 'Kwitabira' }
        ]
      },
      { 
        key: 'assessments', icon: FileText, label: 'Assessments', labelRw: 'Ibizamini', color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'exams', icon: FileText, label: 'Exams', labelRw: 'Ibizamini' },
          { key: 'assignments', icon: ClipboardList, label: 'Assignments', labelRw: 'Imirimo' },
          { key: 'grades', icon: Award, label: 'Grades', labelRw: 'Amanota' }
        ]
      },
      { key: 'settings', icon: Settings, label: 'Settings', labelRw: 'Igenamiterere', color: 'from-gray-600 to-gray-700' }
    ],
    director_of_study: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelRw: 'Ikibaho', color: 'from-blue-600 to-indigo-600' },
      { 
        key: 'students', icon: Users, label: 'Students', labelRw: 'Abanyeshuri', color: 'from-green-600 to-teal-600',
        children: [
          { key: 'all-students', icon: Users, label: 'All Students', labelRw: 'Abanyeshuri Bose' },
          { key: 'enrollment', icon: UserCheck, label: 'Enrollment', labelRw: 'Kwandikisha' }
        ]
      },
      { 
        key: 'academics', icon: BookOpen, label: 'Academics', labelRw: 'Amasomo', color: 'from-purple-600 to-pink-600',
        children: [
          { key: 'curriculum', icon: BookOpen, label: 'Curriculum', labelRw: 'Integanyanyigisho' },
          { key: 'exams', icon: FileText, label: 'Examinations', labelRw: 'Ibizamini' }
        ]
      },
      { key: 'reports', icon: FileText, label: 'Reports', labelRw: 'Raporo', color: 'from-orange-600 to-red-600' },
      { key: 'settings', icon: Settings, label: 'Settings', labelRw: 'Igenamiterere', color: 'from-gray-600 to-gray-700' }
    ],
    director_of_discipline: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelRw: 'Ikibaho', color: 'from-blue-600 to-indigo-600' },
      { 
        key: 'discipline', icon: Shield, label: 'Discipline', labelRw: 'Imyitwarire', color: 'from-red-600 to-orange-600',
        children: [
          { key: 'incidents', icon: AlertTriangle, label: 'Incidents', labelRw: 'Ibintu Byabaye', badge: 12 },
          { key: 'cases', icon: ClipboardList, label: 'Cases', labelRw: 'Ibibazo' },
          { key: 'warnings', icon: Bell, label: 'Warnings', labelRw: 'Iburira' }
        ]
      },
      { 
        key: 'attendance', icon: UserCheck, label: 'Attendance', labelRw: 'Kwitabira', color: 'from-green-600 to-teal-600',
        children: [
          { key: 'daily-attendance', icon: Calendar, label: 'Daily', labelRw: 'Buri munsi' },
          { key: 'reports', icon: FileText, label: 'Reports', labelRw: 'Raporo' }
        ]
      },
      { 
        key: 'welfare', icon: Heart, label: 'Welfare', labelRw: 'Imibereho', color: 'from-pink-600 to-purple-600',
        children: [
          { key: 'counseling', icon: MessageSquare, label: 'Counseling', labelRw: 'Inama' },
          { key: 'health', icon: Heart, label: 'Health', labelRw: 'Ubuzima' }
        ]
      },
      { key: 'sports', icon: Trophy, label: 'Sports', labelRw: 'Siporo', color: 'from-yellow-600 to-orange-600' },
      { key: 'settings', icon: Settings, label: 'Settings', labelRw: 'Igenamiterere', color: 'from-gray-600 to-gray-700' }
    ],
    accountant: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelRw: 'Ikibaho', color: 'from-blue-600 to-indigo-600' },
      { 
        key: 'fees', icon: DollarSign, label: 'Fee Management', labelRw: 'Amafaranga', color: 'from-green-600 to-teal-600',
        children: [
          { key: 'invoices', icon: FileText, label: 'Invoices', labelRw: 'Inyemezabuguzi' },
          { key: 'payments', icon: DollarSign, label: 'Payments', labelRw: 'Kwishyura' },
          { key: 'outstanding', icon: AlertTriangle, label: 'Outstanding', labelRw: 'Bitarishyurwa', badge: 47 }
        ]
      },
      { key: 'reports', icon: FileText, label: 'Reports', labelRw: 'Raporo', color: 'from-purple-600 to-pink-600' },
      { key: 'settings', icon: Settings, label: 'Settings', labelRw: 'Igenamiterere', color: 'from-gray-600 to-gray-700' }
    ],
    stock_manager: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelRw: 'Ikibaho', color: 'from-blue-600 to-indigo-600' },
      { 
        key: 'inventory', icon: Package, label: 'Inventory', labelRw: 'Ibicuruzwa', color: 'from-green-600 to-teal-600',
        children: [
          { key: 'all-items', icon: Package, label: 'All Items', labelRw: 'Ibintu Byose' },
          { key: 'low-stock', icon: AlertTriangle, label: 'Low Stock', labelRw: 'Ibicye', badge: 23 }
        ]
      },
      { key: 'reports', icon: FileText, label: 'Reports', labelRw: 'Raporo', color: 'from-orange-600 to-red-600' },
      { key: 'settings', icon: Settings, label: 'Settings', labelRw: 'Igenamiterere', color: 'from-gray-600 to-gray-700' }
    ],
    admin: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelRw: 'Ikibaho', color: 'from-blue-600 to-indigo-600' },
      { 
        key: 'users', icon: Users, label: 'Users', labelRw: 'Abakoresha', color: 'from-green-600 to-teal-600',
        children: [
          { key: 'all-users', icon: Users, label: 'All Users', labelRw: 'Abakoresha Bose' },
          { key: 'students', icon: GraduationCap, label: 'Students', labelRw: 'Abanyeshuri' },
          { key: 'staff', icon: Users, label: 'Staff', labelRw: 'Abakozi' }
        ]
      },
      { key: 'content', icon: FileText, label: 'Content', labelRw: 'Ibikubiyemo', color: 'from-purple-600 to-pink-600' },
      { key: 'systems', icon: Building, label: 'Systems', labelRw: 'Sisitemu', color: 'from-yellow-600 to-orange-600' },
      { key: 'settings', icon: Settings, label: 'Settings', labelRw: 'Igenamiterere', color: 'from-gray-600 to-gray-700' }
    ],
    head_master: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelRw: 'Ikibaho', color: 'from-blue-600 to-indigo-600' },
      { key: 'overview', icon: Eye, label: 'Overview', labelRw: 'Incamake', color: 'from-green-600 to-teal-600' },
      { key: 'management', icon: Users, label: 'Management', labelRw: 'Ubuyobozi', color: 'from-purple-600 to-pink-600' },
      { key: 'reports', icon: FileText, label: 'Reports', labelRw: 'Raporo', color: 'from-orange-600 to-red-600' },
      { key: 'settings', icon: Settings, label: 'Settings', labelRw: 'Igenamiterere', color: 'from-gray-600 to-gray-700' }
    ]
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const Icon = item.icon;
    const isExpanded = expandedSections.includes(item.key);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = currentPage === item.key;

    if (hasChildren) {
      return (
        <div key={item.key} className="mb-2">
          <Button
            variant="ghost"
            onClick={() => toggleSection(item.key)}
            className={`w-full justify-between h-auto py-3 px-4 ${
              isExpanded ? 'bg-gradient-to-r from-yellow-100 to-green-100 text-yellow-700' : 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50'
            }`}
          >
            <div className="flex items-center">
              {item.color ? (
                <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} mr-3`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              ) : (
                <Icon className="h-4 w-4 mr-3" />
              )}
              {!isCollapsed && (
                <div className="text-left">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.labelRw}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                {item.badge && <Badge className="bg-red-500 text-white">{item.badge}</Badge>}
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            )}
          </Button>
          
          <AnimatePresence>
            {isExpanded && !isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-4 mt-1 space-y-1"
              >
                {item.children?.map(child => renderMenuItem(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Button
        key={item.key}
        variant="ghost"
        onClick={() => onNavigate?.(item.key)}
        className={`w-full justify-start h-auto py-2.5 px-4 mb-1 ${
          isActive ? 'bg-gradient-to-r from-yellow-100 to-green-100 text-yellow-700 border-l-4 border-yellow-500' : 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50'
        }`}
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {!isCollapsed && (
          <div className="flex-1 text-left min-w-0">
            <p className="font-medium text-sm truncate">{item.label}</p>
            <p className="text-xs text-gray-500 truncate">{item.labelRw}</p>
          </div>
        )}
        {!isCollapsed && item.badge && <Badge className="bg-red-500 text-white ml-2">{item.badge}</Badge>}
      </Button>
    );
  };

  const currentMenus = user ? roleMenus[user.role] : [];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-yellow-600 to-green-600 rounded-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Garden TVET School</h2>
                <p className="text-xs text-gray-600">Excellence in Education</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="lg:flex hidden">
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {user && (
            <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-50 to-green-50 cursor-pointer hover:shadow-xl transition-shadow" onClick={onProfileView}>
              <CardContent className="p-4">
                {!isCollapsed ? (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-14 w-14 border-2 border-yellow-400">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-xl font-bold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-600 capitalize truncate">{user.role.replace(/_/g, ' ')}</p>
                      <Badge className="mt-1 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />Active
                      </Badge>
                    </div>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Avatar className="h-10 w-10 border-2 border-yellow-400">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-1">
            {currentMenus.map(item => renderMenuItem(item))}
          </div>

          {user && !isCollapsed && (
            <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-500 to-green-500">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm" size="sm">
                    <Plus className="h-4 w-4 mr-2" />New Entry
                  </Button>
                  <Button variant="secondary" className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm" size="sm">
                    <Download className="h-4 w-4 mr-2" />Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {user && (
            <Button onClick={handleLogout} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-2 border-red-200 shadow-lg" size="lg">
              <LogOut className="h-5 w-5 mr-2" />
              {!isCollapsed && 'Sohoka / Logout'}
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setIsMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg">
        <Menu className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl">
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.aside initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`hidden lg:block bg-gradient-to-b from-white to-yellow-50/30 border-r-2 border-yellow-200 h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80'}`}>
        {sidebarContent}
      </motion.aside>
    </>
  );
};

export default ModernUniversalSidebar;
