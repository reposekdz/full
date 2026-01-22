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
import { GlobalSearch } from '@/app/components/GlobalSearch';
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



  // Dynamic tagline rotation
  const taglines = [
    "Excellence in Education",
    "Empowering Future Leaders",
    "Innovation Through Learning",
    "Building Tomorrow's Workforce",
    "Quality Technical Education",
    "Shaping Skilled Professionals"
  ];
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaglineIndex((prevIndex) =>
        (prevIndex + 1) % taglines.length
      );
    }, 3000); // Change tagline every 3 seconds

    return () => clearInterval(interval);
  }, [taglines.length]);

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
    setIsLogoAnimating(true);

    // Reset animation after 1 second
    setTimeout(() => setIsLogoAnimating(false), 1000);

    // Special animation on 5th click
    if (logoClickCount + 1 === 5) {
      setLogoClickCount(0);
      // Could add special effects here
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="flex items-center space-x-2">
                <motion.img
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  src="/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico"
                  alt="Garden TVET School Logo"
                  className="h-20 w-20 sm:h-22 sm:w-22 md:h-24 md:w-24 object-contain rounded-lg shadow-lg transition-all hover:shadow-2xl hover:shadow-yellow-500/50"
                />
                <div className="hidden sm:block">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent leading-tight"
                  >
                    Garden TVET School
                  </motion.p>
                  <motion.p
                    key={currentTaglineIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-xs sm:text-sm text-gray-600 leading-tight"
                  >
                    {taglines[currentTaglineIndex]}
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Enhanced Global Search - Fully Responsive */}
              <div className="flex-1 max-w-2xl mx-4">
                <EnhancedGlobalSearch onNavigate={onNavigate} />
              </div>

              {/* Notification - All screens */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full relative hover:bg-yellow-50"
                    >
                      <Bell className="w-4 h-4 text-yellow-600" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-br from-red-500 to-orange-500 border-2 border-white">
                        5
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-3 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                      <p className="text-xs text-gray-500">You have 5 unread messages</p>
                    </div>
                    <ScrollArea className="h-72">
                      {[
                        { title: 'New Assignment Posted', msg: 'Mathematics homework due Friday', time: '2h ago' },
                        { title: 'Exam Schedule Updated', msg: 'Check your exam timetable', time: '4h ago' },
                        { title: 'Sports Event Tomorrow', msg: 'Basketball match at 3 PM', time: '1d ago' },
                        { title: 'Fee Payment Reminder', msg: 'Tuition due by end of month', time: '2d ago' },
                        { title: 'Library Book Return', msg: 'Return books by this weekend', time: '3d ago' },
                      ].map((notif, idx) => (
                        <DropdownMenuItem key={idx} className="p-3 cursor-pointer">
                          <div className="flex flex-col space-y-1">
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-xs text-gray-600">{notif.msg}</p>
                            <p className="text-xs text-gray-400">{notif.time}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                    <div className="p-2 border-t">
                      <Button variant="ghost" className="w-full text-blue-600">
                        View all notifications
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Auth Buttons - Desktop & Tablet */}
              {!user && (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => onNavigate('login')}
                    className="rounded-full hover:bg-yellow-50 border-yellow-400 text-yellow-700 hover:border-yellow-600"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {t('login')}
                  </Button>
                  <Button
                    onClick={() => onNavigate('register')}
                    className="rounded-full bg-gradient-to-br from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white shadow-lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('register')}
                  </Button>
                </div>
              )}

              {/* User Menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full p-1 hover:bg-yellow-50">
                      <Avatar className="h-8 w-8">
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
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => {
                      logout();
                      onNavigate('home');
                    }}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Language Selector - Desktop & Tablet */}
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="rounded-full border-yellow-300 hover:border-yellow-500 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50"
                    >
                      <Globe className="h-4 w-4 text-yellow-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="p-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
                        Hitamo Ururimi
                      </p>
                      {(['en', 'fr', 'rw', 'sw'] as Language[]).map((lang) => (
                        <DropdownMenuItem
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`cursor-pointer rounded-md ${
                            language === lang
                              ? 'bg-gradient-to-r from-yellow-100 to-green-100 text-yellow-700 font-bold'
                              : 'hover:bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {lang === 'en' && '🇬🇧 English'}
                              {lang === 'fr' && '🇫🇷 Français'}
                              {lang === 'rw' && '🇷🇼 Kinyarwanda'}
                              {lang === 'sw' && '🇰🇪 Kiswahili'}
                            </span>
                            {language === lang && (
                              <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Menu Icon - All screens */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-green-50 rounded-xl transition-all duration-300 group border-2 border-yellow-200 hover:border-yellow-400 shadow-sm hover:shadow-md"
              >
                <Menu className="w-6 h-6 text-gray-700 group-hover:text-yellow-600 transition-colors" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Modern Left Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <SheetHeader className="p-6 border-b bg-gradient-to-br from-yellow-500 to-green-500 shadow-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico" 
                    alt="Garden TVET Logo" 
                    className="h-12 w-12 object-contain rounded-lg shadow-md bg-white p-1"
                  />
                  <div>
                    <SheetTitle className="text-white text-lg">Garden TVET</SheetTitle>
                    <p className="text-yellow-100 text-xs">Excellence in Education</p>
                  </div>
                </div>
              </SheetHeader>

              {/* Navigation Items */}
              <div className="flex-1 py-6 px-4">
                <div className="space-y-1">
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Navigation
                  </h3>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedNavItems.includes(item.key);

                    return (
                      <div key={item.key}>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onNavigate(item.key);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full justify-between px-3 py-2 ${
                            currentPage === item.key
                              ? 'bg-gradient-to-r from-yellow-50 to-green-50 text-yellow-700 border-l-4 border-yellow-500'
                              : 'text-gray-700 hover:bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {hasSubItems && (
                            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>

                        {hasSubItems && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-8 mt-1 space-y-1"
                          >
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
                                  className="w-full justify-start px-3 py-1.5 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50 hover:text-yellow-700"
                                >
                                  <SubIcon className="w-4 h-4 mr-2" />
                                  {subItem.label}
                                </Button>
                              );
                            })}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                {/* Teams Section */}
                <div className="space-y-1">
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    About
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onNavigate('teams');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full justify-start px-3 py-2 ${
                      currentPage === 'teams'
                        ? 'bg-gradient-to-r from-yellow-50 to-green-50 text-yellow-700 border-l-4 border-yellow-500'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50 hover:text-yellow-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3 text-yellow-600" />
                      <span className="font-medium">Management Teams</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="border-t p-4 bg-gray-50 space-y-3">
                {/* Language selector in sidebar */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Language
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full rounded-full">
                        <Globe className="w-4 h-4 mr-2" />
                        {language.toUpperCase()}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-full">
                      {(['en', 'fr', 'rw', 'sw'] as Language[]).map((lang) => (
                        <DropdownMenuItem
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={language === lang ? 'bg-blue-50 text-blue-600' : ''}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : lang === 'rw' ? 'Kinyarwanda' : 'Kiswahili'}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {!user ? (
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        onNavigate('login');
                        setIsSidebarOpen(false);
                      }}
                      variant="outline"
                      className="w-full rounded-full border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {t('login')}
                    </Button>
                    <Button
                      onClick={() => {
                        onNavigate('register');
                        setIsSidebarOpen(false);
                      }}
                      className="w-full rounded-full bg-gradient-to-br from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white shadow-lg"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('register')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border-2 border-yellow-200">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                          {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-yellow-700 truncate font-medium">{user.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          onNavigate(getRoleDashboard(user.role));
                          setIsSidebarOpen(false);
                        }}
                        variant="outline"
                        className="w-full rounded-full border-blue-400 text-blue-700 hover:bg-blue-50"
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
                        className="w-full rounded-full border-red-400 text-red-700 hover:bg-red-50"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
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
