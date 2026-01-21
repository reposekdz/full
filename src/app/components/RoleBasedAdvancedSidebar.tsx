import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Calendar, BookOpen, Trophy, Users, Bell, Clock, FileText, TrendingUp, Target, Activity,
  ChevronRight, ChevronDown, Briefcase, DollarSign, BarChart3, ClipboardList, LogOut,
  Settings, Package, Receipt, Wallet, GraduationCap, Award, MessageSquare, Heart, Library,
  Shield, Zap, Star, Flag, TrendingDown, PieChart, FolderOpen, UserCheck, Building, Truck,
  Phone, Mail, MapPin, Calculator, FileSpreadsheet, CreditCard, Store, AlertTriangle,
  ShoppingCart, Boxes, Eye, Edit2, Download, Upload, Plus, Minus, LayoutDashboard,
  School, ChevronLeft, Menu, X, User, Monitor, Percent, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';

interface MenuItem {
  key: string;
  icon: any;
  label: string;
  labelRw: string;
  badge?: string | number;
  color?: string;
  children?: MenuItem[];
}

interface RoleBasedAdvancedSidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onProfileView?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const RoleBasedAdvancedSidebar: React.FC<RoleBasedAdvancedSidebarProps> = ({ 
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

  const roleMenus: Record<UserRole, MenuItem[]> = {
    student: [
      {
        key: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        labelRw: 'Ikibaho',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'academics',
        icon: BookOpen,
        label: 'Academics',
        labelRw: 'Amasomo',
        color: 'from-green-600 to-teal-600',
        children: [
          { key: 'courses', icon: BookOpen, label: 'My Courses', labelRw: 'Amasomo Yanjye' },
          { key: 'timetable', icon: Calendar, label: 'Timetable', labelRw: 'Gahunda' },
          { key: 'exams', icon: FileText, label: 'Exams', labelRw: 'Ibizamini', badge: 3 },
          { key: 'results', icon: Award, label: 'Results', labelRw: 'Ibisubizo' },
          { key: 'library', icon: Library, label: 'Library', labelRw: 'Isomero' },
        ]
      },
      {
        key: 'performance',
        icon: TrendingUp,
        label: 'Performance',
        labelRw: 'Imikorere',
        color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'grades', icon: BarChart3, label: 'Grades', labelRw: 'Amanota' },
          { key: 'attendance', icon: UserCheck, label: 'Attendance', labelRw: 'Kwitabira' },
          { key: 'progress', icon: TrendingUp, label: 'Progress Report', labelRw: 'Raporo' },
        ]
      },
      {
        key: 'activities',
        icon: Trophy,
        label: 'Activities',
        labelRw: 'Ibikorwa',
        color: 'from-orange-600 to-red-600',
        children: [
          { key: 'sports', icon: Trophy, label: 'Sports', labelRw: 'Siporo' },
          { key: 'events', icon: Calendar, label: 'Events', labelRw: 'Ibirori' },
          { key: 'clubs', icon: Users, label: 'Clubs', labelRw: 'Amatsinda' },
          { key: 'achievements', icon: Award, label: 'Achievements', labelRw: 'Intsinzi' },
        ]
      },
      {
        key: 'support',
        icon: Heart,
        label: 'Support',
        labelRw: 'Ubufasha',
        color: 'from-pink-600 to-purple-600',
        children: [
          { key: 'counseling', icon: MessageSquare, label: 'Counseling', labelRw: 'Inama' },
          { key: 'health', icon: Heart, label: 'Health Center', labelRw: 'Ivuriro' },
        ]
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Settings',
        labelRw: 'Igenamiterere',
        color: 'from-gray-600 to-gray-700'
      },
    ],

    parent: [
      {
        key: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        labelRw: 'Ikibaho',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'children',
        icon: Users,
        label: 'My Children',
        labelRw: 'Abana Banjye',
        color: 'from-green-600 to-teal-600',
        children: [
          { key: 'child-performance', icon: TrendingUp, label: 'Performance', labelRw: 'Imikorere' },
          { key: 'child-attendance', icon: UserCheck, label: 'Attendance', labelRw: 'Kwitabira' },
          { key: 'child-results', icon: Award, label: 'Results', labelRw: 'Ibisubizo' },
          { key: 'child-behavior', icon: Shield, label: 'Behavior', labelRw: 'Imyitwarire' },
        ]
      },
      {
        key: 'financial',
        icon: DollarSign,
        label: 'Financial',
        labelRw: 'Amafaranga',
        color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'fees', icon: Receipt, label: 'School Fees', labelRw: 'Amashuri' },
          { key: 'payments', icon: CreditCard, label: 'Payments', labelRw: 'Kwishyura' },
          { key: 'invoices', icon: FileText, label: 'Invoices', labelRw: 'Inyemezabuguzi' },
        ]
      },
      {
        key: 'communication',
        icon: MessageSquare,
        label: 'Communication',
        labelRw: 'Itumanaho',
        color: 'from-purple-600 to-pink-600',
        children: [
          { key: 'messages', icon: Mail, label: 'Messages', labelRw: 'Ubutumwa', badge: 5 },
          { key: 'announcements', icon: Bell, label: 'Announcements', labelRw: 'Amatangazo' },
          { key: 'meetings', icon: Users, label: 'Meetings', labelRw: 'Inama' },
        ]
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Settings',
        labelRw: 'Igenamiterere',
        color: 'from-gray-600 to-gray-700'
      },
    ],

    director_of_study: [
      {
        key: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        labelRw: 'Ikibaho',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'students',
        icon: Users,
        label: 'Student Management',
        labelRw: 'Gucunga Abanyeshuri',
        color: 'from-green-600 to-teal-600',
        children: [
          { key: 'all-students', icon: Users, label: 'All Students', labelRw: 'Abanyeshuri Bose' },
          { key: 'enrollment', icon: UserCheck, label: 'Enrollment', labelRw: 'Kwandikisha' },
          { key: 'transfers', icon: TrendingUp, label: 'Transfers', labelRw: 'Kwimura' },
          { key: 'graduates', icon: GraduationCap, label: 'Graduates', labelRw: 'Barangije' },
        ]
      },
      {
        key: 'academics',
        icon: BookOpen,
        label: 'Academic Programs',
        labelRw: 'Gahunda z\'Amasomo',
        color: 'from-purple-600 to-pink-600',
        children: [
          { key: 'curriculum', icon: BookOpen, label: 'Curriculum', labelRw: 'Integanyanyigisho' },
          { key: 'courses', icon: FolderOpen, label: 'Courses', labelRw: 'Amasomo' },
          { key: 'timetables', icon: Calendar, label: 'Timetables', labelRw: 'Gahunda' },
          { key: 'exams', icon: FileText, label: 'Examinations', labelRw: 'Ibizamini' },
          { key: 'results', icon: Award, label: 'Results', labelRw: 'Ibisubizo' },
        ]
      },
      {
        key: 'teachers',
        icon: School,
        label: 'Teachers',
        labelRw: 'Abarimu',
        color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'all-teachers', icon: Users, label: 'All Teachers', labelRw: 'Abarimu Bose' },
          { key: 'assignments', icon: ClipboardList, label: 'Assignments', labelRw: 'Ibikorwa' },
          { key: 'performance', icon: BarChart3, label: 'Performance', labelRw: 'Imikorere' },
        ]
      },
      {
        key: 'reports',
        icon: FileText,
        label: 'Reports & Analytics',
        labelRw: 'Raporo n\'Imibare',
        color: 'from-orange-600 to-red-600',
        children: [
          { key: 'academic-reports', icon: BarChart3, label: 'Academic Reports', labelRw: 'Raporo z\'Amasomo' },
          { key: 'statistics', icon: PieChart, label: 'Statistics', labelRw: 'Imibare' },
          { key: 'analytics', icon: TrendingUp, label: 'Analytics', labelRw: 'Isesengura' },
        ]
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Settings',
        labelRw: 'Igenamiterere',
        color: 'from-gray-600 to-gray-700'
      },
    ],

    director_of_discipline: [
      {
        key: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        labelRw: 'Ikibaho',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'discipline',
        icon: Shield,
        label: 'Discipline Management',
        labelRw: 'Gucunga Imyitwarire',
        color: 'from-red-600 to-orange-600',
        children: [
          { key: 'incidents', icon: AlertTriangle, label: 'Incidents', labelRw: 'Ibintu Byabaye', badge: 12 },
          { key: 'cases', icon: ClipboardList, label: 'Disciplinary Cases', labelRw: 'Ibibazo' },
          { key: 'warnings', icon: Bell, label: 'Warnings', labelRw: 'Iburira' },
          { key: 'suspensions', icon: XCircle, label: 'Suspensions', labelRw: 'Guhagarika' },
        ]
      },
      {
        key: 'attendance',
        icon: UserCheck,
        label: 'Attendance',
        labelRw: 'Kwitabira',
        color: 'from-green-600 to-teal-600',
        children: [
          { key: 'daily-attendance', icon: Calendar, label: 'Daily Attendance', labelRw: 'Kwitabira buri munsi' },
          { key: 'absenteeism', icon: TrendingDown, label: 'Absenteeism', labelRw: 'Kutitabira' },
          { key: 'reports', icon: FileText, label: 'Reports', labelRw: 'Raporo' },
        ]
      },
      {
        key: 'student-welfare',
        icon: Heart,
        label: 'Student Welfare',
        labelRw: 'Imibereho y\'Abanyeshuri',
        color: 'from-pink-600 to-purple-600',
        children: [
          { key: 'counseling', icon: MessageSquare, label: 'Counseling', labelRw: 'Inama' },
          { key: 'health', icon: Heart, label: 'Health', labelRw: 'Ubuzima' },
          { key: 'safety', icon: Shield, label: 'Safety', labelRw: 'Umutekano' },
        ]
      },
      {
        key: 'sports',
        icon: Trophy,
        label: 'Sports & Activities',
        labelRw: 'Siporo n\'Ibikorwa',
        color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'teams', icon: Users, label: 'Teams', labelRw: 'Amakipe' },
          { key: 'events', icon: Calendar, label: 'Events', labelRw: 'Ibirori' },
          { key: 'achievements', icon: Award, label: 'Achievements', labelRw: 'Intsinzi' },
        ]
      },
      {
        key: 'reports',
        icon: FileText,
        label: 'Reports',
        labelRw: 'Raporo',
        color: 'from-blue-600 to-indigo-600',
        children: [
          { key: 'discipline-reports', icon: FileText, label: 'Discipline Reports', labelRw: 'Raporo z\'Imyitwarire' },
          { key: 'attendance-reports', icon: BarChart3, label: 'Attendance Reports', labelRw: 'Raporo y\'Kwitabira' },
        ]
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Settings',
        labelRw: 'Igenamiterere',
        color: 'from-gray-600 to-gray-700'
      },
    ],

    accountant: [
      {
        key: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        labelRw: 'Ikibaho',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'fees',
        icon: Receipt,
        label: 'Fee Management',
        labelRw: 'Gucunga Amafaranga',
        color: 'from-green-600 to-teal-600',
        children: [
          { key: 'fee-structure', icon: Calculator, label: 'Fee Structure', labelRw: 'Imiterere y\'Amafaranga' },
          { key: 'invoices', icon: FileText, label: 'Invoices', labelRw: 'Inyemezabuguzi' },
          { key: 'payments', icon: CreditCard, label: 'Payments', labelRw: 'Kwishyura' },
          { key: 'receipts', icon: Receipt, label: 'Receipts', labelRw: 'Impapuro z\'Kwishyura' },
          { key: 'outstanding', icon: AlertTriangle, label: 'Outstanding', labelRw: 'Bitarishyurwa', badge: 47 },
        ]
      },
      {
        key: 'transactions',
        icon: DollarSign,
        label: 'Transactions',
        labelRw: 'Ibyaguzwe',
        color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'income', icon: TrendingUp, label: 'Income', labelRw: 'Amafaranga Yinjiye' },
          { key: 'expenses', icon: TrendingDown, label: 'Expenses', labelRw: 'Amafaranga Yasozwe' },
          { key: 'transfers', icon: ArrowRight, label: 'Transfers', labelRw: 'Kohereza' },
          { key: 'refunds', icon: Minus, label: 'Refunds', labelRw: 'Gusubiza' },
        ]
      },
      {
        key: 'reports',
        icon: FileText,
        label: 'Financial Reports',
        labelRw: 'Raporo z\'Amafaranga',
        color: 'from-purple-600 to-pink-600',
        children: [
          { key: 'balance-sheet', icon: FileSpreadsheet, label: 'Balance Sheet', labelRw: 'Imbonerahamwe' },
          { key: 'income-statement', icon: BarChart3, label: 'Income Statement', labelRw: 'Raporo y\'Inyungu' },
          { key: 'cash-flow', icon: TrendingUp, label: 'Cash Flow', labelRw: 'Amafaranga Yinjiye' },
          { key: 'tax-reports', icon: Percent, label: 'Tax Reports', labelRw: 'Raporo y\'Imisoro' },
        ]
      },
      {
        key: 'payroll',
        icon: Wallet,
        label: 'Payroll',
        labelRw: 'Imishahara',
        color: 'from-orange-600 to-red-600',
        children: [
          { key: 'staff-salaries', icon: Users, label: 'Staff Salaries', labelRw: 'Imishahara y\'Abakozi' },
          { key: 'salary-slips', icon: FileText, label: 'Salary Slips', labelRw: 'Impapuro z\'Umushahara' },
          { key: 'deductions', icon: Minus, label: 'Deductions', labelRw: 'Ibikurwaho' },
        ]
      },
      {
        key: 'analytics',
        icon: BarChart3,
        label: 'Analytics',
        labelRw: 'Isesengura',
        color: 'from-blue-600 to-indigo-600',
        children: [
          { key: 'financial-analytics', icon: PieChart, label: 'Financial Analytics', labelRw: 'Isesengura ry\'Amafaranga' },
          { key: 'trends', icon: TrendingUp, label: 'Trends', labelRw: 'Imyumvire' },
        ]
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Settings',
        labelRw: 'Igenamiterere',
        color: 'from-gray-600 to-gray-700'
      },
    ],

    stock_manager: [
      {
        key: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        labelRw: 'Ikibaho',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'inventory',
        icon: Package,
        label: 'Inventory',
        labelRw: 'Ibicuruzwa',
        color: 'from-green-600 to-teal-600',
        children: [
          { key: 'all-items', icon: Boxes, label: 'All Items', labelRw: 'Ibintu Byose' },
          { key: 'categories', icon: FolderOpen, label: 'Categories', labelRw: 'Ibyiciro' },
          { key: 'low-stock', icon: AlertTriangle, label: 'Low Stock', labelRw: 'Ibicye', badge: 23 },
          { key: 'out-of-stock', icon: XCircle, label: 'Out of Stock', labelRw: 'Byarangiye', badge: 8 },
        ]
      },
      {
        key: 'procurement',
        icon: ShoppingCart,
        label: 'Procurement',
        labelRw: 'Kugura',
        color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'purchase-orders', icon: ClipboardList, label: 'Purchase Orders', labelRw: 'Ibisabwa' },
          { key: 'suppliers', icon: Truck, label: 'Suppliers', labelRw: 'Abatanga' },
          { key: 'deliveries', icon: Package, label: 'Deliveries', labelRw: 'Ibyoherejwe' },
        ]
      },
      {
        key: 'distribution',
        icon: Truck,
        label: 'Distribution',
        labelRw: 'Kugabura',
        color: 'from-purple-600 to-pink-600',
        children: [
          { key: 'requisitions', icon: FileText, label: 'Requisitions', labelRw: 'Ibisabwa' },
          { key: 'issues', icon: Upload, label: 'Issues', labelRw: 'Gutanga' },
          { key: 'returns', icon: Download, label: 'Returns', labelRw: 'Kugaruka' },
        ]
      },
      {
        key: 'reports',
        icon: FileText,
        label: 'Reports',
        labelRw: 'Raporo',
        color: 'from-orange-600 to-red-600',
        children: [
          { key: 'stock-reports', icon: BarChart3, label: 'Stock Reports', labelRw: 'Raporo y\'Ibicuruzwa' },
          { key: 'usage-reports', icon: PieChart, label: 'Usage Reports', labelRw: 'Raporo y\'Ikoreshwa' },
          { key: 'audit', icon: Eye, label: 'Audit Trail', labelRw: 'Isuzuma' },
        ]
      },
      {
        key: 'warehouses',
        icon: Building,
        label: 'Warehouses',
        labelRw: 'Ububiko',
        color: 'from-blue-600 to-indigo-600',
        children: [
          { key: 'all-warehouses', icon: Store, label: 'All Warehouses', labelRw: 'Ububiko Bwose' },
          { key: 'locations', icon: MapPin, label: 'Locations', labelRw: 'Ahantu' },
        ]
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Settings',
        labelRw: 'Igenamiterere',
        color: 'from-gray-600 to-gray-700'
      },
    ],

    admin: [
      {
        key: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        labelRw: 'Ikibaho',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'users',
        icon: Users,
        label: 'User Management',
        labelRw: 'Gucunga Abakoresha',
        color: 'from-green-600 to-teal-600',
        children: [
          { key: 'all-users', icon: Users, label: 'All Users', labelRw: 'Abakoresha Bose' },
          { key: 'students', icon: GraduationCap, label: 'Students', labelRw: 'Abanyeshuri' },
          { key: 'staff', icon: Briefcase, label: 'Staff', labelRw: 'Abakozi' },
          { key: 'parents', icon: Users, label: 'Parents', labelRw: 'Ababyeyi' },
          { key: 'roles', icon: Shield, label: 'Roles & Permissions', labelRw: 'Inshingano' },
        ]
      },
      {
        key: 'academics',
        icon: BookOpen,
        label: 'Academic System',
        labelRw: 'Sisitemu y\'Amasomo',
        color: 'from-purple-600 to-pink-600',
        children: [
          { key: 'courses', icon: BookOpen, label: 'Courses', labelRw: 'Amasomo' },
          { key: 'timetables', icon: Calendar, label: 'Timetables', labelRw: 'Gahunda' },
          { key: 'exams', icon: FileText, label: 'Examinations', labelRw: 'Ibizamini' },
          { key: 'library', icon: Library, label: 'Library', labelRw: 'Isomero' },
        ]
      },
      {
        key: 'financial',
        icon: DollarSign,
        label: 'Financial System',
        labelRw: 'Sisitemu y\'Amafaranga',
        color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'fees', icon: Receipt, label: 'Fee Management', labelRw: 'Gucunga Amafaranga' },
          { key: 'accounting', icon: Calculator, label: 'Accounting', labelRw: 'Ibaruramari' },
          { key: 'payroll', icon: Wallet, label: 'Payroll', labelRw: 'Imishahara' },
        ]
      },
      {
        key: 'operations',
        icon: Package,
        label: 'Operations',
        labelRw: 'Ibikorwa',
        color: 'from-orange-600 to-red-600',
        children: [
          { key: 'stock', icon: Package, label: 'Stock Management', labelRw: 'Gucunga Ibicuruzwa' },
          { key: 'transport', icon: Truck, label: 'Transport', labelRw: 'Imodoka' },
          { key: 'facilities', icon: Building, label: 'Facilities', labelRw: 'Ibikorwa remezo' },
        ]
      },
      {
        key: 'reports',
        icon: BarChart3,
        label: 'Reports & Analytics',
        labelRw: 'Raporo n\'Isesengura',
        color: 'from-blue-600 to-indigo-600',
        children: [
          { key: 'system-reports', icon: FileText, label: 'System Reports', labelRw: 'Raporo za Sisitemu' },
          { key: 'analytics', icon: PieChart, label: 'Analytics', labelRw: 'Isesengura' },
          { key: 'audit-logs', icon: Eye, label: 'Audit Logs', labelRw: 'Inyandiko z\'Isuzuma' },
        ]
      },
      {
        key: 'system',
        icon: Monitor,
        label: 'System Settings',
        labelRw: 'Igenamiterere rya Sisitemu',
        color: 'from-gray-600 to-gray-700',
        children: [
          { key: 'general-settings', icon: Settings, label: 'General Settings', labelRw: 'Igenamiterere Rusange' },
          { key: 'security', icon: Shield, label: 'Security', labelRw: 'Umutekano' },
          { key: 'backup', icon: Download, label: 'Backup & Restore', labelRw: 'Kubika & Kugarura' },
        ]
      },
    ],

    teacher: [
      {
        key: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        labelRw: 'Ikibaho',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'classes',
        icon: BookOpen,
        label: 'My Classes',
        labelRw: 'Amaklasi Yanjye',
        color: 'from-green-600 to-teal-600',
        children: [
          { key: 'all-classes', icon: School, label: 'All Classes', labelRw: 'Amaklasi Yose' },
          { key: 'timetable', icon: Calendar, label: 'Timetable', labelRw: 'Gahunda' },
          { key: 'attendance', icon: UserCheck, label: 'Attendance', labelRw: 'Kwitabira' },
        ]
      },
      {
        key: 'students',
        icon: Users,
        label: 'Students',
        labelRw: 'Abanyeshuri',
        color: 'from-purple-600 to-pink-600',
        children: [
          { key: 'my-students', icon: Users, label: 'My Students', labelRw: 'Abanyeshuri Banjye' },
          { key: 'performance', icon: TrendingUp, label: 'Performance', labelRw: 'Imikorere' },
          { key: 'behavior', icon: Shield, label: 'Behavior', labelRw: 'Imyitwarire' },
        ]
      },
      {
        key: 'assessments',
        icon: FileText,
        label: 'Assessments',
        labelRw: 'Ibizamini',
        color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'exams', icon: FileText, label: 'Exams', labelRw: 'Ibizamini' },
          { key: 'assignments', icon: ClipboardList, label: 'Assignments', labelRw: 'Imirimo' },
          { key: 'grades', icon: Award, label: 'Grades', labelRw: 'Amanota' },
          { key: 'results', icon: BarChart3, label: 'Results', labelRw: 'Ibisubizo' },
        ]
      },
      {
        key: 'resources',
        icon: Library,
        label: 'Resources',
        labelRw: 'Ibikoresho',
        color: 'from-orange-600 to-red-600',
        children: [
          { key: 'materials', icon: BookOpen, label: 'Teaching Materials', labelRw: 'Ibikoresho byo Kwigisha' },
          { key: 'library', icon: Library, label: 'Library', labelRw: 'Isomero' },
        ]
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Settings',
        labelRw: 'Igenamiterere',
        color: 'from-gray-600 to-gray-700'
      },
    ],

    head_master: [
      {
        key: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        labelRw: 'Ikibaho',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'overview',
        icon: Eye,
        label: 'School Overview',
        labelRw: 'Incamake y\'Ishuri',
        color: 'from-green-600 to-teal-600',
        children: [
          { key: 'statistics', icon: BarChart3, label: 'Statistics', labelRw: 'Imibare' },
          { key: 'performance', icon: TrendingUp, label: 'Performance', labelRw: 'Imikorere' },
          { key: 'trends', icon: Activity, label: 'Trends', labelRw: 'Imyumvire' },
        ]
      },
      {
        key: 'management',
        icon: Users,
        label: 'Management',
        labelRw: 'Ubuyobozi',
        color: 'from-purple-600 to-pink-600',
        children: [
          { key: 'staff', icon: Briefcase, label: 'Staff', labelRw: 'Abakozi' },
          { key: 'students', icon: GraduationCap, label: 'Students', labelRw: 'Abanyeshuri' },
          { key: 'departments', icon: Building, label: 'Departments', labelRw: 'Amashami' },
        ]
      },
      {
        key: 'academics',
        icon: BookOpen,
        label: 'Academics',
        labelRw: 'Amasomo',
        color: 'from-yellow-600 to-orange-600',
        children: [
          { key: 'curriculum', icon: BookOpen, label: 'Curriculum', labelRw: 'Integanyanyigisho' },
          { key: 'exams', icon: FileText, label: 'Examinations', labelRw: 'Ibizamini' },
          { key: 'results', icon: Award, label: 'Results', labelRw: 'Ibisubizo' },
        ]
      },
      {
        key: 'financial',
        icon: DollarSign,
        label: 'Financial',
        labelRw: 'Amafaranga',
        color: 'from-orange-600 to-red-600',
        children: [
          { key: 'budget', icon: Calculator, label: 'Budget', labelRw: 'Ingengo y\'Imari' },
          { key: 'revenue', icon: TrendingUp, label: 'Revenue', labelRw: 'Amafaranga Yinjiye' },
          { key: 'expenses', icon: TrendingDown, label: 'Expenses', labelRw: 'Amafaranga Yasozwe' },
        ]
      },
      {
        key: 'reports',
        icon: FileText,
        label: 'Reports',
        labelRw: 'Raporo',
        color: 'from-blue-600 to-indigo-600',
        children: [
          { key: 'school-reports', icon: FileText, label: 'School Reports', labelRw: 'Raporo z\'Ishuri' },
          { key: 'analytics', icon: BarChart3, label: 'Analytics', labelRw: 'Isesengura' },
        ]
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Settings',
        labelRw: 'Igenamiterere',
        color: 'from-gray-600 to-gray-700'
      },
    ],
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
              isExpanded
                ? 'bg-gradient-to-r from-yellow-100 to-green-100 text-yellow-700'
                : 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50'
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
                {item.badge && (
                  <Badge className="bg-red-500 text-white">{item.badge}</Badge>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
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
        onClick={() => onNavigate && onNavigate(item.key)}
        className={`w-full justify-start h-auto py-2.5 px-4 mb-1 ${
          isActive
            ? 'bg-gradient-to-r from-yellow-100 to-green-100 text-yellow-700 border-l-4 border-yellow-500'
            : 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50'
        }`}
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {!isCollapsed && (
          <div className="flex-1 text-left min-w-0">
            <p className="font-medium text-sm truncate">{item.label}</p>
            <p className="text-xs text-gray-500 truncate">{item.labelRw}</p>
          </div>
        )}
        {!isCollapsed && item.badge && (
          <Badge className="bg-red-500 text-white ml-2">{item.badge}</Badge>
        )}
      </Button>
    );
  };

  const currentMenus = user ? roleMenus[user.role] : [];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-yellow-600 to-green-600 rounded-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">IPRC Kigali</h2>
                <p className="text-xs text-gray-600">Management System</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="lg:flex hidden"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* User Profile Card */}
          {user && (
            <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-50 to-green-50 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={onProfileView}
            >
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
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
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

          {/* Navigation Menu */}
          <div className="space-y-1">
            {currentMenus.map(item => renderMenuItem(item))}
          </div>

          {/* Quick Actions */}
          {user && !isCollapsed && (
            <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-500 to-green-500">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logout Button */}
          {user && (
            <Button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-2 border-red-200 shadow-lg"
              size="lg"
            >
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
      {/* Mobile Trigger Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`hidden lg:block bg-gradient-to-b from-white to-yellow-50/30 border-r-2 border-yellow-200 h-full transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-80'
        }`}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
};

export default RoleBasedAdvancedSidebar;
