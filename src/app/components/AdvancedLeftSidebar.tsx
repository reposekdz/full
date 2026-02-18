import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Calendar, BookOpen, Trophy, Users, Bell, Clock, FileText, TrendingUp, Target, Activity,
  ChevronRight, ChevronDown, Briefcase, DollarSign, BarChart3, ClipboardList, LogOut, Settings,
  User, MessageSquare, Award, Package, Shield, Database, Wrench, GraduationCap, UserCheck,
  PieChart, LineChart, Calculator, CreditCard, Truck, Warehouse, ShoppingCart, Receipt,
  UserPlus, UserMinus, Search, Filter, Download, Upload, Eye, Edit, Trash2, Plus,
  Mail, Phone, MapPin, Globe, Star, Heart, Bookmark, Flag, AlertTriangle, CheckCircle,
  XCircle, Info, HelpCircle, ExternalLink, Zap, Lightbulb, Compass, Navigation, Brain, Video, Bed,
  Columns, Crown, Layout, Image
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Input } from '@/app/components/ui/input';

interface AdvancedLeftSidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onOpenProfile?: () => void;
}

const AdvancedLeftSidebar: React.FC<AdvancedLeftSidebarProps> = ({ 
  currentPage, 
  onNavigate, 
  onLogout,
  onOpenProfile 
}) => {
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main-nav']);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getNavigationItems = (role: UserRole) => {
    const commonItems = [
      { key: 'dashboard', icon: Home, label: 'Dashboard', color: 'from-blue-500 to-indigo-500' },
      { key: 'profile', icon: User, label: 'Profil', color: 'from-purple-500 to-pink-500' },
      { key: 'search', icon: Search, label: 'Shakisha', color: 'from-green-500 to-teal-500' },
      { key: 'notifications', icon: Bell, label: 'Amamenyo', color: 'from-yellow-500 to-orange-500' }
    ];

    const roleSpecificItems = {
      student: [
        { key: 'classes', icon: BookOpen, label: 'Amaklasi', color: 'from-blue-500 to-cyan-500' },
        { key: 'competitions', icon: Trophy, label: 'Amarushanwa', color: 'from-purple-500 to-pink-500' },
        { key: 'library', icon: BookOpen, label: 'Isomero', color: 'from-indigo-500 to-blue-500' },
        { key: 'transport', icon: Truck, label: 'Transport', color: 'from-green-500 to-teal-500' },
        { key: 'hostel', icon: Bed, label: 'Hostel', color: 'from-orange-500 to-red-500' },
        { key: 'assignments', icon: ClipboardList, label: 'Ibizamini', color: 'from-purple-500 to-violet-500' },
        { key: 'grades', icon: Award, label: 'Amanota', color: 'from-green-500 to-emerald-500' },
        { key: 'attendance', icon: Calendar, label: 'Kwitabira', color: 'from-orange-500 to-red-500' },
        { key: 'activities', icon: Trophy, label: 'Ibikorwa', color: 'from-pink-500 to-rose-500' },
        { key: 'timetable', icon: Clock, label: 'Gahunda', color: 'from-teal-500 to-cyan-500' }
      ],
      parent: [
        { key: 'children', icon: Users, label: 'Abana', color: 'from-blue-500 to-indigo-500' },
        { key: 'grades', icon: Award, label: 'Amanota', color: 'from-green-500 to-teal-500' },
        { key: 'attendance', icon: UserCheck, label: 'Kwitabira', color: 'from-orange-500 to-red-500' },
        { key: 'fees', icon: DollarSign, label: 'Amafaranga', color: 'from-yellow-500 to-amber-500' },
        { key: 'communication', icon: MessageSquare, label: 'Itumanaho', color: 'from-purple-500 to-pink-500' },
        { key: 'events', icon: Calendar, label: 'Ibirori', color: 'from-indigo-500 to-blue-500' },
        { key: 'reports', icon: FileText, label: 'Raporo', color: 'from-teal-500 to-cyan-500' }
      ],
      teacher: [
        { key: 'classes', icon: BookOpen, label: 'Amaklasi', color: 'from-blue-500 to-indigo-500' },
        { key: 'students', icon: Users, label: 'Abanyeshuri', color: 'from-green-500 to-teal-500' },
        { key: 'gradebook', icon: ClipboardList, label: 'Amanota', color: 'from-purple-500 to-violet-500' },
        { key: 'attendance', icon: UserCheck, label: 'Kwitabira', color: 'from-orange-500 to-red-500' },
        { key: 'assignments', icon: FileText, label: 'Ibizamini', color: 'from-yellow-500 to-amber-500' },
        { key: 'resources', icon: Database, label: 'Ibikoresho', color: 'from-pink-500 to-rose-500' },
        { key: 'schedule', icon: Calendar, label: 'Gahunda', color: 'from-indigo-500 to-blue-500' }
      ],
      admin: [
        { key: 'users', icon: Users, label: 'Abakoresha', color: 'from-blue-500 to-indigo-500' },
        { key: 'student-sheets', icon: FileText, label: 'Student Sheets (Global)', color: 'from-cyan-500 to-teal-500' },
        { key: 'student-columns', icon: Columns, label: 'Student Columns', color: 'from-teal-500 to-green-500' },
        { key: 'trades-management', icon: Award, label: 'Trades & Courses', color: 'from-orange-500 to-amber-500' },
        { key: 'leadership-management', icon: Crown, label: 'Leadership', color: 'from-yellow-500 to-orange-500' },
        { key: 'comprehensive-content', icon: FileText, label: 'Gucunga Ibikubiyemo', color: 'from-yellow-500 to-green-500' },
        { key: 'page-manager', icon: Layout, label: 'Page Manager', color: 'from-indigo-500 to-purple-500' },
        { key: 'gallery-manager', icon: Image, label: 'Gallery Manager', color: 'from-pink-500 to-rose-500' },
        { key: 'system-settings', icon: Settings, label: 'System Settings', color: 'from-slate-500 to-zinc-500' },
        { key: 'student-management', icon: GraduationCap, label: 'Abanyeshuri & Abarimu', color: 'from-green-500 to-emerald-500' },
        { key: 'comprehensive-staff', icon: Users, label: 'Staff Management', color: 'from-purple-500 to-violet-500' },
        { key: 'homework-management', icon: BookOpen, label: 'Homework', color: 'from-orange-500 to-red-500' },
        { key: 'assignments-management', icon: ClipboardList, label: 'Assignments', color: 'from-teal-500 to-cyan-500' },
        { key: 'quiz-system', icon: Brain, label: 'Quiz System', color: 'from-purple-500 to-pink-500' },
        { key: 'live-chat', icon: MessageSquare, label: 'Live Chat', color: 'from-blue-500 to-indigo-500' },
        { key: 'gamification', icon: Trophy, label: 'Gamification', color: 'from-yellow-500 to-amber-500' },
        { key: 'live-study', icon: Video, label: 'Live Study', color: 'from-red-500 to-pink-500' },
        { key: 'collaboration', icon: Users, label: 'Study Groups', color: 'from-green-500 to-teal-500' },
        { key: 'analytics', icon: BarChart3, label: 'Imibare', color: 'from-green-500 to-teal-500' },
        { key: 'reports', icon: FileText, label: 'Raporo', color: 'from-purple-500 to-violet-500' },
        { key: 'security', icon: Shield, label: 'Umutekano', color: 'from-yellow-500 to-amber-500' },
        { key: 'backup', icon: Database, label: 'Backup', color: 'from-pink-500 to-rose-500' },
        { key: 'logs', icon: Activity, label: 'Logs', color: 'from-indigo-500 to-blue-500' },
        { key: 'medical-system', icon: Activity, label: 'Ubuzima', color: 'from-blue-600 to-cyan-600' },
        { key: 'library-system', icon: BookOpen, label: 'Isomero', color: 'from-green-600 to-emerald-600' },
        { key: 'exam-management', icon: ClipboardList, label: 'Ibizamini', color: 'from-purple-600 to-pink-600' },
        { key: 'hostel-management', icon: Bed, label: 'Hostel', color: 'from-orange-600 to-red-600' }
      ],
      accountant: [
        { key: 'parent-applications', icon: UserCheck, label: 'Ibyifuzo by\'Ababyeyi', color: 'from-teal-500 to-cyan-500' },
        { key: 'fees', icon: DollarSign, label: 'Amafaranga', color: 'from-green-500 to-teal-500' },
        { key: 'payments', icon: CreditCard, label: 'Kwishyura', color: 'from-blue-500 to-indigo-500' },
        { key: 'invoices', icon: Receipt, label: 'Inyemezabuguzi', color: 'from-purple-500 to-violet-500' },
        { key: 'budgets', icon: Calculator, label: 'Ingengo y\'Imari', color: 'from-orange-500 to-red-500' },
        { key: 'reports', icon: PieChart, label: 'Raporo', color: 'from-yellow-500 to-amber-500' },
        { key: 'expenses', icon: TrendingUp, label: 'Amafaranga Yasohotse', color: 'from-pink-500 to-rose-500' },
        { key: 'analytics', icon: LineChart, label: 'Imibare', color: 'from-indigo-500 to-blue-500' }
      ],
      stock_manager: [
        { key: 'inventory', icon: Package, label: 'Ibicuruzwa', color: 'from-blue-500 to-indigo-500' },
        { key: 'orders', icon: ShoppingCart, label: 'Ibicuruzwa Byatumijwe', color: 'from-green-500 to-teal-500' },
        { key: 'suppliers', icon: Truck, label: 'Abatanga', color: 'from-purple-500 to-violet-500' },
        { key: 'warehouse', icon: Warehouse, label: 'Ububiko', color: 'from-orange-500 to-red-500' },
        { key: 'reports', icon: BarChart3, label: 'Raporo', color: 'from-yellow-500 to-amber-500' },
        { key: 'alerts', icon: AlertTriangle, label: 'Amamenyo', color: 'from-pink-500 to-rose-500' },
        { key: 'analytics', icon: TrendingUp, label: 'Imibare', color: 'from-indigo-500 to-blue-500' }
      ],
      director_of_study: [
        { key: 'academics', icon: BookOpen, label: 'Amasomo', color: 'from-blue-500 to-indigo-500' },
        { key: 'application-management', icon: FileText, label: 'Ibyifuzo byo Kwiga', color: 'from-green-500 to-teal-500' },
        { key: 'parent-applications', icon: UserCheck, label: 'Ibyifuzo by\'Ababyeyi', color: 'from-teal-500 to-cyan-500' },
        { key: 'curriculum', icon: GraduationCap, label: 'Integanyanyigisho', color: 'from-green-500 to-teal-500' },
        { key: 'teachers', icon: Users, label: 'Abarimu', color: 'from-purple-500 to-violet-500' },
        { key: 'performance', icon: TrendingUp, label: 'Imikorere', color: 'from-orange-500 to-red-500' },
        { key: 'examinations', icon: ClipboardList, label: 'Ibizamini', color: 'from-yellow-500 to-amber-500' },
        { key: 'timetables', icon: Calendar, label: 'Gahunda', color: 'from-pink-500 to-rose-500' },
        { key: 'reports', icon: FileText, label: 'Raporo', color: 'from-indigo-500 to-blue-500' }
      ],
      director_of_discipline: [
        { key: 'parent-applications', icon: UserCheck, label: 'Ibyifuzo by\'Ababyeyi', color: 'from-teal-500 to-cyan-500' },
        { key: 'discipline-management', icon: Shield, label: 'Gucunga Indero', color: 'from-red-500 to-orange-500' },
        { key: 'incidents', icon: AlertTriangle, label: 'Ibibazo', color: 'from-yellow-500 to-amber-500' },
        { key: 'counseling', icon: Heart, label: 'Ubujyanama', color: 'from-pink-500 to-rose-500' },
        { key: 'rules', icon: BookOpen, label: 'Amategeko', color: 'from-blue-500 to-indigo-500' },
        { key: 'monitoring', icon: Eye, label: 'Gukurikirana', color: 'from-green-500 to-teal-500' },
        { key: 'reports', icon: FileText, label: 'Raporo', color: 'from-purple-500 to-violet-500' },
        { key: 'meetings', icon: Users, label: 'Inama', color: 'from-indigo-500 to-blue-500' }
      ],
      headmaster: [
        { key: 'overview', icon: Home, label: 'Incamake', color: 'from-blue-500 to-indigo-500' },
        { key: 'staff-management', icon: Users, label: 'Ubuyobozi bw\'Ishuri', color: 'from-purple-500 to-pink-500' },
        { key: 'application-management', icon: FileText, label: 'Ibyifuzo byo Kwiga', color: 'from-green-500 to-teal-500' },
        { key: 'parent-applications', icon: UserCheck, label: 'Ibyifuzo by\'Ababyeyi', color: 'from-teal-500 to-cyan-500' },
        { key: 'students', icon: GraduationCap, label: 'Abanyeshuri', color: 'from-purple-500 to-violet-500' },
        { key: 'finances', icon: DollarSign, label: 'Amafaranga', color: 'from-orange-500 to-red-500' },
        { key: 'performance', icon: TrendingUp, label: 'Imikorere', color: 'from-yellow-500 to-amber-500' },
        { key: 'meetings', icon: Calendar, label: 'Inama', color: 'from-pink-500 to-rose-500' },
        { key: 'reports', icon: FileText, label: 'Raporo', color: 'from-indigo-500 to-blue-500' },
        { key: 'medical-system', icon: Activity, label: 'Ubuzima', color: 'from-blue-600 to-cyan-600' },
        { key: 'library-system', icon: BookOpen, label: 'Isomero', color: 'from-green-600 to-emerald-600' },
        { key: 'exam-management', icon: ClipboardList, label: 'Ibizamini', color: 'from-purple-600 to-pink-600' },
        { key: 'hostel-management', icon: Bed, label: 'Hostel', color: 'from-orange-600 to-red-600' }
      ],
      advisor: [
        { key: 'parent-applications', icon: UserCheck, label: 'Ibyifuzo by\'Ababyeyi', color: 'from-teal-500 to-cyan-500' },
        { key: 'student-sheets', icon: FileText, label: 'Student Sheets', color: 'from-cyan-500 to-teal-500' },
        { key: 'reports', icon: FileText, label: 'Raporo', color: 'from-indigo-500 to-blue-500' }
      ],
      director_study: [
        { key: 'academics', icon: BookOpen, label: 'Amasomo', color: 'from-blue-500 to-indigo-500' },
        { key: 'application-management', icon: FileText, label: 'Ibyifuzo byo Kwiga', color: 'from-green-500 to-teal-500' },
        { key: 'parent-applications', icon: UserCheck, label: 'Ibyifuzo by\'Ababyeyi', color: 'from-teal-500 to-cyan-500' },
        { key: 'reports', icon: FileText, label: 'Raporo', color: 'from-indigo-500 to-blue-500' }
      ],
      dod: [
        { key: 'parent-applications', icon: UserCheck, label: 'Ibyifuzo by\'Ababyeyi', color: 'from-teal-500 to-cyan-500' },
        { key: 'discipline-management', icon: Shield, label: 'Gucunga Indero', color: 'from-red-500 to-orange-500' },
        { key: 'reports', icon: FileText, label: 'Raporo', color: 'from-purple-500 to-violet-500' }
      ]
    };

    return [...commonItems, ...(roleSpecificItems[role] || [])];
  };

  const getQuickActions = (role: UserRole) => {
    const actions = {
      student: [
        { key: 'submit-assignment', icon: Upload, label: 'Shyira Akazi' },
        { key: 'view-grades', icon: Award, label: 'Reba Amanota' },
        { key: 'check-attendance', icon: Calendar, label: 'Reba Kwitabira' }
      ],
      parent: [
        { key: 'message-teacher', icon: MessageSquare, label: 'Andikira Umwarimu' },
        { key: 'pay-fees', icon: CreditCard, label: 'Ishyura Amafaranga' },
        { key: 'view-report', icon: FileText, label: 'Reba Raporo' }
      ],
      teacher: [
        { key: 'take-attendance', icon: UserCheck, label: 'Andika Kwitabira' },
        { key: 'grade-assignments', icon: Edit, label: 'Tanga Amanota' },
        { key: 'create-lesson', icon: Plus, label: 'Kora Isomo' }
      ],
      admin: [
        { key: 'add-user', icon: UserPlus, label: 'Ongeraho Umukoresha' },
        { key: 'generate-report', icon: FileText, label: 'Kora Raporo' },
        { key: 'backup-data', icon: Database, label: 'Backup Data' }
      ],
      accountant: [
        { key: 'process-payment', icon: CreditCard, label: 'Kwemeza Kwishyura' },
        { key: 'generate-invoice', icon: Receipt, label: 'Kora Invoice' },
        { key: 'view-budget', icon: Calculator, label: 'Reba Budget' }
      ],
      stock_manager: [
        { key: 'add-item', icon: Plus, label: 'Ongeraho Ikintu' },
        { key: 'check-stock', icon: Package, label: 'Reba Stock' },
        { key: 'order-supplies', icon: ShoppingCart, label: 'Tumiza Ibikoresho' }
      ],
      director_of_study: [
        { key: 'review-curriculum', icon: BookOpen, label: 'Suzuma Integanyanyigisho' },
        { key: 'schedule-exam', icon: Calendar, label: 'Tegura Ikizamini' },
        { key: 'evaluate-teacher', icon: Star, label: 'Suzuma Umwarimu' }
      ],
      director_of_discipline: [
        { key: 'record-incident', icon: AlertTriangle, label: 'Andika Ikibazo' },
        { key: 'schedule-counseling', icon: Heart, label: 'Tegura Ubujyanama' },
        { key: 'review-rules', icon: BookOpen, label: 'Suzuma Amategeko' }
      ],
      headmaster: [
        { key: 'schedule-meeting', icon: Calendar, label: 'Tegura Inama' },
        { key: 'review-performance', icon: TrendingUp, label: 'Suzuma Imikorere' },
        { key: 'approve-budget', icon: CheckCircle, label: 'Emeza Budget' }
      ]
    };

    return actions[role] || [];
  };

  const navigationItems = user ? getNavigationItems(user.role) : [];
  const quickActions = user ? getQuickActions(user.role) : [];

  const filteredNavItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentActivities = [
    { title: 'Kwinjira mu sisiteme', time: '2 amasaha ashize', icon: User, color: 'text-green-600' },
    { title: 'Gusoma ubutumwa', time: '5 amasaha ashize', icon: Mail, color: 'text-blue-600' },
    { title: 'Kureba raporo', time: '1 umunsi ushize', icon: FileText, color: 'text-purple-600' },
    { title: 'Guhindura profil', time: '2 iminsi ishize', icon: Edit, color: 'text-orange-600' }
  ];

  const notifications = [
    { title: 'Ubutumwa bushya', count: 3, color: 'bg-blue-500' },
    { title: 'Ibizamini bitegerejwe', count: 2, color: 'bg-yellow-500' },
    { title: 'Amamenyo ya sisiteme', count: 1, color: 'bg-red-500' }
  ];

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="hidden lg:block w-80 bg-gradient-to-b from-white to-yellow-50/30 border-r-2 border-yellow-200 h-full overflow-hidden shadow-xl"
    >
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* User Profile Card */}
          {user && (
            <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-50 to-green-50 hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-16 w-16 border-2 border-yellow-400 cursor-pointer hover:scale-105 transition-transform" onClick={onOpenProfile}>
                    <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-xl font-bold">
                      {user?.first_name?.charAt(0) || user?.name?.charAt(0) || 'U'}{user?.last_name?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate cursor-pointer hover:text-yellow-600 transition-colors" onClick={onOpenProfile}>
                      {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
                    <Badge className="mt-1 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 text-xs">
                      Ukora
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Bar */}
          <Card className="border-2 border-yellow-200 shadow-lg">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Shakisha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-yellow-200 focus:border-yellow-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Notifications */}
          {notifications.length > 0 && (
            <Card className="border-2 border-yellow-200 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-gray-700">Amamenyo</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('notifications')}
                    className="h-6 w-6 p-0"
                  >
                    {expandedSections.includes('notifications') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes('notifications') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <CardContent className="space-y-2 pb-4">
                      {notifications.map((notification, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-green-50 hover:from-yellow-100 hover:to-green-100 transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-medium text-gray-700">{notification.title}</span>
                          <Badge className={`${notification.color} text-white border-0`}>
                            {notification.count}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* Main Navigation */}
          <Card className="border-2 border-yellow-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-700">Ubuyobozi</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('main-nav')}
                  className="h-6 w-6 p-0"
                >
                  {expandedSections.includes('main-nav') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedSections.includes('main-nav') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <CardContent className="space-y-2 pb-4">
                    {filteredNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.key}
                          variant="ghost"
                          onClick={() => onNavigate && onNavigate(item.key)}
                          className={`w-full justify-start h-12 ${
                            currentPage === item.key
                              ? 'bg-gradient-to-r from-yellow-100 to-green-100 text-yellow-700 border-l-4 border-yellow-500'
                              : 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50'
                          }`}
                        >
                          <div className={`p-2 rounded-md bg-gradient-to-br ${item.color} mr-3`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </Button>
                      );
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <Card className="border-2 border-yellow-200 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-gray-700">Ibikorwa Byihuse</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('quick-actions')}
                    className="h-6 w-6 p-0"
                  >
                    {expandedSections.includes('quick-actions') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes('quick-actions') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <CardContent className="space-y-2 pb-4">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={action.key}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start border-yellow-200 hover:bg-yellow-50 hover:border-yellow-400"
                            onClick={() => onNavigate && onNavigate(action.key)}
                          >
                            <Icon className="h-4 w-4 mr-2 text-yellow-600" />
                            {action.label}
                          </Button>
                        );
                      })}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* Recent Activities */}
          <Card className="border-2 border-yellow-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-700">Ibikorwa Bya Vuba</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('activities')}
                  className="h-6 w-6 p-0"
                >
                  {expandedSections.includes('activities') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedSections.includes('activities') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-3 pb-4">
                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-yellow-50 transition-colors">
                          <Icon className={`h-4 w-4 mt-0.5 ${activity.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500 flex items-center mt-0.5">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* System Status */}
          <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-green-50 to-teal-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Uko Sisiteme Imeze</p>
                  <p className="text-xs text-gray-600">Byose birakora neza</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600">Birakora</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button */}
          {user && (
            <Button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-2 border-red-200 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sohoka
            </Button>
          )}
        </div>
      </ScrollArea>
    </motion.aside>
  );
};

export default AdvancedLeftSidebar;