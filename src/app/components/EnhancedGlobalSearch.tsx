import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, BookOpen, FileText, Calendar, Trophy, Bell, TrendingUp, Award, Users, Sparkles, ArrowRight, Clock, Hash, Mail, Phone, MapPin, Filter, SortAsc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';

interface SearchResult {
  id: number;
  type: string;
  title?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  student_id?: string;
  description?: string;
  code?: string;
  phone?: string;
  [key: string]: any;
}

interface EnhancedSearchProps {
  onNavigate?: (page: string, id?: number) => void;
}

const typeConfig: Record<string, { icon: any; color: string; label: string; gradient: string }> = {
  course: { icon: BookOpen, color: 'bg-green-500', label: 'Courses', gradient: 'from-green-500 to-emerald-500' },
  assignment: { icon: FileText, color: 'bg-orange-500', label: 'Assignments', gradient: 'from-orange-500 to-amber-500' },
  exam: { icon: Calendar, color: 'bg-red-500', label: 'Exams', gradient: 'from-red-500 to-rose-500' },
  sport: { icon: Trophy, color: 'bg-yellow-500', label: 'Sports', gradient: 'from-yellow-500 to-orange-500' },
  notification: { icon: Bell, color: 'bg-pink-500', label: 'Notifications', gradient: 'from-pink-500 to-rose-500' },
  trade: { icon: Award, color: 'bg-indigo-500', label: 'Trades', gradient: 'from-indigo-500 to-purple-500' },
};

const quickSearches = [
  { query: 'amasomo', icon: BookOpen, label: 'Amasomo', color: 'green' },
  { query: 'ibizamini', icon: Calendar, label: 'Ibizamini', color: 'red' },
  { query: 'siporo', icon: Trophy, label: 'Siporo', color: 'yellow' },
  { query: 'amahugurwa', icon: Award, label: 'Amahugurwa', color: 'indigo' },
];

export const EnhancedGlobalSearch: React.FC<EnhancedSearchProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (query.trim().length >= 1) {
        performSearch(query);
      } else {
        setResults({});
        setTotalResults(0);
      }
    }, 200);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setTotalResults(data.totalResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fuzzy fallback search
      setResults(getFallbackResults(searchQuery));
      setTotalResults(Object.values(results).flat().length);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackResults = (q: string) => {
    const lower = q.toLowerCase();
    const fallback: any = {};
    
    // Courses - English and Kinyarwanda
    if (lower.includes('cours') || lower.includes('class') || lower.includes('amasomo') || 
        lower.includes('isomo') || lower.includes('somo') || lower.includes('course')) {
      fallback.courses = [
        { id: 1, type: 'course', name: 'Browse All Courses', code: 'ALL', description: 'View all available courses' },
        { id: 2, type: 'course', name: 'Search Courses', code: 'SEARCH', description: 'Find specific courses' }
      ];
    }
    
    // Exams - English and Kinyarwanda
    if (lower.includes('exam') || lower.includes('test') || lower.includes('ibizamini') || 
        lower.includes('ikizamini') || lower.includes('zamin') || lower.includes('quiz')) {
      fallback.exams = [
        { id: 1, type: 'exam', title: 'View All Exams', exam_type: 'All', description: 'Browse all exams and tests' },
        { id: 2, type: 'exam', title: 'Upcoming Exams', exam_type: 'Upcoming', description: 'View scheduled exams' }
      ];
    }
    
    // Assignments - English and Kinyarwanda
    if (lower.includes('assign') || lower.includes('homework') || lower.includes('ibikorwa') || 
        lower.includes('akazi') || lower.includes('work') || lower.includes('task')) {
      fallback.assignments = [
        { id: 1, type: 'assignment', title: 'View All Assignments', description: 'Browse all assignments' },
        { id: 2, type: 'assignment', title: 'Pending Assignments', description: 'View pending work' }
      ];
    }
    
    // Sports - English and Kinyarwanda
    if (lower.includes('sport') || lower.includes('team') || lower.includes('siporo') || 
        lower.includes('imikino') || lower.includes('umukino') || lower.includes('game')) {
      fallback.sports = [
        { id: 1, type: 'sport', name: 'Sports Teams', sport_type: 'All', description: 'View all sports teams' },
        { id: 2, type: 'sport', name: 'Sports Events', sport_type: 'Events', description: 'Upcoming sports events' }
      ];
    }
    
    // Trades - English and Kinyarwanda
    if (lower.includes('trade') || lower.includes('program') || lower.includes('amahugurwa') || 
        lower.includes('ubwubatsi') || lower.includes('ikoranabuhanga') || lower.includes('skill')) {
      fallback.trades = [
        { id: 1, type: 'trade', name_rw: 'Amahugurwa Yose', name_en: 'All Trades', code: 'ALL', description: 'View all trade programs' },
        { id: 2, type: 'trade', name_rw: 'Software Development', name_en: 'Software Development', code: 'SOD', description: 'Software development program' },
        { id: 3, type: 'trade', name_rw: 'Ubwubatsi', name_en: 'Building Construction', code: 'BDC', description: 'Construction program' }
      ];
    }
    
    // Notifications - English and Kinyarwanda
    if (lower.includes('notif') || lower.includes('alert') || lower.includes('amakuru') || 
        lower.includes('ubutumwa') || lower.includes('message')) {
      fallback.notifications = [
        { id: 1, type: 'notification', title: 'View All Notifications', message: 'See all your notifications', description: 'Browse all notifications' }
      ];
    }
    
    // If no specific match, provide general suggestions
    if (Object.keys(fallback).length === 0) {
      fallback.courses = [{ id: 1, type: 'course', name: 'Browse Courses', code: 'ALL', description: 'View courses' }];
      fallback.exams = [{ id: 1, type: 'exam', title: 'View Exams', exam_type: 'All', description: 'Browse exams' }];
      fallback.trades = [{ id: 1, type: 'trade', name_en: 'View Trades', code: 'ALL', description: 'Browse trade programs' }];
    }
    
    return fallback;
  };

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    const typeRoutes: Record<string, string> = {
      course: 'courses',
      assignment: 'assignments',
      exam: 'exams',
      sport: 'sports',
      trade: 'trades',
      notification: 'notifications'
    };

    if (onNavigate && typeRoutes[result.type]) {
      onNavigate(typeRoutes[result.type], result.id);
    }
    
    setIsOpen(false);
    setQuery('');
  };

  const getResultTitle = (result: SearchResult) => {
    if (result.title) return result.title;
    if (result.name) return result.name;
    if (result.first_name && result.last_name) return `${result.first_name} ${result.last_name}`;
    return 'Unknown';
  };

  const getResultDetails = (result: SearchResult) => {
    const details = [];
    if (result.email) details.push({ icon: Mail, text: result.email });
    if (result.student_id) details.push({ icon: Hash, text: result.student_id });
    if (result.code) details.push({ icon: Hash, text: result.code });
    if (result.phone) details.push({ icon: Phone, text: result.phone });
    return details;
  };

  const allResults = Object.values(results).flat() as SearchResult[];
  const filteredResults = activeTab === 'all' ? allResults : (results[activeTab] || []);

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Desktop Search Bar - Always Visible */}
      <div className="hidden md:block w-full">
        <Button
          variant="outline"
          onClick={() => {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="w-full flex items-center gap-3 h-12 justify-start rounded-2xl border-2 border-gray-200 hover:border-yellow-400 hover:shadow-xl transition-all bg-gradient-to-r from-white via-yellow-50 to-white hover:scale-[1.02] group"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-700 group-hover:text-yellow-700 transition-colors">
                {language === 'rw' ? 'Shakisha ikintu cyose...' : 'Search anything...'}
              </p>
              <p className="text-xs text-gray-400">
                {language === 'rw' ? 'Amasomo, ibizamini, siporo...' : 'Courses, exams, sports...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden lg:flex items-center gap-1 bg-gray-100 text-gray-600 border-0">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </Badge>
            <kbd className="hidden xl:inline-flex h-7 items-center gap-1 rounded-lg border-2 border-gray-200 bg-white px-2 text-xs font-semibold text-gray-600">
              <span className="text-sm">⌘</span>K
            </kbd>
          </div>
        </Button>
      </div>

      {/* Mobile/Tablet Search Button */}
      <Button
        variant="outline"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="md:hidden w-full sm:w-auto rounded-2xl border-2 border-gray-200 hover:border-yellow-400 h-12 px-4 bg-gradient-to-r from-yellow-50 to-white hover:shadow-lg transition-all"
      >
        <Search className="w-5 h-5 text-yellow-600 mr-2" />
        <span className="font-semibold text-gray-700">
          {language === 'rw' ? 'Shakisha' : 'Search'}
        </span>
      </Button>

      {/* Enhanced Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-0 left-0 w-full h-[100dvh] bg-black/70 backdrop-blur-md z-50"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-4 sm:top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 w-[calc(100%-2rem)] sm:w-[95vw] md:w-[700px] lg:w-[850px] max-h-[calc(100vh-2rem)] sm:max-h-[85vh] bg-white rounded-3xl shadow-2xl border-2 border-yellow-200 z-50 overflow-hidden flex flex-col"
            >
              {/* Search Header - Enhanced */}
              <div className="p-3 sm:p-5 border-b-2 bg-gradient-to-r from-yellow-50 via-white to-green-50 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center animate-pulse">
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder={language === 'rw' ? 'Andika aho ushaka gushakisha...' : 'Type anything to search...'}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-14 sm:pl-20 pr-12 sm:pr-16 h-12 sm:h-16 text-base sm:text-lg font-medium border-2 border-gray-200 focus:border-yellow-400 rounded-2xl shadow-inner bg-white/80 backdrop-blur-sm"
                      autoFocus
                    />
                    {loading && (
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                        </div>
                      </div>
                    )}
                    {query && !loading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuery('')}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full h-10 w-10 sm:h-12 sm:w-12 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </div>

                {/* Quick Searches - Responsive */}
                {!query && (
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                    {quickSearches.map((quick, idx) => {
                      const Icon = quick.icon;
                      return (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => setQuery(quick.query)}
                          className="rounded-full border-2 hover:border-yellow-400 hover:bg-yellow-50 hover:scale-105 transition-all text-xs sm:text-sm"
                        >
                          <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">{quick.label}</span>
                          <span className="xs:hidden">{quick.query}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* Search Stats */}
                {query && totalResults > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 text-sm"
                  >
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                      {totalResults} {language === 'rw' ? 'ibisubizo' : 'results'}
                    </Badge>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      {language === 'rw' ? `kubera "${query}"` : `for "${query}"`}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Results Tabs - Mobile Optimized */}
              {query && totalResults > 0 && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
                  <div className="border-b px-2 sm:px-4 bg-gray-50 flex-shrink-0 overflow-x-auto">
                    <TabsList className="w-full sm:w-auto justify-start h-11 sm:h-12 bg-transparent gap-1">
                      <TabsTrigger 
                        value="all" 
                        className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap"
                      >
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        All ({totalResults})
                      </TabsTrigger>
                      {Object.entries(results).map(([category, items]: [string, any]) => {
                        if (!items || items.length === 0) return null;
                        const config = typeConfig[category.replace(/s$/, '')];
                        const Icon = config?.icon || Search;
                        return (
                          <TabsTrigger
                            key={category}
                            value={category}
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap"
                          >
                            <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">{config?.label || category}</span>
                            <span className="sm:hidden">{items.length}</span>
                            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                              {items.length}
                            </Badge>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>

                  {/* Results Content - Scrollable */}
                  <ScrollArea className="flex-1 h-full">
                    <div className="p-3 sm:p-4">
                      {filteredResults.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-600" />
                          </div>
                          <p className="text-gray-500 text-sm sm:text-base font-medium">No results in this category</p>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {filteredResults.map((result: SearchResult, idx: number) => {
                            const config = typeConfig[result.type];
                            const Icon = config?.icon || Search;
                            const details = getResultDetails(result);

                            return (
                              <motion.button
                                key={`${result.type}-${result.id}-${idx}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                onClick={() => handleResultClick(result)}
                                className="w-full group"
                              >
                                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50 border-2 border-transparent hover:border-yellow-300 transition-all hover:shadow-lg active:scale-[0.98]">
                                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${config?.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                                    <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                  </div>
                                  
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate group-hover:text-yellow-700 transition-colors">
                                        {getResultTitle(result)}
                                      </h3>
                                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
                                        {config?.label || result.type}
                                      </Badge>
                                    </div>
                                    
                                    {details.length > 0 && (
                                      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-1">
                                        {details.slice(0, 2).map((detail, i) => {
                                          const DetailIcon = detail.icon;
                                          return (
                                            <span key={i} className="flex items-center gap-1">
                                              <DetailIcon className="w-3 h-3" />
                                              <span className="truncate max-w-[150px] sm:max-w-none">{detail.text}</span>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                    
                                    {result.description && (
                                      <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1 sm:line-clamp-2">
                                        {result.description}
                                      </p>
                                    )}
                                  </div>

                                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Tabs>
              )}

              {/* Empty State */}
              {!query && (
                <div className="p-8 text-center">
                  <Sparkles className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {language === 'rw' ? 'Shakisha ikintu cyose' : 'Search Anything'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {language === 'rw' 
                      ? 'Shakisha abanyeshuri, amasomo, ibizamini, n\'ibindi byinshi...' 
                      : 'Find students, courses, exams, assignments, and more...'}
                  </p>

                  {recentSearches.length > 0 && (
                    <div className="text-left max-w-md mx-auto">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Searches
                      </h4>
                      <div className="space-y-2">
                        {recentSearches.map((search, idx) => (
                          <button
                            key={idx}
                            onClick={() => setQuery(search)}
                            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
                          >
                            <Search className="w-3 h-3" />
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No Results */}
              {query && !loading && totalResults === 0 && (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center">
                    <Search className="w-10 h-10 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {language === 'rw' ? 'Nta bisubizo byabonetse' : 'No exact matches found'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {language === 'rw' 
                      ? `Gerageza gushakisha "${query}" mu buryo butandukanye` 
                      : `Try searching for "${query}" differently`}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickSearches.map((quick, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(quick.query)}
                        className="rounded-full"
                      >
                        {quick.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t p-3 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border rounded">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border rounded">↵</kbd>
                    Select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border rounded">ESC</kbd>
                  Close
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
