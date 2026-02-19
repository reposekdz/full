import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Filter, TrendingUp, Clock, Star, BookOpen, Users, 
  GraduationCap, Award, Building, Code, Wrench, FileText, Image,
  Video, Calendar, MapPin, Phone, Mail, Globe, ChevronRight,
  Sparkles, Zap, Target, Trophy, Briefcase, School, Mic, MicOff
} from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

interface SearchResult {
  id: string;
  type: 'trade' | 'course' | 'student' | 'teacher' | 'news' | 'event' | 'staff' | 'sport' | 'service' | 'leadership' | 'developer' | 'library' | 'hostel' | 'exam' | 'assignment';
  title: string;
  description: string;
  category: string;
  image?: string;
  metadata: any;
  relevance: number;
}

export default function AdvancedSearchPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    sortBy: 'relevance'
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [stats, setStats] = useState({ 
    total: 0, trades: 0, courses: 0, students: 0, teachers: 0, 
    staff: 0, news: 0, sports: 0, services: 0, exams: 0, assignments: 0 
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
    
    // Load trending searches
    setTrendingSearches(['Software Development', 'Automotive', 'Building Construction', 'Level 4', 'Courses']);
  }, []);

  // Voice search
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice search not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      performSearch(transcript);
    };

    recognition.start();
  };

  // Auto-suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform comprehensive search across ALL systems
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Search across ALL available endpoints in parallel
      const searchPromises = [
        fetch(`${API_BASE}/trades/search/query?q=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/trade-courses-api/search?q=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/students/search?q=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/news/search?q=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/teachers?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/staff?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/sports?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/services?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/leadership?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/developers?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/exams?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/assignments?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/library/books?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_BASE}/hostel/rooms?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ json: () => ({ success: false }) }))
      ];

      const responses = await Promise.all(searchPromises);
      const dataArray = await Promise.all(responses.map(r => r.json()));

      const [
        tradesData, coursesData, studentsData, newsData, teachersData, 
        staffData, sportsData, servicesData, leadershipData, developersData,
        examsData, assignmentsData, libraryData, hostelData
      ] = dataArray;

      // Combine and format results
      const allResults: SearchResult[] = [];

      // Trades
      if (tradesData.success && tradesData.results?.trades) {
        tradesData.results.trades.forEach((trade: any) => {
          allResults.push({
            id: `trade-${trade.id}`,
            type: 'trade',
            title: trade.name_rw || trade.name,
            description: trade.description_rw || trade.description || '',
            category: trade.code,
            image: `/uploads/trades/${trade.code.toLowerCase()}.jpg`,
            metadata: trade,
            relevance: 100
          });
        });
      }

      // Courses
      if (coursesData.success && coursesData.results?.courses) {
        coursesData.results.courses.forEach((course: any) => {
          allResults.push({
            id: `course-${course.id}`,
            type: 'course',
            title: course.course_name,
            description: course.description || `${course.credits} credits - ${course.trade_name}`,
            category: course.trade_code,
            metadata: course,
            relevance: 95
          });
        });
      }

      // Students
      if (studentsData.success && studentsData.students) {
        studentsData.students.slice(0, 20).forEach((student: any) => {
          allResults.push({
            id: `student-${student.id}`,
            type: 'student',
            title: `${student.first_name} ${student.last_name}`,
            description: `${student.trade_name || 'Student'} - Level ${student.level_number || 'N/A'}`,
            category: student.trade_code || 'STUDENT',
            metadata: student,
            relevance: 85
          });
        });
      }

      // Teachers
      if (teachersData.success && teachersData.teachers) {
        teachersData.teachers.slice(0, 15).forEach((teacher: any) => {
          allResults.push({
            id: `teacher-${teacher.id}`,
            type: 'teacher',
            title: teacher.name || `${teacher.first_name} ${teacher.last_name}`,
            description: `${teacher.subject || teacher.department || 'Teacher'} - ${teacher.email || ''}`,
            category: 'TEACHER',
            metadata: teacher,
            relevance: 80
          });
        });
      }

      // Staff
      if (staffData.success && staffData.staff) {
        staffData.staff.slice(0, 15).forEach((staff: any) => {
          allResults.push({
            id: `staff-${staff.id}`,
            type: 'staff',
            title: staff.name || `${staff.first_name} ${staff.last_name}`,
            description: `${staff.role || staff.position || 'Staff'} - ${staff.department || ''}`,
            category: 'STAFF',
            metadata: staff,
            relevance: 75
          });
        });
      }

      // News
      if (newsData.success && newsData.articles) {
        newsData.articles.forEach((article: any) => {
          allResults.push({
            id: `news-${article.id}`,
            type: 'news',
            title: article.title,
            description: article.excerpt || article.content?.substring(0, 150),
            category: article.category,
            image: article.image_url,
            metadata: article,
            relevance: 70
          });
        });
      }

      // Sports
      if (sportsData.success && (sportsData.sports || sportsData.teams)) {
        const sports = sportsData.sports || sportsData.teams || [];
        sports.slice(0, 10).forEach((sport: any) => {
          allResults.push({
            id: `sport-${sport.id}`,
            type: 'sport',
            title: sport.name || sport.team_name,
            description: sport.description || `${sport.category || 'Sport'} - ${sport.coach || ''}`,
            category: 'SPORTS',
            image: sport.image_url,
            metadata: sport,
            relevance: 65
          });
        });
      }

      // Services
      if (servicesData.success && servicesData.services) {
        servicesData.services.slice(0, 10).forEach((service: any) => {
          allResults.push({
            id: `service-${service.id}`,
            type: 'service',
            title: service.name || service.title,
            description: service.description || service.details || '',
            category: 'SERVICES',
            image: service.image_url,
            metadata: service,
            relevance: 60
          });
        });
      }

      // Leadership
      if (leadershipData.success && leadershipData.leaders) {
        leadershipData.leaders.slice(0, 10).forEach((leader: any) => {
          allResults.push({
            id: `leader-${leader.id}`,
            type: 'leadership',
            title: leader.name,
            description: `${leader.position || leader.role} - ${leader.department || ''}`,
            category: 'LEADERSHIP',
            image: leader.image_url,
            metadata: leader,
            relevance: 55
          });
        });
      }

      // Developers
      if (developersData.success && developersData.developers) {
        developersData.developers.slice(0, 10).forEach((dev: any) => {
          allResults.push({
            id: `dev-${dev.id}`,
            type: 'developer',
            title: dev.name,
            description: `${dev.role || 'Developer'} - ${dev.specialization || ''}`,
            category: 'DEVELOPERS',
            image: dev.image_url,
            metadata: dev,
            relevance: 50
          });
        });
      }

      // Exams
      if (examsData.success && examsData.exams) {
        examsData.exams.slice(0, 10).forEach((exam: any) => {
          allResults.push({
            id: `exam-${exam.id}`,
            type: 'exam',
            title: exam.name || exam.title,
            description: `${exam.subject || ''} - ${exam.date || exam.scheduled_date || ''}`,
            category: 'EXAMS',
            metadata: exam,
            relevance: 45
          });
        });
      }

      // Assignments
      if (assignmentsData.success && assignmentsData.assignments) {
        assignmentsData.assignments.slice(0, 10).forEach((assignment: any) => {
          allResults.push({
            id: `assignment-${assignment.id}`,
            type: 'assignment',
            title: assignment.title || assignment.name,
            description: `${assignment.subject || ''} - Due: ${assignment.due_date || 'N/A'}`,
            category: 'ASSIGNMENTS',
            metadata: assignment,
            relevance: 40
          });
        });
      }

      // Library Books
      if (libraryData.success && libraryData.books) {
        libraryData.books.slice(0, 10).forEach((book: any) => {
          allResults.push({
            id: `book-${book.id}`,
            type: 'library',
            title: book.title || book.name,
            description: `${book.author || ''} - ${book.isbn || ''}`,
            category: 'LIBRARY',
            metadata: book,
            relevance: 35
          });
        });
      }

      // Hostel Rooms
      if (hostelData.success && hostelData.rooms) {
        hostelData.rooms.slice(0, 10).forEach((room: any) => {
          allResults.push({
            id: `room-${room.id}`,
            type: 'hostel',
            title: `Room ${room.room_number || room.number}`,
            description: `${room.type || 'Hostel'} - Capacity: ${room.capacity || 'N/A'}`,
            category: 'HOSTEL',
            metadata: room,
            relevance: 30
          });
        });
      }

      // Apply filters and sorting
      let filtered = allResults;
      if (filters.type !== 'all') {
        filtered = filtered.filter(r => r.type === filters.type);
      }
      if (filters.sortBy === 'relevance') {
        filtered.sort((a, b) => b.relevance - a.relevance);
      } else if (filters.sortBy === 'recent') {
        filtered.reverse();
      }

      setResults(filtered);
      setStats({
        total: filtered.length,
        trades: filtered.filter(r => r.type === 'trade').length,
        courses: filtered.filter(r => r.type === 'course').length,
        students: filtered.filter(r => r.type === 'student').length,
        teachers: filtered.filter(r => r.type === 'teacher').length,
        staff: filtered.filter(r => r.type === 'staff').length,
        news: filtered.filter(r => r.type === 'news').length,
        sports: filtered.filter(r => r.type === 'sport').length,
        services: filtered.filter(r => r.type === 'service').length,
        exams: filtered.filter(r => r.type === 'exam').length,
        assignments: filtered.filter(r => r.type === 'assignment').length
      });

      // Save to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, recentSearches]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'trade': return School;
      case 'course': return BookOpen;
      case 'student': return Users;
      case 'teacher': return GraduationCap;
      case 'staff': return Briefcase;
      case 'news': return FileText;
      case 'sport': return Trophy;
      case 'service': return Wrench;
      case 'leadership': return Award;
      case 'developer': return Code;
      case 'exam': return Target;
      case 'assignment': return FileText;
      case 'library': return BookOpen;
      case 'hostel': return Building;
      default: return Search;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trade': return 'bg-blue-100 text-blue-700';
      case 'course': return 'bg-green-100 text-green-700';
      case 'student': return 'bg-purple-100 text-purple-700';
      case 'teacher': return 'bg-indigo-100 text-indigo-700';
      case 'staff': return 'bg-cyan-100 text-cyan-700';
      case 'news': return 'bg-orange-100 text-orange-700';
      case 'sport': return 'bg-yellow-100 text-yellow-700';
      case 'service': return 'bg-pink-100 text-pink-700';
      case 'leadership': return 'bg-red-100 text-red-700';
      case 'developer': return 'bg-violet-100 text-violet-700';
      case 'exam': return 'bg-rose-100 text-rose-700';
      case 'assignment': return 'bg-amber-100 text-amber-700';
      case 'library': return 'bg-emerald-100 text-emerald-700';
      case 'hostel': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Search Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 flex items-center justify-center gap-4">
              <Sparkles className="w-12 h-12" />
              Advanced Search
              <Zap className="w-12 h-12" />
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Search trades, courses, students, news, and more
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-2">
                <Search className="w-6 h-6 text-white/70 ml-4" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for trades, courses, students, news..."
                  className="flex-1 bg-transparent border-0 text-white placeholder:text-white/70 text-lg focus-visible:ring-0"
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuery('')}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={startVoiceSearch}
                  className={`text-white hover:bg-white/20 ${isListening ? 'animate-pulse bg-red-500' : ''}`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Auto-suggestions */}
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(suggestion);
                        performSearch(suggestion);
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 flex items-center gap-2"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.form>

          {/* Quick Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-6"
          >
            <Select value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
              <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="trade">Trades</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="sport">Sports</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="developer">Developers</SelectItem>
                <SelectItem value="exam">Exams</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(v) => setFilters({...filters, sortBy: v})}>
              <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Search Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <Badge>{stats.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trades</span>
                    <Badge variant="secondary">{stats.trades}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Courses</span>
                    <Badge variant="secondary">{stats.courses}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students</span>
                    <Badge variant="secondary">{stats.students}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teachers</span>
                    <Badge variant="secondary">{stats.teachers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Staff</span>
                    <Badge variant="secondary">{stats.staff}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">News</span>
                    <Badge variant="secondary">{stats.news}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sports</span>
                    <Badge variant="secondary">{stats.sports}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Services</span>
                    <Badge variant="secondary">{stats.services}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.slice(0, 5).map((search, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery(search);
                          performSearch(search);
                        }}
                        className="w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trending */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending
                </h3>
                <div className="space-y-2">
                  {trendingSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(search);
                        performSearch(search);
                      }}
                      className="w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-2"
                    >
                      <Sparkles className="w-3 h-3" />
                      {search}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {query ? 'No results found' : 'Start searching'}
                </h3>
                <p className="text-gray-500">
                  {query ? 'Try different keywords' : 'Enter a search query above'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Found {stats.total} results for "{query}"
                  </h2>
                </div>

                <AnimatePresence mode="wait">
                  {results.map((result, i) => {
                    const Icon = getIcon(result.type);
                    return (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              {result.image && (
                                <img
                                  src={result.image}
                                  alt={result.title}
                                  className="w-24 h-24 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-5 h-5 text-gray-400" />
                                    <Badge className={getTypeColor(result.type)}>
                                      {result.type}
                                    </Badge>
                                    {result.category && (
                                      <Badge variant="outline">{result.category}</Badge>
                                    )}
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {result.title}
                                </h3>
                                <p className="text-gray-600 line-clamp-2">
                                  {result.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
