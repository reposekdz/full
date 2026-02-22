import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Globe, Bell, User, Home, Trophy, Briefcase, Wrench, Phone, HelpCircle, Users, ChevronDown, ChevronRight, LogIn, UserPlus, BookOpen, Calendar, FileText, Award, GraduationCap, ClipboardList, TrendingUp, CheckCircle2, Code, Shield, MessageSquare } from 'lucide-react';
import { useLanguage, Language } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { EnhancedGlobalSearch } from '@/app/components/EnhancedGlobalSearch';
import { getRouteTitle } from '@/app/config/routes';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onSearch }) => {
  const { language, setLanguage, t } = useLanguage();
  
  // Safely get auth context - handle case where it's not ready
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.warn('AuthContext not ready yet');
    auth = null;
  }
  
  const { user, logout, getRoleDashboard } = auth || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedNavItems, setExpandedNavItems] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const displayUser = currentUser || user;

  const navItems = [
    { key: 'home', icon: Home, label: language === 'rw' ? 'Ahabanza' : 'Home', subItems: [] },
    { key: 'academics', icon: BookOpen, label: language === 'rw' ? 'Amasomo' : 'Academics', subItems: [] },
    { key: 'sports', icon: Trophy, label: language === 'rw' ? 'Siporo' : 'Sports', subItems: [] },
    { key: 'services', icon: Briefcase, label: language === 'rw' ? 'Serivisi' : 'Services', subItems: [] },
    { key: 'trades', icon: Wrench, label: language === 'rw' ? 'Imyuga' : 'Trades', subItems: [] },
    { key: 'leadership', icon: Shield, label: language === 'rw' ? 'Ubuyobozi' : 'Leadership', subItems: [] },
    { key: 'sms-services', icon: MessageSquare, label: language === 'rw' ? 'SMS Serivisi' : 'SMS Services', subItems: [] },
    { key: 'contactUs', icon: Phone, label: language === 'rw' ? 'Twandikire' : 'Contact', subItems: [] },
    { key: 'supports', icon: HelpCircle, label: language === 'rw' ? 'Ubufasha' : 'Support', subItems: [] },
    { key: 'developers', icon: Code, label: language === 'rw' ? 'Abatunganyije' : 'Developers', subItems: [] },
  ];

  // Role-based navigation visibility (keeps existing routes, just filters per role)
  const roleNavVisibility: Record<string, string[]> = {
    school_owner: navItems.map(n => n.key),
    admin: navItems.map(n => n.key),
    headmaster: navItems.map(n => n.key),
    director_study: ['home', 'academics', 'leadership', 'sms-services', 'contactUs', 'supports'],
    director_discipline: ['home', 'academics', 'leadership', 'sms-services', 'contactUs', 'supports'],
    accountant: ['home', 'services', 'leadership', 'supports', 'contactUs'],
    stock_manager: ['home', 'trades', 'services', 'supports', 'contactUs'],
    teacher: ['home', 'academics', 'leadership', 'contactUs', 'supports'],
    advisor: ['home', 'academics', 'leadership', 'contactUs', 'supports'],
    patron: ['home', 'academics', 'leadership', 'contactUs', 'supports'],
    matron: ['home', 'academics', 'leadership', 'contactUs', 'supports'],
    support_staff: ['home', 'services', 'supports', 'contactUs'],
    parent: ['home', 'academics', 'sports', 'supports', 'contactUs'],
    student: ['home', 'academics', 'sports', 'services', 'trades', 'supports', 'contactUs']
  };

  const allowedNavKeys = displayUser?.role && roleNavVisibility[displayUser.role]
    ? roleNavVisibility[displayUser.role]
    : navItems.map(n => n.key);
  const visibleNavItems = navItems.filter(item => allowedNavKeys.includes(item.key));

  const roleShortcuts: Record<string, { key: string; label: string }[]> = {
    accountant: [
      { key: 'payments-management', label: 'Payments' },
      { key: 'expenses-management', label: 'Expenses' },
      { key: 'financial-reports', label: 'Reports' },
      { key: 'salaries-management', label: 'Salaries' },
    ],
    stock_manager: [
      { key: 'services', label: 'Services' },
    ],
    director_study: [
      { key: 'dos-students', label: 'Students' },
      { key: 'dos-report-cards', label: 'Report Cards' },
    ],
    director_discipline: [
      { key: 'dod-discipline', label: 'Discipline' },
      { key: 'dod-reports', label: 'Reports' },
    ],
    teacher: [
      { key: 'classes', label: 'Classes' },
      { key: 'gradebook', label: 'Gradebook' },
      { key: 'schedule', label: 'Schedule' },
    ],
    student: [
      { key: 'dashboard-student', label: 'Dashboard' },
      { key: 'timetable-view', label: 'Timetable' },
    ],
    parent: [
      { key: 'dashboard-parent', label: 'Dashboard' },
      { key: 'supports', label: 'Support' },
    ],
  };

  const shortcuts = displayUser?.role ? roleShortcuts[displayUser.role] || [] : [];

  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const title = getRouteTitle(currentPage, language);
    setPageTitle(title);
    document.title = `${title} - Garden TVET School`;
  }, [currentPage, language]);

  const toggleNavItem = (key: string) => {
    setExpandedNavItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white via-yellow-50 to-green-50 backdrop-blur-lg border-b border-yellow-200 shadow-2xl"
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-20 md:h-24 gap-3">
            {/* Logo - Enhanced */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0 group"
              onClick={() => onNavigate('home')}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <motion.img
                  src="/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico"
                  alt="Garden TVET Logo"
                  className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain rounded-2xl shadow-2xl ring-2 ring-yellow-300 group-hover:ring-4 group-hover:ring-yellow-400 transition-all"
                />
              </motion.div>
              {/* Mobile School Name - Between Icon and Logo */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="sm:hidden min-w-0 flex-shrink-0"
              >
                <motion.p
                  className="text-sm font-black bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-600 bg-clip-text text-transparent leading-tight whitespace-nowrap"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Garden TVET School
                </motion.p>
              </motion.div>
              {/* Desktop School Name */}
              <div className="hidden sm:block min-w-0">
                <motion.p
                  className="text-base sm:text-lg md:text-2xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-600 bg-clip-text text-transparent leading-tight truncate"
                  animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Garden TVET School
                </motion.p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={pageTitle}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs sm:text-sm font-semibold text-green-700 leading-tight truncate"
                  >
                    {pageTitle}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Right Side - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <div className="flex-1 max-w-md xl:max-w-2xl">
                <EnhancedGlobalSearch onNavigate={onNavigate} />
              </div>
              <div className="flex items-center gap-1.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border border-blue-300 h-9 w-9 p-0 flex-shrink-0">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {(['en', 'fr', 'rw', 'sw'] as Language[]).map((lang) => (
                      <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className={language === lang ? 'bg-yellow-100 font-bold' : ''}>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm">
                            {lang === 'en' && '🇬🇧 English'}
                            {lang === 'fr' && '🇫🇷 Français'}
                            {lang === 'rw' && '🇷🇼 Kinyarwanda'}
                            {lang === 'sw' && '🇰🇪 Kiswahili'}
                          </span>
                          {language === lang && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {!displayUser && (
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => onNavigate('login')} className="rounded-full border-yellow-400 h-8 px-3">
                      <LogIn className="w-3 h-3 mr-1" />
                      <span className="text-xs">{t('login')}</span>
                    </Button>
                    <Button size="sm" onClick={() => onNavigate('parent-register')} className="rounded-full bg-gradient-to-br from-yellow-500 to-green-500 h-8 px-3">
                      <UserPlus className="w-3 h-3 mr-1" />
                      <span className="text-xs">{t('register')}</span>
                    </Button>
                  </div>
                )}
                {displayUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-xs font-bold">
                            {displayUser?.first_name?.charAt(0)}{displayUser?.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="flex flex-col items-start">
                        <p className="font-semibold text-sm">{displayUser.first_name} {displayUser.last_name}</p>
                        <p className="text-xs text-gray-500">{displayUser.role}</p>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        if (getRoleDashboard) {
                          const dashboard = getRoleDashboard(displayUser.role);
                          window.location.href = `/${dashboard}`;
                        }
                      }}>Dashboard</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('user');
                        sessionStorage.removeItem('token');
                        setCurrentUser(null);
                        if (logout) logout();
                        onNavigate('home');
                      }}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)} className="relative rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-green-50 h-11 w-11 p-0 shadow-lg hover:shadow-2xl hover:border-yellow-400 transition-all group overflow-hidden">
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400 opacity-0 group-hover:opacity-30 transition-opacity" />
                    <Menu className="w-5 h-5 text-green-700 relative z-10" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Mobile/Tablet - Menu Button Only */}
            <motion.div className="lg:hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)} className="relative rounded-2xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-green-50 h-12 w-12 sm:h-14 sm:w-14 p-0 shadow-lg hover:shadow-xl hover:border-yellow-500 transition-all group overflow-hidden flex-shrink-0">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                <Menu className="w-6 h-6 sm:w-7 sm:h-7 text-green-700 relative z-10" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[60] bg-white"
          >
            <div className="p-4 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(false)}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <EnhancedGlobalSearch onNavigate={(page, id) => {
                  onNavigate(page);
                  setIsSearchOpen(false);
                }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Sidebar with Modern Animations */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-80 sm:w-96 p-0 bg-gradient-to-br from-white via-yellow-50 to-green-50">
          <ScrollArea className="h-full">
            <div className="flex flex-col h-full">
              {/* Enhanced Header */}
              <SheetHeader className="p-4 border-b-2 border-yellow-300 bg-gradient-to-br from-yellow-500 via-green-500 to-yellow-600 relative overflow-hidden h-20 sm:h-20 md:h-24">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      <img
                        src="/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico"
                        alt="Logo"
                        className="h-14 w-14 rounded-2xl bg-white p-2 shadow-2xl ring-2 ring-yellow-300"
                      />
                    </motion.div>
                    <div>
                      <SheetTitle className="text-white text-xl font-black drop-shadow-lg">{t('schoolName') || 'Ishuri Garden TVET'}</SheetTitle>
                      <p className="text-yellow-100 text-xs font-semibold">{t('tagline') || 'Uburezi Bwiza'}</p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 90, scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSidebarOpen(false)}
                      className="rounded-full bg-white/20 hover:bg-white/30 text-white h-10 w-10"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </div>
              </SheetHeader>

              {/* Enhanced Navigation */}
              <div className="flex-1 py-6 px-4">
                {/* Search Bar - Mobile/Tablet */}
                <div className="mb-6 lg:hidden">
                  <h3 className="px-3 mb-3 text-xs font-bold text-green-700 uppercase tracking-wider">{t('search') || 'Shakisha'}</h3>
                  <div className="px-3">
                    <EnhancedGlobalSearch onNavigate={(page) => {
                      onNavigate(page);
                      setIsSidebarOpen(false);
                    }} />
                  </div>
                </div>

                {/* Language Selector - Mobile/Tablet */}
                <div className="mb-6 lg:hidden">
                  <h3 className="px-3 mb-3 text-xs font-bold text-green-700 uppercase tracking-wider">{t('language') || 'Ururimi'}</h3>
                  <div className="px-3 grid grid-cols-2 gap-2">
                    {(['en', 'fr', 'rw', 'sw'] as Language[]).map((lang) => (
                      <Button
                        key={lang}
                        variant={language === lang ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLanguage(lang)}
                        className={`w-full justify-start rounded-xl ${language === lang ? 'bg-gradient-to-r from-yellow-400 to-green-400 text-white font-bold' : 'border-yellow-300 hover:bg-yellow-50'}`}
                      >
                        <span className="text-sm">
                          {lang === 'en' && '🇬🇧 English'}
                          {lang === 'fr' && '🇫🇷 Français'}
                          {lang === 'rw' && '🇷🇼 Kinyarwanda'}
                          {lang === 'sw' && '🇰🇪 Kiswahili'}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="my-4 lg:hidden" />

                <div className="space-y-2">
                  <h3 className="px-3 mb-3 text-xs font-bold text-green-700 uppercase tracking-wider">{t('navigation') || 'Ibikubiyemo'}</h3>
                  {visibleNavItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 5 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onNavigate(item.key);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full justify-start px-4 py-2 rounded-xl transition-all ${currentPage === item.key
                            ? 'bg-gradient-to-r from-yellow-400 to-green-400 text-white shadow-lg border-l-4 border-green-600 font-bold'
                            : 'hover:bg-yellow-100 hover:border-l-4 hover:border-yellow-400'
                            }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          <span className="font-semibold">{item.label}</span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>

                {shortcuts.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h3 className="px-3 mb-2 text-xs font-bold text-green-700 uppercase tracking-wider">{t('quickLinks') || 'Quick Links'}</h3>
                    {shortcuts.map((item, idx) => (
                      <Button
                        key={item.key}
                        variant="outline"
                        onClick={() => {
                          onNavigate(item.key);
                          setIsSidebarOpen(false);
                        }}
                        className="w-full justify-start px-4 py-2 rounded-xl border-green-200 hover:bg-green-50 text-green-800"
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        <span className="font-semibold text-sm">{item.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Footer */}
              <div className="border-t-2 border-yellow-200 p-3 bg-gradient-to-br from-yellow-50 to-green-50 space-y-2 flex flex-col justify-center">
                {!displayUser ? (
                  <div className="space-y-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => {
                          onNavigate('login');
                          setIsSidebarOpen(false);
                        }}
                        variant="outline"
                        className="w-full rounded-xl border-2 border-yellow-400 hover:bg-yellow-50 font-semibold shadow-md"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('login') || 'Injira'}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => {
                          onNavigate('parent-register');
                          setIsSidebarOpen(false);
                        }}
                        className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 font-bold shadow-lg"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t('register') || 'Iyandikishe'}
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <motion.div
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-100 to-green-100 rounded-xl shadow-md border-2 border-yellow-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-yellow-400">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold text-lg">
                          {displayUser?.first_name?.charAt(0)}{displayUser?.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-green-800">{displayUser.first_name} {displayUser.last_name}</p>
                        <p className="text-xs text-yellow-700 font-semibold truncate">{displayUser.role}</p>
                      </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => {
                          if (getRoleDashboard) {
                            const dashboard = getRoleDashboard(displayUser.role);
                            window.location.href = `/${dashboard}`;
                            setIsSidebarOpen(false);
                          }
                        }}
                        variant="outline"
                        className="w-full rounded-xl border-2 border-green-400 hover:bg-green-50 font-semibold shadow-md"
                      >
                        <User className="w-4 h-4 mr-2" />
                        {t('dashboard') || 'Ibikubiyemo'}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => {
                          localStorage.removeItem('user');
                          localStorage.removeItem('token');
                          sessionStorage.removeItem('user');
                          sessionStorage.removeItem('token');
                          setCurrentUser(null);
                          if (logout) logout();
                          onNavigate('home');
                          setIsSidebarOpen(false);
                        }}
                        variant="outline"
                        className="w-full rounded-xl border-2 border-red-400 text-red-700 hover:bg-red-50 font-semibold shadow-md"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('logout') || 'Sohoka'}
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
