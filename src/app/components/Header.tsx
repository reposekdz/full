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
    { key: 'academics', icon: BookOpen, label: 'Academics', subItems: [] },
    { key: 'sports', icon: Trophy, label: 'Sports', subItems: [] },
    { key: 'services', icon: Briefcase, label: 'Services', subItems: [] },
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
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md overflow-hidden"
      >
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0"
              onClick={() => onNavigate('home')}
            >
              <motion.img
                whileHover={{ scale: 1.1, rotate: 5 }}
                src="/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico"
                alt="Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 object-contain rounded-lg shadow-lg"
              />
              <div className="hidden md:block min-w-0">
                <motion.p className="text-sm sm:text-base md:text-xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent leading-tight truncate">
                  Garden TVET
                </motion.p>
                <motion.p
                  key={currentTaglineIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-600 leading-tight truncate"
                >
                  {taglines[currentTaglineIndex]}
                </motion.p>
              </div>
            </motion.div>

            {/* Right Side - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              {/* Desktop Search */}
              <div className="flex-1 max-w-md xl:max-w-2xl">
                <EnhancedGlobalSearch onNavigate={onNavigate} />
              </div>

              {/* Desktop Icons */}
              <div className="flex items-center gap-1.5">
                {/* Language Icon */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border border-blue-300 h-9 w-9 p-0 flex-shrink-0"
                    >
                      <Globe className="w-4 h-4 text-blue-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {(['en', 'fr', 'rw', 'sw'] as Language[]).map((lang) => (
                      <DropdownMenuItem
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={language === lang ? 'bg-yellow-100 font-bold' : ''}
                      >
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

                {/* Desktop Auth Buttons */}
                {!user && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('login')}
                      className="rounded-full border-yellow-400 h-8 px-3"
                    >
                      <LogIn className="w-3 h-3 mr-1" />
                      <span className="text-xs">{t('login')}</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onNavigate('register')}
                      className="rounded-full bg-gradient-to-br from-yellow-500 to-green-500 h-8 px-3"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      <span className="text-xs">{t('register')}</span>
                    </Button>
                  </div>
                )}

                {/* User Menu */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-xs font-bold">
                            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="flex flex-col items-start">
                        <p className="font-semibold text-sm">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
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
                )}

                {/* Menu Icon */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-full border border-yellow-200 h-9 w-9 p-0 flex-shrink-0"
                >
                  <Menu className="w-4 h-4 text-gray-700" />
                </Button>
              </div>
            </div>

            {/* Mobile/Tablet - Only Logo and Menu */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-full border border-yellow-200 h-9 w-9 p-0"
              >
                <Menu className="w-4 h-4 text-gray-700" />
              </Button>
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

                    return (
                      <Button
                        key={item.key}
                        variant="ghost"
                        onClick={() => {
                          onNavigate(item.key);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full justify-start px-3 py-2 ${
                          currentPage === item.key ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500' : ''
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
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
