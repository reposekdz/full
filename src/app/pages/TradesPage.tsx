import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TradeDetailPage from './TradeDetailPage';
import { 
  Code, 
  HardHat, 
  Wrench, 
  ArrowRight, 
  X, 
  Image as ImageIcon, 
  Settings, 
  Award, 
  Sparkles, 
  ZoomIn, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Star,
  GraduationCap,
  Building,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Play,
  Download,
  BookOpen,
  Target,
  Trophy,
  CheckCircle2,
  Heart,
  Share2,
  Eye,
  Filter,
  Search,
  Grid3X3,
  List,
  BarChart3,
  PieChart,
  LineChart,
  Users2,
  Briefcase,
  Globe,
  Zap,
  Shield,
  Lightbulb,
  Rocket,
  Crown,
  Gem,
  Phone,
  Mail
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { apiService } from '@/app/services/apiService';

interface Trade {
  id: string;
  title: string;
  code: string;
  icon: typeof Code;
  image: string;
  description: string;
  levels: Array<{
    level: string;
    duration: string;
    description: string;
    modules: string[];
  }>;
  tools: Array<{
    name: string;
    icon: typeof Code;
    description: string;
    image: string;
    category: string;
  }>;
  gallery: Array<{
    url: string;
    title: string;
    category: string;
    description?: string;
  }>;
  features: string[];
  workshops: Array<{
    name: string;
    description: string;
    duration: string;
    capacity: number;
    instructor: string;
    image: string;
  }>;
  instructors: Array<{
    name: string;
    role: string;
    experience: string;
    specialization: string;
    image: string;
    email: string;
  }>;
  careerPaths: Array<{
    title: string;
    description: string;
    averageSalary: string;
    growthRate: string;
  }>;
  statistics: {
    students: number;
    successRate: number;
    graduationRate: number;
    employmentRate: number;
  };
}

interface TradesPageProps {
  onNavigate: (page: string) => void;
}

const TradesPage: React.FC<TradesPageProps> = ({ onNavigate }) => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [toolFilter, setToolFilter] = useState('All');
  const [activeStatistic, setActiveStatistic] = useState<string | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTradeCode, setSelectedTradeCode] = useState<string | null>(() => {
    // Restore selected trade from localStorage
    const saved = localStorage.getItem('trades_selected_code');
    return saved || null;
  });
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [tradeGalleries, setTradeGalleries] = useState<{[key: string]: any[]}>({});
  const [loadingGallery, setLoadingGallery] = useState(false);

  // Save selected trade code to localStorage
  useEffect(() => {
    if (selectedTradeCode) {
      localStorage.setItem('trades_selected_code', selectedTradeCode);
    } else {
      localStorage.removeItem('trades_selected_code');
    }
  }, [selectedTradeCode]);

  // Load gallery images for a trade
  const loadTradeGallery = async (tradeCode: string) => {
    if (tradeGalleries[tradeCode]) return; // Already loaded
    
    try {
      setLoadingGallery(true);
      const response = await fetch(`http://localhost:5000/api/trade-images/gallery/${tradeCode}`);
      const data = await response.json();
      
      if (data.success && data.gallery) {
        setTradeGalleries(prev => ({
          ...prev,
          [tradeCode]: data.gallery
        }));
      }
    } catch (error) {
      console.error(`Error loading gallery for ${tradeCode}:`, error);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Load trades data from database
  useEffect(() => {
    const loadTrades = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/trades/all');
        const data = await response.json();
        
        if (data.success && data.trades && data.trades.length > 0) {
          // Group trades by base type (SOD, BDC, AUTO)
          const tradeGroups: any = {};
          
          data.trades.forEach((trade: any) => {
            const baseType = trade.code.replace(/L[345]/, ''); // Extract SOD, BDC, or AUTO
            if (!tradeGroups[baseType]) {
              tradeGroups[baseType] = {
                baseType,
                name: trade.name.replace(/Level [345] /, ''),
                name_rw: trade.name_rw,
                description: trade.description || trade.description_rw,
                levels: []
              };
            }
            
            const level = trade.code.match(/L[345]/)?.[0] || '';
            tradeGroups[baseType].levels.push({
              level: `Level ${level.replace('L', '')}`,
              code: trade.code,
              duration: `${trade.duration_years || 2} Years`,
              description: trade.description || trade.description_rw,
              modules: (trade.courses || []).map((c: any) => c.name),
              courses: trade.courses || [],
              hasClasses: baseType === 'AUTO' && (level === 'L4' || level === 'L5'),
              classes: baseType === 'AUTO' && (level === 'L4' || level === 'L5') ? ['Class A', 'Class B'] : ['Single Class']
            });
          });

          // Convert to array and create enhanced trades
          const enhancedTrades = Object.values(tradeGroups).map((group: any) => ({
            id: group.baseType,
            title: group.name_rw || group.name,
            code: group.baseType,
            icon: getTradeIcon(group.baseType),
            image: getTradeImage(group.baseType),
            description: group.description || 'Porogaramu y\'amahugurwa y\'ikoranabuhanga',
            features: ['Amahugurwa y\'Umwuga', 'Ibipimo by\'Inganda', 'Ubumenyi Bufatika', 'Witeguye Akazi', 'Abarimu b\'Inzobere'],
            levels: group.levels.sort((a: any, b: any) => a.level.localeCompare(b.level)),
            tools: [],
            gallery: [],
            workshops: [],
            instructors: [],
            careerPaths: [],
            statistics: {
              students: group.levels.reduce((sum: number, l: any) => sum + (l.total_students || 0), 0),
              successRate: 95,
              graduationRate: 92,
              employmentRate: 88
            }
          }));
          
          setAllTrades(enhancedTrades);
          setTrades(enhancedTrades);
          
          // Load galleries for all trades
          enhancedTrades.forEach(trade => {
            loadTradeGallery(trade.code);
          });
        }
      } catch (error) {
        console.error('Error loading trades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Search from database - comprehensive search
  useEffect(() => {
    const searchDatabase = async () => {
      if (searchTerm === '') {
        setSearchResults([]);
        if (selectedCategory === 'All') {
          setTrades(allTrades);
        } else {
          setTrades(allTrades.filter(t => t.code === selectedCategory));
        }
        return;
      }

      setSearchLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('q', searchTerm);
        
        const response = await fetch(`http://localhost:5000/api/trades/search/query?${params}`);
        const data = await response.json();
        
        if (data.success && data.results) {
          const results: any[] = [];
          const tradeGroups: any = {};
          
          // Process trades from search
          if (data.results.trades) {
            data.results.trades.forEach((trade: any) => {
              const baseType = trade.code.replace(/L[345]/, '');
              
              if (!tradeGroups[baseType]) {
                tradeGroups[baseType] = {
                  baseType,
                  name: trade.name_rw || trade.name.replace(/Level [345] /, ''),
                  description: trade.description || trade.description_rw,
                  levels: []
                };
              }
              
              const level = trade.code.match(/L[345]/)?.[0] || '';
              tradeGroups[baseType].levels.push({
                level: `Level ${level.replace('L', '')}`,
                code: trade.code,
                duration: `${trade.duration_years || 2} Years`,
                description: trade.description || trade.description_rw,
                modules: [],
                courses: [],
                hasClasses: baseType === 'AUTO' && (level === 'L4' || level === 'L5'),
                classes: baseType === 'AUTO' && (level === 'L4' || level === 'L5') ? ['Class A', 'Class B'] : ['Single Class']
              });
            });
          }
          
          // Process courses from search
          if (data.results.courses) {
            data.results.courses.forEach((course: any) => {
              results.push({
                type: 'course',
                tradeCode: course.trade_code,
                tradeName: course.trade_name,
                name: course.name_rw || course.name,
                code: course.code,
                credits: course.credits,
                icon: BookOpen
              });
            });
          }
          
          // Process classes from search
          if (data.results.classes) {
            data.results.classes.forEach((cls: any) => {
              results.push({
                type: 'class',
                name: cls.name,
                courseName: cls.course_name,
                courseCode: cls.course_code,
                icon: Users
              });
            });
          }

          const enhancedTrades = Object.values(tradeGroups).map((group: any) => ({
            id: group.baseType,
            title: group.name,
            code: group.baseType,
            icon: getTradeIcon(group.baseType),
            image: getTradeImage(group.baseType),
            description: group.description || 'Porogaramu y\'amahugurwa y\'ikoranabuhanga',
            features: ['Amahugurwa y\'Umwuga', 'Ibipimo by\'Inganda', 'Ubumenyi Bufatika', 'Witeguye Akazi', 'Abarimu b\'Inzobere'],
            levels: group.levels.sort((a: any, b: any) => a.level.localeCompare(b.level)),
            tools: [],
            gallery: [],
            workshops: [],
            instructors: [],
            careerPaths: [],
            statistics: {
              students: 0,
              successRate: 95,
              graduationRate: 92,
              employmentRate: 88
            }
          }));
          
          // Apply category filter
          const filteredResults = selectedCategory === 'All' 
            ? enhancedTrades 
            : enhancedTrades.filter(t => t.code === selectedCategory);
          
          setSearchResults(results);
          setTrades(filteredResults);
        } else {
          setSearchResults([]);
          setTrades([]);
        }
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults([]);
        setTrades([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchDatabase();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, allTrades]);

  const getTradeIcon = (code: string) => {
    if (code === 'SOD') return Code;
    if (code === 'BDC') return HardHat;
    if (code === 'AUTO') return Wrench;
    return Code;
  };

  const getTradeImage = (code: string) => {
    if (code === 'SOD') return 'http://localhost:5000/uploads/trades/sod.jpg';
    if (code === 'BDC') return 'http://localhost:5000/uploads/trades/bdc.jpg';
    if (code === 'AUTO') return 'http://localhost:5000/uploads/trades/aut1.jpg';
    return 'http://localhost:5000/uploads/trades/sod.jpg';
  };

  if (selectedTradeCode) {
    return <TradeDetailPage tradeCode={selectedTradeCode} onBack={() => setSelectedTradeCode(null)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Iratunganya imyuga...</p>
        </div>
      </div>
    );
  }

  // Filter functions with enhanced search
  const filteredTrades = trades;
  const searchResultsCount = filteredTrades.length + searchResults.length;
  const hasActiveSearch = searchTerm !== '' || selectedCategory !== 'All';

  const filteredGallery = selectedTrade?.gallery.filter(item => 
    galleryFilter === 'All' || item.category === galleryFilter
  ) || [];

  const filteredTools = selectedTrade?.tools.filter(tool => 
    toolFilter === 'All' || tool.category === toolFilter
  ) || [];

  const toolCategories = Array.from(new Set(selectedTrade?.tools.map(tool => tool.category) || []));
  const galleryCategories = Array.from(new Set(selectedTrade?.gallery.map(item => item.category) || []));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-green-600 via-yellow-500 to-lime-500 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-50 to-green-50 bg-clip-text text-transparent">
              Imyuga Yacu
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Menya porogaramu z'ikoranabuhanga zo mu rwego rwo hejuru zitegura umwuga utsinzi mu nganda zigezweho
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="text-lg px-6 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Users className="w-5 h-5 mr-2" />
                {trades.reduce((total, trade) => total + trade.statistics.students, 0)}+ Abanyeshuri
              </Badge>
              <Badge className="text-lg px-6 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Trophy className="w-5 h-5 mr-2" />
                95% Intsinzi
              </Badge>
              <Badge className="text-lg px-6 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Briefcase className="w-5 h-5 mr-2" />
                Ubufatanye n'Inganda
              </Badge>
            </div>

            {/* Search Bar in Hero */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                    {searchLoading && (
                      <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                      </div>
                    )}
                    <Input
                      type="text"
                      placeholder="Shakisha imyuga, amasomo, cyangwa ikoranabuhanga..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSearchResults(true);
                      }}
                      onFocus={() => {
                        setSearchFocused(true);
                        setShowSearchResults(true);
                      }}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                      className="pl-12 h-14 text-lg bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:ring-2 focus:ring-white/50 transition-all"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setShowSearchResults(false);
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <Select value={selectedCategory} onValueChange={(value) => {
                    setSelectedCategory(value);
                    setShowSearchResults(true);
                  }}>
                    <SelectTrigger className="sm:w-56 h-14 bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Ibyiciro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Ibyiciro Byose</SelectItem>
                      {trades.map((trade) => (
                        <SelectItem key={trade.code} value={trade.code}>
                          {trade.code} - {trade.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Live Search Results Preview */}
                {(searchFocused || showSearchResults) && hasActiveSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 bg-white rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-green-50 to-yellow-50 border-b border-green-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">
                          {searchResultsCount} {searchResultsCount === 1 ? 'Igisubizo cyabonetse' : 'Ibisubizo byabonetse'}
                        </p>
                        {hasActiveSearch && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('All');
                              setShowSearchResults(false);
                            }}
                            className="text-xs text-gray-600 hover:text-gray-900 underline"
                          >
                            Siba byose
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {/* Trades */}
                      {filteredTrades.slice(0, 2).map((trade) => (
                        <div
                          key={trade.code}
                          onClick={() => {
                            setSelectedTradeCode(trade.code);
                            setShowSearchResults(false);
                          }}
                          className="p-4 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-green-600 to-yellow-600 rounded-lg">
                              <trade.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{trade.title}</h4>
                                <Badge className="bg-blue-100 text-blue-700 text-xs">Umwuga</Badge>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1">{trade.description}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">{trade.code}</Badge>
                          </div>
                        </div>
                      ))}
                      
                      {/* Courses */}
                      {searchResults.filter(r => r.type === 'course').slice(0, 3).map((result, idx) => (
                        <div
                          key={`course-${idx}`}
                          onClick={() => {
                            const baseCode = result.tradeCode?.replace(/L[345]/, '') || result.tradeCode;
                            setSelectedTradeCode(baseCode);
                            setShowSearchResults(false);
                          }}
                          className="p-4 hover:bg-yellow-50 cursor-pointer transition-colors border-b border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg">
                              <result.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{result.name}</h4>
                                <Badge className="bg-yellow-100 text-yellow-700 text-xs">Isomo</Badge>
                              </div>
                              <p className="text-xs text-gray-600">{result.tradeName} • {result.code} • {result.credits} credits</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Instructors */}
                      {searchResults.filter(r => r.type === 'instructor').slice(0, 3).map((result, idx) => (
                        <div
                          key={`instructor-${idx}`}
                          onClick={() => {
                            const baseCode = result.tradeCode?.replace(/L[345]/, '') || result.tradeCode;
                            setSelectedTradeCode(baseCode);
                            setShowSearchResults(false);
                          }}
                          className="p-4 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                              <result.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{result.name}</h4>
                                <Badge className="bg-blue-100 text-blue-700 text-xs">Umwarimu</Badge>
                              </div>
                              <p className="text-xs text-gray-600">{result.tradeName} • {result.specialization}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {searchResultsCount > 8 && (
                        <div className="p-3 text-center bg-gray-50">
                          <button
                            onClick={() => setShowSearchResults(false)}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            Reba {searchResultsCount - 8} ibindi hasi ↓
                          </button>
                        </div>
                      )}
                      {searchResultsCount === 0 && (
                        <div className="p-8 text-center">
                          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">Nta kibazo cyabonetse</p>
                          <p className="text-sm text-gray-500 mt-1">Gerageza ijambo rishya</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Trade Cards - Below Hero (No Overlap) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"
          >
            Hitamo Umwuga Wawe
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Reba imyuga yacu yose kandi uhitemo icyo ukunda. Buri mwuga ufite amahugurwa yuzuye, abarimu b'inzobere, n'amahirwe menshi y'akazi.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trades.map((trade, index) => {
            const isSOD = trade.code === 'SOD';
            const isBDC = trade.code === 'BDC';
            const isAUTO = trade.code === 'AUTO';
            
            return (
              <motion.div
                key={trade.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-gradient-to-br from-white via-green-50 to-yellow-50 rounded-3xl p-8 border-2 border-green-200 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedTradeCode(trade.code)}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-green-600 to-yellow-600 rounded-2xl shadow-lg">
                    <trade.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Badge className="mb-2 bg-gradient-to-r from-green-600 to-yellow-600 text-white">
                      {trade.code}
                    </Badge>
                    <h3 className="text-2xl font-bold text-gray-900">{trade.title}</h3>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {isSOD && (
                      <>
                        Iterambere rya Software ni umwuga ukomeye cyane ugamije guteza imbere abanyeshuri bafite ubushobozi bwo gukora 
                        porogaramu z'urubuga (websites), porogaramu z'itelifone (mobile apps), imikino (games), n'ibindi bikoresho bya software. 
                        Abanyeshuri biga ururimi rw'ikoranabuhanga nka JavaScript, Python, Java, C++, React, Node.js, Angular, Vue.js, n'ibindi byinshi. 
                        Biga kandi uburyo bwo gukora ububiko bw'amakuru (databases) nka MySQL, MongoDB, PostgreSQL, Firebase, n'ibindi. 
                        Muri ubu burezi, abanyeshuri bamenya gukora API (Application Programming Interfaces), gukoresha cloud computing 
                        (AWS, Azure, Google Cloud), Docker, Kubernetes, n'ikoranabuhanga rigezweho rya DevOps. Biga kandi cybersecurity 
                        (umutekano wa data), encryption, authentication, n'uburyo bwo kurinda porogaramu. Porogaramu yacu itanga amahugurwa 
                        yuzuye akurikije ibipimo mpuzamahanga, ikaba ifite abarimu b'inzobere bafite uburambe bwinshi mu iterambere rya software. 
                        Nyuma y'amahugurwa, abanyeshuri bashobora gukora nk'abakora software (software developers), web developers, mobile app 
                        developers, game developers, data scientists, AI/ML engineers, cyangwa bakongera kwiga muri kaminuza. Amahirwe y'akazi 
                        ni menshi cyane kuko software irakenewe mu nganda zose - amabanki, ibigo by'ubuzima, amasosiyete y'ikoranabuhanga, 
                        guverinoma, n'ibindi byinshi.
                      </>
                    )}
                    {isBDC && (
                      <>
                        Ubwubatsi n'Inyubako ni umwuga ukomeye cyane ugamije guteza imbere abanyeshuri bafite ubushobozi bwo kubaka amazu, 
                        inzira, amazu y'ubucuruzi, amazu y'ishuri, ibitaro, n'ibindi bintu by'ubwubatsi. Abanyeshuri biga uburyo bwo gushushanya 
                        amazu n'ibindi bintu by'ubwubatsi ukoresheje porogaramu nka AutoCAD, Revit, SketchUp, ArchiCAD, n'ibindi. Biga kandi 
                        gukoresha ibikoresho by'ubwubatsi nka mashini zo kubaka, ibikoresho byo gupima, ibikoresho byo gusya sima, n'ibindi. 
                        Muri ubu burezi, abanyeshuri bamenya uburyo bwo gukora imishinga y'ubwubatsi, gucunga abantu (project management), 
                        gucunga ibikoresho, gucunga amafaranga, n'ibindi bintu by'ingenzi by'ubwubatsi. Biga kandi ibipimo by'ubwubatsi 
                        (building codes), umutekano ku murimo (safety standards), ubwiza bw'amazu (architectural design), n'uburambe 
                        bw'ibikoresho (material science). Porogaramu yacu itanga amahugurwa yuzuye akurikije ibipimo mpuzamahanga, ikaba ifite 
                        abarimu b'inzobere bafite uburambe bwinshi mu bwubatsi. Nyuma y'amahugurwa, abanyeshuri bashobora gukora nk'abubatsi 
                        (builders), abashushanya (architects), abacunga imishinga (project managers), abagenzuzi b'ubwubatsi (construction 
                        supervisors), cyangwa bakongera kwiga muri kaminuza. Amahirwe y'akazi ni menshi cyane kuko ubwubatsi burakenewe mu 
                        iterambere ry'igihugu - kubaka amazu, inzira, ibitaro, amashuri, n'ibindi bintu by'ingenzi.
                      </>
                    )}
                    {isAUTO && (
                      <>
                        Ikoranabuhanga ry'Ibinyabiziga ni umwuga ukomeye cyane ugamije guteza imbere abanyeshuri bafite ubushobozi bwo gusana 
                        ibinyabiziga, gukora serivisi, n'ikoranabuhanga ry'ibinyabiziga bigezweho. Abanyeshuri biga uburyo bwo gusana moteri 
                        (engines) - moteri za petrol, diesel, hybrid, n'electric motors. Biga kandi gusana electrical systems - batteries, 
                        alternators, starters, wiring, n'ibindi bintu by'amashanyarazi mu binyabiziga. Muri ubu burezi, abanyeshuri bamenya 
                        gusana brakes (freni), suspension systems (amajosi), steering systems (steering), transmission (gearbox), n'ibindi bintu 
                        by'ibinyabiziga. Biga kandi gukoresha ibikoresho byo gusana nka diagnostic tools (ibikoresho byo gusuzuma), scan tools, 
                        multimeters, oscilloscopes, n'ibindi. Porogaramu yacu yita cyane ku koranabuhanga rigezweho rya hybrid vehicles 
                        (ibinyabiziga bya hybrid) na electric vehicles (ibinyabiziga by'amashanyarazi), kuko ari byo bizaza. Biga kandi uburyo 
                        bwo gukora serivisi y'ibinyabiziga, guhindura amavuta (oil change), gusuzuma ibinyabiziga (vehicle inspection), n'ibindi. 
                        Porogaramu yacu itanga amahugurwa yuzuye akurikije ibipimo mpuzamahanga, ikaba ifite abarimu b'inzobere bafite uburambe 
                        bwinshi mu koranabuhanga ry'ibinyabiziga. Nyuma y'amahugurwa, abanyeshuri bashobora gukora mu magaraje (garages), mu nganda 
                        z'ibinyabiziga (automotive companies) nka Toyota, Volkswagen, Mercedes-Benz, n'ibindi, cyangwa bakongera kwiga muri kaminuza. 
                        Amahirwe y'akazi ni menshi cyane kuko ibinyabiziga birakenewe cyane kandi bikeneye abantu bazi kubisana no kubikora serivisi.
                      </>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="text-2xl font-bold text-green-600">{trade.statistics.students}+</div>
                    <div className="text-xs text-gray-600">Abanyeshuri</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="text-2xl font-bold text-yellow-600">{trade.statistics.successRate}%</div>
                    <div className="text-xs text-gray-600">Intsinzi</div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-green-600 to-yellow-600 hover:opacity-90 text-white font-semibold py-6 text-lg shadow-lg">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Reba Amakuru Yuzuye
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Ireme ry'Uburezi - Educational Philosophy Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border-2 border-green-100"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Ireme ry'Uburezi mu Myuga Yacu - Iterambere ry'Ubushobozi bw'Abanyeshuri
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Uburezi bw'ikoranabuhanga bugamije guteza imbere ubushobozi bw'abanyeshuri mu bijyanye n'umwuga, 
              kubategura gukora imirimo ikomeye mu nganda, no kubafasha kuba inzobere mu myuga yabo. Dufite porogaramu 
              zuzuye z'amahugurwa akurikije ibipimo mpuzamahanga, abarimu b'inzobere, n'ibikoresho bigezweho.
            </p>
          </div>

          {/* Enhanced Trade Cards with More Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {trades.map((trade, index) => {
              const isSOD = trade.code === 'SOD';
              const isBDC = trade.code === 'BDC';
              const isAUTO = trade.code === 'AUTO';
              
              return (
                <motion.div
                  key={trade.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-gradient-to-br from-green-50 via-yellow-50 to-lime-50 rounded-3xl p-8 border-2 border-green-200 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  onClick={() => setSelectedTradeCode(trade.code)}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-r from-green-600 to-yellow-600 rounded-2xl shadow-lg">
                      <trade.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <Badge className="mb-2 bg-gradient-to-r from-green-600 to-yellow-600 text-white">
                        {trade.code}
                      </Badge>
                      <h3 className="text-2xl font-bold text-gray-900">{trade.title}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {isSOD && (
                        <>
                          Iterambere rya Software ni umwuga ukomeye ugamije guteza imbere abanyeshuri bafite ubushobozi bwo gukora 
                          porogaramu z'urubuga, porogaramu z'itelifone, imikino, n'ibindi bikoresho bya software. Abanyeshuri biga 
                          ururimi rw'ikoranabuhanga nka JavaScript, Python, React, Node.js, n'ibindi byinshi. Biga kandi uburyo bwo 
                          gukora database, API, cloud computing, cybersecurity, n'ikoranabuhanga rigezweho rya AI/ML. Porogaramu yacu 
                          itanga amahugurwa yuzuye akurikije ibipimo mpuzamahanga, ikaba ifite abarimu b'inzobere bafite uburambe 
                          bwinshi mu iterambere rya software. Nyuma y'amahugurwa, abanyeshuri bashobora gukora nk'abakora software, 
                          web developers, mobile app developers, game developers, cyangwa bakongera kwiga muri kaminuza.
                        </>
                      )}
                      {isBDC && (
                        <>
                          Ubwubatsi n'Inyubako ni umwuga ukomeye ugamije guteza imbere abanyeshuri bafite ubushobozi bwo kubaka amazu, 
                          inzira, amazu y'ubucuruzi, n'ibindi bintu by'ubwubatsi. Abanyeshuri biga uburyo bwo gushushanya amazu, 
                          gukoresha ibikoresho by'ubwubatsi, gupima, n'ibindi bintu by'ingenzi by'ubwubatsi. Biga kandi uburyo bwo 
                          gukora imishinga y'ubwubatsi, gucunga abantu, n'ibikoresho. Porogaramu yacu itanga amahugurwa yuzuye 
                          akurikije ibipimo mpuzamahanga, ikaba ifite abarimu b'inzobere bafite uburambe bwinshi mu bwubatsi. 
                          Nyuma y'amahugurwa, abanyeshuri bashobora gukora nk'abubatsi, abashushanya, abacunga imishinga, cyangwa 
                          bakongera kwiga muri kaminuza.
                        </>
                      )}
                      {isAUTO && (
                        <>
                          Ikoranabuhanga ry'Ibinyabiziga ni umwuga ukomeye ugamije guteza imbere abanyeshuri bafite ubushobozi bwo 
                          gusana ibinyabiziga, gukora serivisi, n'ikoranabuhanga ry'ibinyabiziga bigezweho. Abanyeshuri biga uburyo 
                          bwo gusana moteri, gearbox, brakes, electrical systems, n'ibindi bintu by'ibinyabiziga. Biga kandi uburyo 
                          bwo gukoresha ibikoresho byo gusana, diagnostics, n'ikoranabuhanga rigezweho rya hybrid na electric vehicles. 
                          Porogaramu yacu itanga amahugurwa yuzuye akurikije ibipimo mpuzamahanga, ikaba ifite abarimu b'inzobere 
                          bafite uburambe bwinshi mu koranabuhanga ry'ibinyabiziga. Nyuma y'amahugurwa, abanyeshuri bashobora gukora 
                          mu magaraje, mu nganda z'ibinyabiziga, cyangwa bakongera kwiga muri kaminuza.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                      Ibintu by'Ingenzi:
                    </h4>
                    {isSOD && [
                      'Kwiga ururimi rw\'ikoranabuhanga: JavaScript, Python, Java, C++, React, Node.js',
                      'Gukora porogaramu z\'urubuga (websites) n\'imbuga nkoranyambaga (web apps)',
                      'Gukora porogaramu z\'itelifone (mobile apps) kuri Android na iOS',
                      'Kwiga database: MySQL, MongoDB, PostgreSQL, Firebase',
                      'Cloud Computing: AWS, Azure, Google Cloud, Docker, Kubernetes',
                      'Cybersecurity: Umutekano wa data, encryption, authentication',
                      'AI/ML: Artificial Intelligence, Machine Learning, Data Science',
                      'Imyitozo mu nganda: Google, Microsoft, Amazon, n\'ibindi'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{item}</p>
                      </div>
                    ))}
                    {isBDC && [
                      'Gushushanya amazu n\'ibindi bintu by\'ubwubatsi (AutoCAD, Revit)',
                      'Gukoresha ibikoresho by\'ubwubatsi: mashini, ibikoresho byo gupima',
                      'Kwiga uburyo bwo kubaka amazu, inzira, n\'ibindi bintu',
                      'Gucunga imishinga y\'ubwubatsi: abantu, ibikoresho, amafaranga',
                      'Kwiga ibipimo by\'ubwubatsi: umutekano, ubwiza, n\'uburambe',
                      'Imyitozo mu nganda: amasosiyete y\'ubwubatsi, ibigo by\'ubwubatsi',
                      'Impamyabumenyi z\'ubwubatsi: certificates, diplomas, degrees'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{item}</p>
                      </div>
                    ))}
                    {isAUTO && [
                      'Gusana moteri: petrol, diesel, hybrid, electric motors',
                      'Gusana electrical systems: batteries, alternators, starters',
                      'Gusana brakes, suspension, steering systems',
                      'Diagnostics: gukoresha ibikoresho byo gusuzuma ibinyabiziga',
                      'Hybrid & Electric Vehicles: ikoranabuhanga rigezweho',
                      'Imyitozo mu nganda: Toyota, Volkswagen, n\'ibindi',
                      'Impamyabumenyi: ASE, NATEF, manufacturer certifications'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <div className="text-2xl font-bold text-green-600">{trade.statistics.students}+</div>
                      <div className="text-xs text-gray-600">Abanyeshuri</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <div className="text-2xl font-bold text-yellow-600">{trade.statistics.successRate}%</div>
                      <div className="text-xs text-gray-600">Intsinzi</div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-green-600 to-yellow-600 hover:opacity-90 text-white font-semibold py-6 text-lg shadow-lg">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Reba Amakuru Yuzuye
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-gradient-to-r from-green-100 to-yellow-100 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-green-600" />
                Intego z'Uburezi bw'Ikoranabuhanga
              </h3>
              <p className="text-gray-800 leading-relaxed mb-4">
                Ishuri ryacu rifite intego yo guteza imbere abanyeshuri bafite ubushobozi bwo gukora imirimo itandukanye mu nganda. 
                Tubafasha kumenya ikoranabuhanga rigezweho, tubabigisha uburyo bwo gukemura ibibazo, kandi tubategura kugira uruhare 
                mu iterambere ry'igihugu. Uburezi bwacu bushingiye ku mahugurwa y'umwuga akurikije ibipimo mpuzamahanga, 
                bukaba bufite ibice bitatu by'ingenzi: amahugurwa mu ishuri, imyitozo mu nganda, n'isuzuma ry'ubushobozi.
              </p>
              <p className="text-gray-800 leading-relaxed mb-4">
                Mu myuga yacu yose, abanyeshuri biga amasomo menshi ajyanye n'umwuga wabo. Muri Software Development (SOD), 
                biga gukora porogaramu z'urubuga, porogaramu z'itelifone, n'imikino. Muri Building and Construction (BDC), 
                biga kubaka amazu, kubaka inzira, n'ibindi bintu by'ubwubatsi. Muri Automotive Technology (AUTO), 
                biga gusana ibinyabiziga, gukora serivisi, n'ikoranabuhanga ry'ibinyabiziga bigezweho.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Inzego z'Amahugurwa
                </h4>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Porogaramu zacu zigizwe n'inzego eshatu: Urwego rwa 3 (L3), Urwego rwa 4 (L4), n'Urwego rwa 5 (L5). 
                  Buri rwego rufite amasomo yihariye kandi rukaba rufite igihe runaka cyo kwigiramo. Urwego rwa 3 ni urwo 
                  shingiro aho abanyeshuri biga ibintu by'ibanze by'umwuga wabo. Urwego rwa 4 ni urwo hagati aho biga ibintu 
                  birambuye kandi bigoye. Urwego rwa 5 ni urwo hejuru aho biga ibintu by'umwuga bihanitse kandi bakamenya 
                  gukora imirimo ikomeye mu nganda.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Muri buri rwego, abanyeshuri bakora imyitozo myinshi mu mashuri yacu afite ibikoresho bigezweho. 
                  Bakora imishinga itandukanye, bakamenya gukora mu itsinda, kandi bakamenya gukemura ibibazo. 
                  Nyuma y'amahugurwa mu ishuri, bajya mu nganda gukora imyitozo ifatika aho bamenya uburyo inganda zikora.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-yellow-200 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-600" />
                  Abarimu n'Abafasha
                </h4>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Ishuri ryacu rifite abarimu b'inzobere bafite uburambe bwinshi mu myuga yabo. Abarimu bacu bize muri kaminuza 
                  nziza kandi bafite impamyabumenyi z'umwuga. Benshi muri bo bakoze mu nganda imyaka myinshi mbere yo kuza kwigisha, 
                  bituma bafite ubumenyi bufatika bwo gushyira mu bikorwa. Abarimu bacu bafasha abanyeshuri kumenya ibintu byose 
                  bijyanye n'umwuga wabo, bakabafasha no mu bibazo by'ubuzima n'imibereho.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Usibye abarimu, dufite n'abafasha batandukanye bafasha abanyeshuri mu bintu bitandukanye. Dufite abafasha 
                  mu mashuri y'ikoranabuhanga, abafasha mu bitabo, n'abafasha mu kubungabunga umutekano. Abanyeshuri bacu 
                  bafite uburenganzira bwo kubaza ibibazo byose kandi bakahabwa igisubizo cyiza.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-green-100 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-yellow-600" />
                Ibikoresho n'Ikoranabuhanga
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ishuri ryacu rifite ibikoresho bigezweho byose bikenewe mu mahugurwa y'umwuga. Dufite amashuri y'ikoranabuhanga 
                afite mudasobwa zigezweho, ibikoresho by'ubwubatsi, n'ibikoresho byo gusana ibinyabiziga. Abanyeshuri bacu 
                bakoresha ibikoresho nk'ibyo bakoreshwa mu nganda, bituma bategerezwa neza akazi.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-300">
                  <h5 className="font-semibold text-gray-900 mb-2">Software Development</h5>
                  <p className="text-sm text-gray-700">
                    Mudasobwa zigezweho, porogaramu z'iterambere, ikoranabuhanga rya Cloud, n'ibindi bikoresho by'iterambere rya software.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-yellow-300">
                  <h5 className="font-semibold text-gray-900 mb-2">Building & Construction</h5>
                  <p className="text-sm text-gray-700">
                    Ibikoresho by'ubwubatsi, mashini zo kubaka, ibikoresho byo gupima, n'ibindi bikoresho by'ubwubatsi.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-300">
                  <h5 className="font-semibold text-gray-900 mb-2">Automotive Technology</h5>
                  <p className="text-sm text-gray-700">
                    Ibikoresho byo gusana ibinyabiziga, mashini zo gukora serivisi, ikoranabuhanga rya diagnostics, n'ibindi.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-lg mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-green-600" />
                Imyitozo mu Nganda n'Amahirwe y'Akazi
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Porogaramu zacu zose zirimo imyitozo mu nganda aho abanyeshuri bajya gukora imirimo ifatika. Dufite ubufatanye 
                n'inganda nyinshi mu Rwanda no mu mahanga zihabwa abanyeshuri amahirwe yo kujya gukora imyitozo. Iyi myitozo 
                ifasha abanyeshuri kumenya uburyo inganda zikora, bakamenya gukora mu itsinda, kandi bakamenya gukemura ibibazo 
                bifatika. Nyuma y'imyitozo, abanyeshuri benshi bahabwa akazi mu nganda aho bakoze imyitozo.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ishuri ryacu rifite ikigo gishinzwe gufasha abanyeshuri kubona akazi. Iki kigo gifasha abanyeshuri gukora CV, 
                gukora ikiganiro cy'akazi, no kubona amakuru y'akazi. Dufite kandi urutonde rw'inganda zifitanye isano n'ishuri 
                ryacu kandi zikeneye abakozi bafite ubushobozi. Abanyeshuri bacu barangije amahugurwa bafite amahirwe menshi yo 
                kubona akazi keza mu nganda zitandukanye.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Imyitozo mu Nganda</h5>
                    <p className="text-sm text-gray-700">
                      Abanyeshuri bakora imyitozo mu nganda iminsi 90 kugeza 180 buri mwaka, aho bamenya gukora imirimo ifatika.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Amahirwe y'Akazi</h5>
                    <p className="text-sm text-gray-700">
                      88% by'abanyeshuri bacu barangije amahugurwa babona akazi mu gihe cy'amezi 6 nyuma yo kurangiza.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-8 border-2 border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Rocket className="w-6 h-6 text-green-600" />
                Ejo Hazaza bw'Abanyeshuri Bacu
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Abanyeshuri bacu barangije amahugurwa bafite ubushobozi bwo gukora imirimo itandukanye mu nganda. Bafite 
                ubumenyi bufatika, bafite ubushobozi bwo gukemura ibibazo, kandi bafite imyifatire myiza yo gukora. Benshi 
                muri bo bakora mu nganda nziza, abandi bakora imirimo yabo, abandi bakajya gukomeza kwiga muri kaminuza.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ishuri ryacu rifite abanyeshuri benshi barangije amahugurwa kandi bakaba bakora imirimo nziza. Benshi muri bo 
                ni inzobere mu myuga yabo, abandi ni ba manager mu nganda, abandi ni ba entrepreneur bafite ibigo byabo. 
                Dushimira cyane abanyeshuri bacu kandi turabafasha mu bintu byose bakeneye.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Niba ushaka kuba umwe mu banyeshuri bacu, ushobora kuzuza ifishi yo kwiyandikisha cyangwa ukaduhamagara. 
                Tuzakwakira neza kandi tukazakwereka ibintu byose bijyanye n'amahugurwa yacu. Turakwifuriza amahirwe!
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Search Indicator */}
        {hasActiveSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-100 to-yellow-100 rounded-xl p-4 mb-6 border-2 border-green-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-600 to-yellow-600 rounded-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {searchResultsCount} {searchResultsCount === 1 ? 'Umwuga wabonetse' : 'Imyuga yabonetse'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {searchTerm && `Ushakisha: "${searchTerm}"`}
                    {searchTerm && selectedCategory !== 'All' && ' • '}
                    {selectedCategory !== 'All' && `Icyiciro: ${selectedCategory}`}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setShowSearchResults(false);
                }}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Siba
              </Button>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4 justify-end">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-4 py-2"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-4 py-2"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Trades Grid/List */}
        <motion.div
          layout
          className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}
        >
          <AnimatePresence mode="wait">
            {filteredTrades.map((trade) => (
              <motion.div
                key={trade.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`group cursor-pointer ${
                  viewMode === 'list' ? 'lg:flex lg:items-center lg:space-x-6' : ''
                }`}
                onClick={() => setSelectedTradeCode(trade.code)}
              >
                <Card className="h-full border-2 border-transparent hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'lg:w-80 lg:flex-shrink-0' : ''
                  }`}>
                    <div className="aspect-video relative">
                      <ImageWithFallback
                        src={trade.image}
                        alt={trade.title}
                        className="w-full h-full object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-gray-800 hover:bg-white">
                          <trade.icon className="w-4 h-4 mr-2" />
                          {trade.code}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <div className="flex items-center text-white text-sm">
                          <Users className="w-4 h-4 mr-1" />
                          {trade.statistics.students} Abanyeshuri
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {trade.title}
                      </h3>
                      <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all ml-2" />
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {trade.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {trade.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {trade.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{trade.features.length - 3} ibindi
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {trade.statistics.successRate}%
                          </div>
                          <div className="text-xs text-gray-600">Intsinzi</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">
                            {trade.statistics.employmentRate}%
                          </div>
                          <div className="text-xs text-gray-600">Akazi</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredTrades.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nta myuga yabonetse</h3>
            <p className="text-gray-500">Gerageza guhindura ibyo ushakisha cyangwa muyunguruzi</p>
          </motion.div>
        )}
      </div>

      {/* Trade Detail Modal */}
      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        {selectedTrade && (
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
            <div className="relative">
              <div className="aspect-video relative">
                <ImageWithFallback
                  src={selectedTrade.image}
                  alt={selectedTrade.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <selectedTrade.icon className="w-8 h-8" />
                    <Badge className="bg-white/20 text-white hover:bg-white/30">
                      {selectedTrade.code}
                    </Badge>
                  </div>
                  <h2 className="text-4xl font-bold mb-2">{selectedTrade.title}</h2>
                  <p className="text-xl text-gray-200 max-w-2xl">
                    {selectedTrade.description}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedTrade(null)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="tools">Tools & Tech</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                    <TabsTrigger value="instructors">Instructors</TabsTrigger>
                    <TabsTrigger value="careers">Careers</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5" />
                              Program Levels
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {selectedTrade.levels.map((level, index) => (
                              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-lg">{level.level}</h4>
                                  <Badge variant="outline">{level.duration}</Badge>
                                </div>
                                <p className="text-gray-600 mb-3">{level.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {level.modules.map((module, moduleIndex) => (
                                    <Badge key={moduleIndex} variant="secondary" className="text-xs">
                                      {module}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Award className="w-5 h-5" />
                              Program Features
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {selectedTrade.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="text-gray-700">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="w-5 h-5" />
                              Program Statistics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div 
                              className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => setActiveStatistic(activeStatistic === 'students' ? null : 'students')}
                            >
                              <div className="text-3xl font-bold text-blue-600">
                                {selectedTrade.statistics.students}
                              </div>
                              <div className="text-sm text-gray-600">Current Students</div>
                            </div>
                            <div 
                              className="text-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                              onClick={() => setActiveStatistic(activeStatistic === 'success' ? null : 'success')}
                            >
                              <div className="text-3xl font-bold text-green-600">
                                {selectedTrade.statistics.successRate}%
                              </div>
                              <div className="text-sm text-gray-600">Success Rate</div>
                            </div>
                            <div 
                              className="text-center p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                              onClick={() => setActiveStatistic(activeStatistic === 'graduation' ? null : 'graduation')}
                            >
                              <div className="text-3xl font-bold text-purple-600">
                                {selectedTrade.statistics.graduationRate}%
                              </div>
                              <div className="text-sm text-gray-600">Graduation Rate</div>
                            </div>
                            <div 
                              className="text-center p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                              onClick={() => setActiveStatistic(activeStatistic === 'employment' ? null : 'employment')}
                            >
                              <div className="text-3xl font-bold text-orange-600">
                                {selectedTrade.statistics.employmentRate}%
                              </div>
                              <div className="text-sm text-gray-600">Employment Rate</div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="w-5 h-5" />
                              Workshops
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedTrade.workshops.map((workshop, index) => (
                              <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <h5 className="font-semibold text-sm mb-1">{workshop.name}</h5>
                                <p className="text-xs text-gray-600 mb-2">{workshop.description}</p>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{workshop.duration}</span>
                                  <span>{workshop.capacity} students</span>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="curriculum" className="space-y-6">
                    <div className="space-y-6">
                      {selectedTrade.levels.map((level: any, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{level.level} - {level.code}</span>
                              <Badge variant="outline">{level.duration}</Badge>
                            </CardTitle>
                            <CardDescription>{level.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {level.hasClasses && (
                              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <h6 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Classes: {level.classes.join(' & ')}
                                </h6>
                                <p className="text-xs text-gray-600">
                                  Students study the same courses but in different class sections
                                </p>
                              </div>
                            )}
                            <div>
                              <h6 className="font-semibold mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Core Courses ({level.courses.length}):
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {level.courses.map((course: any, courseIndex: number) => (
                                  <div key={courseIndex} className="flex items-start gap-2 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-medium block">{course.name}</span>
                                      <span className="text-xs text-gray-500">{course.code}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tools" className="space-y-6">
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Button
                        variant={toolFilter === 'All' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setToolFilter('All')}
                      >
                        All Tools
                      </Button>
                      {toolCategories.map((category) => (
                        <Button
                          key={category}
                          variant={toolFilter === category ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setToolFilter(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence mode="wait">
                        {filteredTools.map((tool, index) => (
                          <motion.div
                            key={`${tool.name}-${toolFilter}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1 }}
                            onMouseEnter={() => setHoveredTool(tool.name)}
                            onMouseLeave={() => setHoveredTool(null)}
                            className="group cursor-pointer"
                          >
                            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                              <div className="aspect-video relative overflow-hidden">
                                <ImageWithFallback
                                  src={tool.image}
                                  alt={tool.name}
                                  className="w-full h-full object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="absolute bottom-2 left-2">
                                  <Badge className="bg-white/90 text-gray-800">
                                    <tool.icon className="w-3 h-3 mr-1" />
                                    {tool.category}
                                  </Badge>
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                  {tool.name}
                                </h4>
                                <p className="text-gray-600 text-sm">
                                  {tool.description}
                                </p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </TabsContent>

                  <TabsContent value="gallery" className="space-y-6">
                    {(() => {
                      const currentGallery = tradeGalleries[selectedTrade.code] || [];
                      const categories = Array.from(new Set(currentGallery.map(item => item.category)));
                      const filtered = galleryFilter === 'All' 
                        ? currentGallery 
                        : currentGallery.filter(item => item.category === galleryFilter);
                      
                      return (
                        <>
                          <div className="flex flex-wrap gap-2 mb-6">
                            <Button
                              variant={galleryFilter === 'All' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setGalleryFilter('All')}
                            >
                              Ifoto Zose ({currentGallery.length})
                            </Button>
                            {categories.map((category) => {
                              const count = currentGallery.filter(item => item.category === category).length;
                              return (
                                <Button
                                  key={category}
                                  variant={galleryFilter === category ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setGalleryFilter(category)}
                                >
                                  {category} ({count})
                                </Button>
                              );
                            })}
                          </div>

                          {loadingGallery ? (
                            <div className="text-center py-12">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                              <p className="text-gray-600">Iratunganya ifoto...</p>
                            </div>
                          ) : filtered.length === 0 ? (
                            <div className="text-center py-12">
                              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-600 font-medium">Nta foto ihari</p>
                              <p className="text-sm text-gray-500 mt-1">Shyiramo ifoto mu bwoko bw'ibikoresho</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <AnimatePresence mode="wait">
                                {filtered.map((item, index) => (
                                  <motion.div
                                    key={`${item.url}-${galleryFilter}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group cursor-pointer relative"
                                    onClick={() => setSelectedGalleryImage(`http://localhost:5000${item.url}`)}
                                  >
                                    <div className="aspect-square relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-green-400 transition-colors">
                                      <ImageWithFallback
                                        src={`http://localhost:5000${item.url}`}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <h4 className="font-semibold mb-1 text-sm">{item.title}</h4>
                                        <p className="text-xs text-gray-200">{item.category}</p>
                                      </div>
                                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-white/90 rounded-full p-2">
                                          <ZoomIn className="w-5 h-5 text-gray-800" />
                                        </div>
                                      </div>
                                      <div className="absolute top-4 left-4">
                                        <Badge className="bg-gradient-to-r from-green-600 to-yellow-600 text-white border-0">
                                          {item.category}
                                        </Badge>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </TabsContent>

                  <TabsContent value="instructors" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedTrade.instructors.map((instructor, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-16 h-16">
                                <AvatarImage src={instructor.image} alt={instructor.name} />
                                <AvatarFallback className="text-lg">
                                  {instructor.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg mb-1">{instructor.name}</h4>
                                <p className="text-gray-600 mb-2">{instructor.role}</p>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{instructor.experience} experience</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{instructor.specialization}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{instructor.email}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="careers" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedTrade.careerPaths.map((career, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-blue-600" />
                              {career.title}
                            </CardTitle>
                            <CardDescription>{career.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm text-gray-600">Average Salary</span>
                                <span className="font-semibold text-green-600">{career.averageSalary}</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm text-gray-600">Growth Rate</span>
                                <span className="font-semibold text-blue-600">{career.growthRate}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Gallery Modal */}
      <Dialog open={!!selectedGalleryImage} onOpenChange={() => setSelectedGalleryImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedGalleryImage && (
            <div className="relative">
              <ImageWithFallback
                src={selectedGalleryImage}
                alt="Gallery Image"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <Button
                onClick={() => setSelectedGalleryImage(null)}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white bg-black/20 hover:bg-black/40"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradesPage;