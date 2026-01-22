import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, BookOpen, FileText, Calendar, Trophy, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
}

interface GlobalSearchProps {
  onNavigate?: (page: string, id?: number) => void;
}

const typeIcons: Record<string, any> = {
  student: User,
  teacher: User,
  course: BookOpen,
  assignment: FileText,
  exam: Calendar,
  sport: Trophy,
  notification: Bell,
  trade: BookOpen
};

const typeColors: Record<string, string> = {
  student: 'bg-blue-500',
  teacher: 'bg-purple-500',
  course: 'bg-green-500',
  assignment: 'bg-orange-500',
  exam: 'bg-red-500',
  sport: 'bg-yellow-500',
  notification: 'bg-pink-500',
  trade: 'bg-indigo-500'
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults({});
        setTotalResults(0);
      }
    }, 300);

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
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const typeRoutes: Record<string, string> = {
      student: 'students',
      teacher: 'teachers',
      course: 'courses',
      assignment: 'assignments',
      exam: 'exams',
      sport: 'sports',
      trade: 'trades'
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

  const getResultSubtitle = (result: SearchResult) => {
    if (result.email) return result.email;
    if (result.student_id) return result.student_id;
    if (result.description) return result.description.substring(0, 60) + '...';
    return '';
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button/Input */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full md:hidden"
        >
          <Search className="w-5 h-5" />
        </Button>

        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={language === 'rw' ? 'Shakisha...' : 'Search...'}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="pl-10 pr-10 w-64 lg:w-80 rounded-full bg-gray-100 dark:bg-gray-800 border-0"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setQuery('');
                  setResults({});
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed md:absolute top-16 md:top-full left-0 right-0 md:left-auto md:right-0 md:w-[500px] mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Mobile Search Input */}
            <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={language === 'rw' ? 'Shakisha...' : 'Search...'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="pl-10 pr-10 rounded-full"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuery('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              {loading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              )}

              {!loading && query.trim().length < 2 && (
                <div className="p-8 text-center text-gray-500">
                  {language === 'rw' ? 'Andika nibura inyuguti 2...' : 'Type at least 2 characters...'}
                </div>
              )}

              {!loading && query.trim().length >= 2 && totalResults === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {language === 'rw' ? 'Nta bisubizo byabonetse' : 'No results found'}
                </div>
              )}

              {!loading && totalResults > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {totalResults} {language === 'rw' ? 'ibisubizo' : 'results'}
                  </div>

                  {Object.entries(results).map(([category, items]: [string, any]) => {
                    if (!items || items.length === 0) return null;

                    return (
                      <div key={category} className="mb-4">
                        <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                          {category}
                        </div>
                        {items.map((result: SearchResult) => {
                          const Icon = typeIcons[result.type] || Search;
                          const colorClass = typeColors[result.type] || 'bg-gray-500';

                          return (
                            <button
                              key={`${result.type}-${result.id}`}
                              onClick={() => handleResultClick(result)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                            >
                              <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                  {getResultTitle(result)}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {getResultSubtitle(result)}
                                </div>
                              </div>
                              <Badge variant="secondary" className="flex-shrink-0">
                                {result.type}
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
