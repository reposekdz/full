import React, { useState } from 'react';
import { Search, Menu, X, Globe, Bell, User, Home, Trophy, Briefcase, Wrench, Phone, HelpCircle, Users, ChevronDown, ChevronRight, LogIn, UserPlus, BookOpen, Calendar, FileText, Award, GraduationCap, ClipboardList, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useLanguage, Language } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Input } from '@/app/components/ui/input';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/app/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onSearch }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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



  const searchSuggestions = [
    { title: 'Academic Calendar', category: 'Academics', icon: Calendar, description: 'View term dates and academic schedule' },
    { title: 'Student Portal', category: 'Services', icon: User, description: 'Access student dashboard and resources' },
    { title: 'Course Registration', category: 'Academics', icon: FileText, description: 'Register for courses and programs' },
    { title: 'Exam Results', category: 'Academics', icon: TrendingUp, description: 'Check examination results and grades' },
    { title: 'Sports Events', category: 'Sports', icon: Trophy, description: 'View upcoming sports activities and matches' },
    { title: 'Library Resources', category: 'Services', icon: BookOpen, description: 'Browse library catalog and resources' },
    { title: 'Contact Support', category: 'Support', icon: HelpCircle, description: 'Get help and technical support' },
    { title: 'School Teams', category: 'About', icon: Users, description: 'Meet our management teams' },
    { title: 'Fee Payment', category: 'Finance', icon: Briefcase, description: 'Pay school fees and view payment history' },
    { title: 'Timetable', category: 'Academics', icon: Calendar, description: 'View class schedules and timetables' },
    { title: 'Attendance', category: 'Academics', icon: ClipboardList, description: 'Check attendance records' },
    { title: 'Software Development', category: 'Trades', icon: BookOpen, description: 'Learn about SOD program' },
    { title: 'Building Construction', category: 'Trades', icon: Wrench, description: 'Learn about BDC program' },
    { title: 'Automobile Technology', category: 'Trades', icon: Wrench, description: 'Learn about AUTO program' },
    { title: 'Health Center', category: 'Services', icon: HelpCircle, description: 'Medical services and health support' },
    { title: 'Counseling Services', category: 'Services', icon: HelpCircle, description: 'Student counseling and guidance' },
  ];

  const filteredSuggestions = searchSuggestions.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [expandedNavItems, setExpandedNavItems] = useState<string[]>([]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Only */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="bg-gradient-to-br from-yellow-500 to-green-500 p-2 sm:p-2.5 rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                  <span className="text-white font-black text-xs sm:text-sm leading-tight">GARDEN</span>
                  <span className="text-white font-black text-xs sm:text-sm leading-tight">TVET</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-lg sm:text-xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">Garden TVET</p>
                <p className="text-xs text-gray-600">Excellence in Education</p>
              </div>
            </motion.div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Advanced Search - Desktop & Tablet */}
              <div className="hidden md:block">
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-80 lg:w-96 h-12 justify-start text-left font-normal rounded-2xl border-2 border-yellow-300 hover:border-yellow-500 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50 shadow-md hover:shadow-lg transition-all"
                    >
                      <Search className="mr-3 h-5 w-5 shrink-0 text-yellow-600" />
                      <span className="text-gray-500 text-base">Search everything...</span>
                      <kbd className="ml-auto pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-yellow-200 bg-yellow-50 px-2 font-mono text-xs text-yellow-700">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[600px] p-0 shadow-2xl border-2 border-yellow-200" align="end">
                    <Command className="rounded-lg">
                      <div className="flex items-center border-b-2 border-yellow-100 bg-gradient-to-r from-yellow-50 to-green-50 px-4 py-3">
                        <Search className="mr-2 h-5 w-5 shrink-0 text-yellow-600" />
                        <CommandInput 
                          placeholder="Search for pages, resources, and more..." 
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                          className="flex-1 border-0 bg-transparent focus:ring-0 text-base"
                        />
                      </div>
                      <CommandList className="max-h-[500px]">
                        <CommandEmpty className="py-12 text-center">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="rounded-full bg-yellow-100 p-4">
                              <Search className="h-8 w-8 text-yellow-600" />
                            </div>
                            <p className="text-gray-500 font-medium">No results found</p>
                            <p className="text-sm text-gray-400">Try searching with different keywords</p>
                          </div>
                        </CommandEmpty>
                        {searchQuery === '' && (
                          <div className="p-4 border-b border-yellow-100">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Actions</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {searchSuggestions.slice(0, 4).map((item, index) => {
                                const ItemIcon = item.icon;
                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setIsSearchOpen(false);
                                      setSearchQuery('');
                                      onSearch();
                                    }}
                                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50 border border-yellow-100 hover:border-yellow-300 transition-all group"
                                  >
                                    <div className="p-2 rounded-md bg-gradient-to-br from-yellow-500 to-green-500 group-hover:scale-110 transition-transform">
                                      <ItemIcon className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{item.title}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <CommandGroup heading="Search Results" className="p-2">
                          {filteredSuggestions.map((item, index) => {
                            const ItemIcon = item.icon;
                            return (
                              <CommandItem
                                key={index}
                                onSelect={() => {
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                  onSearch();
                                }}
                                className="cursor-pointer p-3 rounded-lg aria-selected:bg-gradient-to-r aria-selected:from-yellow-50 aria-selected:to-green-50"
                              >
                                <div className="flex items-start space-x-3 w-full">
                                  <div className="p-2 rounded-md bg-gradient-to-br from-yellow-100 to-green-100 mt-0.5">
                                    <ItemIcon className="h-4 w-4 text-yellow-700" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium text-gray-900">{item.title}</p>
                                      <Badge variant="outline" className="ml-2 text-xs border-yellow-300 text-yellow-700 bg-yellow-50">
                                        {item.category}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                                  </div>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                      <div className="border-t-2 border-yellow-100 bg-gradient-to-r from-yellow-50 to-green-50 px-4 py-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <kbd className="px-2 py-1 bg-white border border-yellow-200 rounded mr-1">↑↓</kbd>
                              Navigate
                            </span>
                            <span className="flex items-center">
                              <kbd className="px-2 py-1 bg-white border border-yellow-200 rounded mr-1">↵</kbd>
                              Select
                            </span>
                          </div>
                          <span className="flex items-center">
                            <kbd className="px-2 py-1 bg-white border border-yellow-200 rounded mr-1">ESC</kbd>
                            Close
                          </span>
                        </div>
                      </div>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Icon - Mobile only */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden rounded-full"
              >
                <Search className="w-4 h-4" />
              </Button>

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
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="flex flex-col items-start">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('home')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
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

        {/* Mobile Search Modal */}
        <Sheet open={isSearchOpen && window.innerWidth < 768} onOpenChange={setIsSearchOpen}>
          <SheetContent side="top" className="h-full">
            <SheetHeader>
              <SheetTitle>Search</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Command>
                <CommandInput 
                  placeholder="Type to search..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    {filteredSuggestions.map((item, index) => {
                      const ItemIcon = item.icon;
                      return (
                        <CommandItem
                          key={index}
                          onSelect={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            onSearch();
                          }}
                        >
                          <ItemIcon className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-xs text-gray-500">{item.category}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </SheetContent>
        </Sheet>
      </motion.header>

      {/* Modern Left Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <SheetHeader className="p-6 border-b bg-gradient-to-br from-yellow-500 to-green-500 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-md">
                    <div className="flex flex-col items-center">
                      <span className="text-yellow-600 font-black text-xs leading-tight">GARDEN</span>
                      <span className="text-green-600 font-black text-xs leading-tight">TVET</span>
                    </div>
                  </div>
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
                            if (hasSubItems) {
                              setExpandedNavItems(prev =>
                                isExpanded
                                  ? prev.filter(k => k !== item.key)
                                  : [...prev, item.key]
                              );
                            } else {
                              onNavigate(item.key);
                              setIsSidebarOpen(false);
                            }
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
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border-2 border-yellow-200">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-yellow-700 truncate font-medium">{user.role}</p>
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
