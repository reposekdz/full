import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Mic, TrendingUp, Clock, Sparkles, Zap, ArrowRight, Star, Users, Trophy, BookOpen, Calendar, MapPin, Tag, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface SearchPageProps {
  onNavigate: (page: string) => void;
}

const AdvancedSearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ dateRange: 'all', location: 'all', status: 'all' });
  const searchTimeout = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
    fetchTrending();
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => performSearch(), 300);
      fetchSuggestions();
    } else {
      setResults([]);
      setSuggestions([]);
    }
  }, [query, activeTab, sortBy, filters]);

  const fetchTrending = async () => {
    setTrending(['Software Development', 'Football Team', 'Exam Results', 'Library', 'Sports Events']);
  };

  const fetchSuggestions = async () => {
    if (query.length < 2) return;
    const mockSuggestions = [
      `${query} courses`,
      `${query} teachers`,
      `${query} students`,
      `${query} results`
    ];
    setSuggestions(mockSuggestions.slice(0, 4));
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const [students, teachers, trades, sports, news, courses] = await Promise.all([
        fetch(`http://localhost:5000/api/students/search?q=${query}`).then(r => r.json()).catch(() => ({ students: [] })),
        fetch(`http://localhost:5000/api/teachers/search?q=${query}`).then(r => r.json()).catch(() => ({ teachers: [] })),
        fetch(`http://localhost:5000/api/trades?search=${query}`).then(r => r.json()).catch(() => ({ trades: [] })),
        fetch(`http://localhost:5000/api/sports/search?q=${query}`).then(r => r.json()).catch(() => ({ teams: [] })),
        fetch(`http://localhost:5000/api/news?search=${query}`).then(r => r.json()).catch(() => ({ articles: [] })),
        fetch(`http://localhost:5000/api/courses?search=${query}`).then(r => r.json()).catch(() => ({ courses: [] }))
      ]);

      const allResults = [
        ...(students.students || []).map((s: any) => ({ ...s, type: 'student', icon: '👨‍🎓', color: 'blue' })),
        ...(teachers.teachers || []).map((t: any) => ({ ...t, type: 'teacher', icon: '👨‍🏫', color: 'green' })),
        ...(trades.trades || []).map((t: any) => ({ ...t, type: 'trade', icon: '🎓', color: 'purple' })),
        ...(sports.teams || []).map((s: any) => ({ ...s, type: 'sport', icon: '⚽', color: 'orange' })),
        ...(news.articles || []).map((n: any) => ({ ...n, type: 'news', icon: '📰', color: 'red' })),
        ...(courses.courses || []).map((c: any) => ({ ...c, type: 'course', icon: '📚', color: 'yellow' }))
      ];

      let filtered = activeTab === 'all' ? allResults : allResults.filter(r => r.type === activeTab);
      
      if (sortBy === 'date') filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      if (sortBy === 'name') filtered.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
      
      setResults(filtered);
      saveSearch(query);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice search not supported in this browser');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'rw' ? 'rw-RW' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => setQuery(e.results[0][0].transcript);
    recognition.start();
  };

  const tabs = [
    { id: 'all', label: language === 'rw' ? 'Byose' : 'All', icon: Sparkles, count: results.length },
    { id: 'student', label: language === 'rw' ? 'Abanyeshuri' : 'Students', icon: Users, count: results.filter(r => r.type === 'student').length },
    { id: 'teacher', label: language === 'rw' ? 'Abarimu' : 'Teachers', icon: Star, count: results.filter(r => r.type === 'teacher').length },
    { id: 'trade', label: language === 'rw' ? 'Amahugurwa' : 'Trades', icon: BookOpen, count: results.filter(r => r.type === 'trade').length },
    { id: 'sport', label: language === 'rw' ? 'Siporo' : 'Sports', icon: Trophy, count: results.filter(r => r.type === 'sport').length },
    { id: 'news', label: language === 'rw' ? 'Amakuru' : 'News', icon: Calendar, count: results.filter(r => r.type === 'news').length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Search Bar */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-yellow-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-yellow-500 via-green-500 to-yellow-600 p-4 rounded-2xl shadow-lg">
                <Search className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-700 bg-clip-text text-transparent">
                  {language === 'rw' ? 'Shakisha Byose' : 'Search Everything'}
                </h1>
                <p className="text-gray-600 text-lg mt-1">{language === 'rw' ? 'Shakisha abanyeshuri, abarimu, amahugurwa n\'ibindi...' : 'Search students, teachers, programs & more...'}</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-yellow-600" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={language === 'rw' ? 'Andika hano ushakisha...' : 'Type to search...'}
                className="w-full pl-16 pr-32 py-6 text-xl border-4 border-yellow-300 rounded-2xl focus:border-green-500 focus:outline-none transition-all"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  onClick={startVoiceSearch}
                  className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-green-500 hover:shadow-lg'}`}
                >
                  <Mic className="w-6 h-6 text-white" />
                </button>
                {query && (
                  <button onClick={() => setQuery('')} className="p-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all">
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(sug)}
                    className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-full text-sm font-bold text-gray-700 transition-all"
                  >
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <SlidersHorizontal className="w-5 h-5 inline mr-2" />
                {language === 'rw' ? 'Inyongera' : 'Filters'}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-5 py-3 bg-white border-2 border-yellow-300 rounded-xl font-bold text-gray-700 hover:border-green-500 transition-all"
              >
                <option value="relevance">{language === 'rw' ? 'Bifitanye isano' : 'Relevance'}</option>
                <option value="date">{language === 'rw' ? 'Itariki' : 'Date'}</option>
                <option value="name">{language === 'rw' ? 'Izina' : 'Name'}</option>
              </select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl border-2 border-yellow-200">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{language === 'rw' ? 'Igihe' : 'Date Range'}</label>
                    <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })} className="w-full px-4 py-2 border-2 border-yellow-300 rounded-xl">
                      <option value="all">{language === 'rw' ? 'Byose' : 'All Time'}</option>
                      <option value="today">{language === 'rw' ? 'Uyu munsi' : 'Today'}</option>
                      <option value="week">{language === 'rw' ? 'Iki cyumweru' : 'This Week'}</option>
                      <option value="month">{language === 'rw' ? 'Uku kwezi' : 'This Month'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{language === 'rw' ? 'Ahantu' : 'Location'}</label>
                    <select value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} className="w-full px-4 py-2 border-2 border-yellow-300 rounded-xl">
                      <option value="all">{language === 'rw' ? 'Ahantu hose' : 'All Locations'}</option>
                      <option value="campus">{language === 'rw' ? 'Campus' : 'Campus'}</option>
                      <option value="online">{language === 'rw' ? 'Kuri interineti' : 'Online'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{language === 'rw' ? 'Uko bimeze' : 'Status'}</label>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-4 py-2 border-2 border-yellow-300 rounded-xl">
                      <option value="all">{language === 'rw' ? 'Byose' : 'All'}</option>
                      <option value="active">{language === 'rw' ? 'Birakora' : 'Active'}</option>
                      <option value="archived">{language === 'rw' ? 'Byashyizwe mu bubiko' : 'Archived'}</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Trending & Recent */}
        {!query && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
              <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
                {language === 'rw' ? 'Bikunze Gushakishwa' : 'Trending Searches'}
              </h3>
              <div className="space-y-2">
                {trending.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(t)}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-yellow-50 to-green-50 hover:from-yellow-100 hover:to-green-100 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <span className="font-bold text-gray-800">{t}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
              <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-blue-500" />
                {language === 'rw' ? 'Byashakishijwe Vuba' : 'Recent Searches'}
              </h3>
              {recentSearches.length > 0 ? (
                <div className="space-y-2">
                  {recentSearches.slice(0, 5).map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(r)}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <span className="font-bold text-gray-700">{r}</span>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">{language === 'rw' ? 'Nta bushakashatsi bwabonetse' : 'No recent searches'}</p>
              )}
            </motion.div>
          </div>
        )}

        {/* Results */}
        {query && (
          <>
            {/* Tabs */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-yellow-500 via-green-500 to-yellow-600 text-white shadow-xl scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-yellow-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    <span className={`px-3 py-1 rounded-full text-sm font-black ${activeTab === tab.id ? 'bg-white/30' : 'bg-yellow-100 text-yellow-700'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
              </div>
            ) : results.length > 0 ? (
              <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border-2 border-yellow-200 hover:border-green-400 transition-all cursor-pointer group"
                    onClick={() => onNavigate(result.type === 'trade' ? `trade/${result.id}` : result.type === 'sport' ? `sport-team/${result.id}` : result.type)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-5xl group-hover:scale-110 transition-transform`}>{result.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                          {result.name || result.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{result.description || result.bio || result.content}</p>
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 bg-${result.color}-100 text-${result.color}-700 rounded-full text-xs font-bold`}>
                            {result.type}
                          </span>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-2 transition-all" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-xl p-16 text-center border-4 border-yellow-200">
                <div className="bg-gradient-to-br from-yellow-100 to-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-yellow-600" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-3">{language === 'rw' ? 'Nta gisubizo cyabonetse' : 'No Results Found'}</h3>
                <p className="text-gray-600 text-lg mb-6">
                  {language === 'rw' ? 'Ntacyo cyabonetse kijyanye na' : 'Nothing found for'} "<span className="font-bold">{query}</span>"
                </p>
                <button onClick={() => setQuery('')} className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white rounded-2xl font-bold hover:shadow-xl transition-all">
                  {language === 'rw' ? 'Siba Ishakisha' : 'Clear Search'}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchPage;
