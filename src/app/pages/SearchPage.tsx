import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Code, Building, Car, Users, Book, Trophy, ArrowRight, TrendingUp, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { API_BASE_URL } from '@/app/config/apiBase';

interface SearchPageProps {
  onNavigate: (page: string) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({
    trades: [],
    sports: [],
    news: [],
    staff: [],
    students: [],
    courses: []
  });

  // Real search function
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setResults({ trades: [], sports: [], news: [], staff: [], students: [], courses: [] });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/unified-integration/search/global?q=${encodeURIComponent(searchQuery)}&limit=20`);
        const data = await response.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Convert API results to display format
  const allItems = [
    ...results.trades.map((item: any) => ({
      id: `trade-${item.id}`,
      title: item.title || item.name,
      type: 'Trade',
      category: 'programs',
      description: item.description || '',
      icon: Code,
      color: 'from-blue-500 to-indigo-500',
      action: 'trades'
    })),
    ...results.sports.map((item: any) => ({
      id: `sport-${item.id}`,
      title: item.name,
      type: 'Sport',
      category: 'activities',
      description: item.description || '',
      icon: Trophy,
      color: 'from-green-500 to-emerald-500',
      action: 'sports'
    })),
    ...results.news.map((item: any) => ({
      id: `news-${item.id}`,
      title: item.title,
      type: 'News',
      category: 'news',
      description: item.excerpt || '',
      icon: Book,
      color: 'from-yellow-500 to-orange-500',
      action: 'news'
    })),
    ...results.staff.map((item: any) => ({
      id: `staff-${item.id}`,
      title: item.name,
      type: 'Staff',
      category: 'people',
      description: `${item.role} | ${item.email}`,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      action: 'staff'
    })),
    ...results.students.map((item: any) => ({
      id: `student-${item.id}`,
      title: item.name || `${item.first_name} ${item.last_name}`,
      type: 'Student',
      category: 'people',
      description: `${item.trade || ''} | ${item.class || ''}`,
      icon: Users,
      color: 'from-blue-400 to-cyan-400',
      action: 'students'
    }))
  ];

  const filteredResults = allItems.filter(item => {
    const matchesQuery = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesFilter = activeFilter === 'all' || item.type.toLowerCase() === activeFilter.toLowerCase();

    return matchesQuery && matchesCategory && matchesFilter;
  });

  const categories = [
    { id: 'all', label: 'All', count: allItems.length },
    { id: 'programs', label: 'Programs', count: allItems.filter(i => i.category === 'programs').length },
    { id: 'people', label: 'People', count: allItems.filter(i => i.category === 'people').length },
    { id: 'services', label: 'Services', count: allItems.filter(i => i.category === 'services').length },
    { id: 'activities', label: 'Activities', count: allItems.filter(i => i.category === 'activities').length },
  ];

  const quickFilters = [
    { id: 'all', label: 'All' },
    { id: 'trade', label: 'Trades' },
    { id: 'student', label: 'Students' },
    { id: 'teacher', label: 'Teachers' },
    { id: 'service', label: 'Services' },
  ];

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gradient-to-br from-yellow-500 to-green-500 p-4 rounded-xl">
                <Search className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                  Search Everything
                </h1>
                <p className="text-gray-600 mt-1">Find programs, students, teachers, and more...</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-yellow-600" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for programs, people, services..."
                className="pl-14 pr-14 h-16 text-lg border-2 border-yellow-300 focus:border-yellow-500 rounded-xl"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className={
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0'
                      : 'border-yellow-300 text-gray-700 hover:border-yellow-500'
                  }
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Categories */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-yellow-200 sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-yellow-600" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-yellow-500 to-green-500 text-white shadow-md'
                        : 'hover:bg-yellow-50 text-gray-700'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.label}</span>
                        <Badge
                          variant={selectedCategory === category.id ? 'secondary' : 'outline'}
                          className={selectedCategory === category.id ? 'bg-white/20 text-white border-white/30' : 'border-yellow-300'}
                        >
                          {category.count}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Found <span className="font-bold text-yellow-600">{filteredResults.length}</span> results
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {filteredResults.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredResults.map((result, index) => {
                    const Icon = result.icon;
                    return (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className="border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-xl transition-all cursor-pointer group"
                          onClick={() => onNavigate(result.action)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${result.color} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-lg font-black text-gray-900 group-hover:text-yellow-600 transition-colors">
                                    {result.title}
                                  </h3>
                                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{result.description}</p>
                                <div className="flex items-center justify-between">
                                  <Badge className={`bg-gradient-to-r ${result.color} text-white border-0`}>
                                    {result.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : searchQuery ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-md p-16 text-center border-2 border-yellow-200"
                >
                  <div className="bg-gradient-to-br from-yellow-100 to-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find anything matching "<span className="font-bold">{searchQuery}</span>"
                  </p>
                  <Button
                    onClick={() => setSearchQuery('')}
                    className="bg-gradient-to-r from-yellow-500 to-green-500 text-white"
                  >
                    Clear Search
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-md p-16 text-center border-2 border-yellow-200"
                >
                  <div className="bg-gradient-to-br from-yellow-100 to-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Start searching</h3>
                  <p className="text-gray-600">
                    Type in the search box above to find programs, students, teachers, and services
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
