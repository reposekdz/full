import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Globe, Bell, User, Home, Trophy, Briefcase, Wrench, Phone, HelpCircle, Users, ChevronDown, ChevronRight, LogIn, UserPlus, BookOpen, Calendar, FileText, Award, GraduationCap, ClipboardList, TrendingUp, CheckCircle2 } from 'lucide-react';
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

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onSearch }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, getRoleDashboard } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedNavItems, setExpandedNavItems] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { key: 'home', icon: Home, label: 'Home', subItems: [] },
    {
      key: 'academics',
      icon: BookOpen,
      label: 'Academics',
      subItems: [
        { key: 'courses', icon: GraduationCap, label: 'Courses' },
        { key: 'timetable', icon: Calendar, label: 'Timetable' },
        { key: 'exams', icon: ClipboardList, label: 'Exams' },
        { key: 'results', icon: TrendingUp, label: 'Results' },
      ]
    },
    {
      key: 'sports',
      icon: Trophy,
      label: 'Sports',
      subItems: [
        { key: 'teams', icon: Users, label: 'Teams' },
        { key: 'events', icon: Calendar, label: 'Events' },
        { key: 'achievements', icon: Award, label: 'Achievements' },
      ]
    },
    {
      key: 'services',
      icon: Briefcase,
      label: 'Services',
      subItems: [
        { key: 'library', icon: BookOpen, label: 'Library' },
        { key: 'counseling', icon: HelpCircle, label: 'Counseling' },
        { key: 'health', icon: HelpCircle, label: 'Health Center' },
      ]
    },
    { key: 'trades', icon: Wrench, label: 'Trades', subItems: [] },
    { key: 'contactUs', icon: Phone, label: 'Contact Us', subItems: [] },
    { key: 'supports', icon: HelpCircle, label: 'Support', subItems: [] },
  ];

  const taglines = [
    "Excellence in Education",
    "Empowering Future Leaders",
    "Innovation Through Learning",
    "Building Tomorrow's Workforce",
    "Quality Technical Education",
    "Shaping Skilled Professionals"
  ];
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaglineIndex((prevIndex) => (prevIndex + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [taglines.length]);

  const toggleNavItem = (key: string) => {
    setExpandedNavItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 md:h-24">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <motion.img
                whileHover={{ scale: 1.1, rotate: 5 }}
                src="/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico"
                alt="Garden TVET School Logo"
                className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain rounded-lg shadow-lg"
              />
              <div className="hidden sm:block">
                <motion.p className="text-base sm:text-xl md:text-2xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent leading-tight">
                  Garden TVET School
                </motion.p>
                <motion.p
                  key={currentTaglineIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs sm:text-sm text-gray-600 leading-tight"
                >
                  {taglines[currentTaglineIndex]}
                </motion.p>
              </div>
            </motion.div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Desktop Search */}
              <div className="hidden lg:block flex-1 max-w-2xl mx-4">
                <EnhancedGlobalSearch onNavigate={onNavigate} />
              </div>

              {/* Mobile Icons Row */}
              <div className="flex items-center space-x-2">
                {/* Search Icon - Mobile/Tablet */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="lg:hidden rounded-full border-2 border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                </Button>

                {/* Login Icon - Mobile (if not logged in) */}
                {!user && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onNavigate('login')}
                    className="md:hidden rounded-full border-2 border-green-300 hover:border-green-500 hover:bg-green-50 h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </Button>
                )}

                {/* Language Icon - Mobile/Tablet */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 h-9 w-9 sm:h-10 sm:w-10"
                    >
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {(['en', 'fr', 'rw', 'sw'] as Language[]).map((lang) => (
                      <DropdownMenuItem
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={language === lang ? 'bg-yellow-100 font-bold' : ''}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {lang === 'en' && '🇬🇧 English'}
                            {lang === 'fr' && '🇫🇷 Français'}
                            {lang === 'rw' && '🇷🇼 Kinyarwanda'}
                            {lang === 'sw' && '🇰🇪 Kiswahili'}
                          </span>
                          {language === lang && <CheckCircle2 className="h-4 w-4" />}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Desktop Auth Buttons */}
                {!user && (
                  <div className="hidden md:flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('login')}
                      className="rounded-full hover:bg-yellow-50 border-yellow-400"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {t('login')}
                    </Button>
                    <Button
                      onClick={() => onNavigate('register')}
                      className="rounded-full bg-gradient-to-br from-yellow-500 to-green-500"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('register')}
                    </Button>
                  </div>
                )}

                {/* User Menu - Desktop */}
                {user && (
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="rounded-full p-1">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem className="flex flex-col items-start">
                          <p className="font-semibold">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-gray-500">{user.role}</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate(getRoleDashboard(user.role))}>
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => {
                          logout();
                          onNavigate('home');
                        }}>
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {/* Menu Icon */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-full border-2 border-yellow-200 hover:border-yellow-400 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </Button>
              </div>
            </div>
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

      {/* Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b bg-gradient-to-br from-yellow-500 to-green-500">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico" 
                    alt="Logo" 
                    className="h-12 w-12 rounded-lg bg-white p-1"
                  />
                  <div>
                    <SheetTitle className="text-white text-lg">Garden TVET</SheetTitle>
                    <p className="text-yellow-100 text-xs">Excellence in Education</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 py-6 px-4">
                <div className="space-y-1">
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">Navigation</h3>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const hasSubItems = item.subItems?.length > 0;
                    const isExpanded = expandedNavItems.includes(item.key);

                    return (
                      <div key={item.key}>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            if (hasSubItems) {
                              toggleNavItem(item.key);
                            } else {
                              onNavigate(item.key);
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`w-full justify-between px-3 py-2 ${
                            currentPage === item.key ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {hasSubItems && (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                        </Button>

                        {hasSubItems && isExpanded && (
                          <div className="ml-8 mt-1 space-y-1">
                            {item.subItems.map((subItem) => {
                              const SubIcon = subItem.icon;
                              return (
                                <Button
                                  key={subItem.key}
                                  variant="ghost"
                                  onClick={() => {
                                    onNavigate(subItem.key);
                                    setIsSidebarOpen(false);
                                  }}
                                  className="w-full justify-start px-3 py-1.5 text-sm"
                                >
                                  <SubIcon className="w-4 h-4 mr-2" />
                                  {subItem.label}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t p-4 bg-gray-50 space-y-3">
                {!user ? (
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        onNavigate('login');
                        setIsSidebarOpen(false);
                      }}
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {t('login')}
                    </Button>
                    <Button
                      onClick={() => {
                        onNavigate('register');
                        setIsSidebarOpen(false);
                      }}
                      className="w-full rounded-full bg-gradient-to-br from-yellow-500 to-green-500"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('register')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white">
                          {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-yellow-700 truncate">{user.role}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        onNavigate(getRoleDashboard(user.role));
                        setIsSidebarOpen(false);
                      }}
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      onClick={() => {
                        logout();
                        onNavigate('home');
                        setIsSidebarOpen(false);
                      }}
                      variant="outline"
                      className="w-full rounded-full border-red-400 text-red-700"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
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
