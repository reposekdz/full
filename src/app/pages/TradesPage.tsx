import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

const TradesPage: React.FC = () => {
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

  // Load trades data from database
  useEffect(() => {
    const loadTrades = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/trades');
        const data = await response.json();
        if (data.success && data.trades) {
          const enhancedTrades = data.trades.map((trade: any) => ({
            id: trade.code.toLowerCase(),
            title: trade.name,
            code: trade.code,
            icon: getTradeIcon(trade.code),
            image: trade.image_url || `https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=1080`,
            description: trade.description_en || trade.description_rw,
            features: trade.requirements_en ? trade.requirements_en.split(',').map((r: string) => r.trim()) : ['Professional Training', 'Industry Standards', 'Practical Skills'],
            levels: generateTradeLevels(trade),
            tools: generateTradeTools(trade.code),
            gallery: generateTradeGallery(trade.code),
            workshops: generateTradeWorkshops(trade.code),
            instructors: generateTradeInstructors(trade.code),
            careerPaths: generateCareerPaths(trade.code),
            statistics: {
              students: trade.student_count || 0,
              successRate: 95,
              graduationRate: 92,
              employmentRate: 88
            }
          }));
          setTrades(enhancedTrades);
        } else {
          setTrades(mockTrades);
        }
      } catch (error) {
        console.error('Error loading trades:', error);
        setTrades(mockTrades);
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Helper functions for generating trade data
  const getTradeIcon = (code: string) => {
    const icons: { [key: string]: any } = {
      'SOD': Code,
      'BDC': HardHat,
      'AUTO': Wrench
    };
    return icons[code] || Code;
  };

  const generateTradeLevels = (trade: any) => {
    const duration = trade.duration_months || 24;
    const levels = [];
    
    if (duration >= 12) {
      levels.push({
        level: `Level 3 ${trade.code}`,
        duration: '1 Year',
        description: `Foundation level training in ${trade.title.toLowerCase()}`,
        modules: generateModules(trade.code, 3)
      });
    }
    
    if (duration >= 24) {
      levels.push({
        level: `Level 4 ${trade.code}`,
        duration: '1 Year',
        description: `Advanced training in ${trade.title.toLowerCase()}`,
        modules: generateModules(trade.code, 4)
      });
    }
    
    return levels;
  };

  const generateModules = (code: string, level: number) => {
    const moduleMap: { [key: string]: { [key: number]: string[] } } = {
      'SOD': {
        3: ['HTML/CSS/JavaScript', 'Python Programming', 'Database Fundamentals', 'Git Version Control', 'Problem Solving'],
        4: ['React & Vue.js', 'Node.js & Express', 'SQL & NoSQL Databases', 'API Development', 'Mobile App Development']
      },
      'BDC': {
        3: ['Construction Basics', 'Building Materials', 'Safety Protocols', 'Technical Drawing', 'Site Preparation'],
        4: ['Advanced Construction', 'Project Management', 'Structural Design', 'Quality Control', 'Sustainable Building']
      },
      'AUTO': {
        3: ['Engine Fundamentals', 'Electrical Systems', 'Basic Diagnostics', 'Vehicle Maintenance', 'Safety Procedures'],
        4: ['Advanced Diagnostics', 'Hybrid Technology', 'Electronic Systems', 'Engine Performance', 'Workshop Management']
      }
    };
    
    return moduleMap[code]?.[level] || ['Professional Training', 'Technical Skills', 'Industry Standards', 'Practical Application', 'Career Preparation'];
  };

  const generateTradeTools = (code: string) => {
    const toolsMap: { [key: string]: any[] } = {
      'SOD': [
        { name: 'Visual Studio Code', icon: Code, description: 'Modern code editor with intelligent features', image: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=300', category: 'Development Tools' },
        { name: 'React', icon: Code, description: 'Popular JavaScript library for building user interfaces', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300', category: 'Frameworks' },
        { name: 'Node.js', icon: Laptop, description: 'JavaScript runtime for server-side development', image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300', category: 'Backend' },
        { name: 'Git', icon: Settings, description: 'Version control system for tracking code changes', image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=300', category: 'Development Tools' }
      ],
      'BDC': [
        { name: 'AutoCAD', icon: Building, description: 'Computer-aided design software for construction', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300', category: 'Design Software' },
        { name: 'Construction Tools', icon: HardHat, description: 'Professional construction equipment and tools', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300', category: 'Hand Tools' },
        { name: 'Safety Equipment', icon: Shield, description: 'Personal protective equipment for construction sites', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300', category: 'Safety' },
        { name: 'Measuring Tools', icon: Target, description: 'Precision measuring instruments for construction', image: 'https://images.unsplash.com/photo-1609205925242-9cba5b19c9a7?w=300', category: 'Measurement' }
      ],
      'AUTO': [
        { name: 'Diagnostic Scanner', icon: Wrench, description: 'Advanced automotive diagnostic equipment', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300', category: 'Diagnostics' },
        { name: 'Workshop Tools', icon: Settings, description: 'Professional automotive repair tools', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300', category: 'Hand Tools' },
        { name: 'Lift Equipment', icon: TrendingUp, description: 'Hydraulic lifts and garage equipment', image: 'https://images.unsplash.com/photo-1609069985744-95be8e1c1d8b?w=300', category: 'Equipment' },
        { name: 'Testing Equipment', icon: BarChart3, description: 'Electronic testing and measurement tools', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300', category: 'Testing' }
      ]
    };

    return toolsMap[code] || [];
  };

  const generateTradeGallery = (code: string) => {
    const galleryMap: { [key: string]: any[] } = {
      'SOD': [
        { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', title: 'Students learning web development', category: 'Classroom', description: 'Students working on modern web development projects' },
        { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', title: 'Programming workspace', category: 'Workspace', description: 'Modern programming workspace with multiple monitors' },
        { url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800', title: 'Code development', category: 'Projects', description: 'Students working on real-world coding projects' },
        { url: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800', title: 'Mobile app development', category: 'Projects', description: 'Creating mobile applications with modern frameworks' }
      ],
      'BDC': [
        { url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800', title: 'Construction workshop', category: 'Workshop', description: 'Hands-on construction training facility' },
        { url: 'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800', title: 'Building techniques', category: 'Training', description: 'Learning modern construction techniques' },
        { url: 'https://images.unsplash.com/photo-1590845947426-c4a88c96a048?w=800', title: 'Site work', category: 'Practical', description: 'Real construction site experience' },
        { url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', title: 'Safety training', category: 'Safety', description: 'Construction safety protocols and training' }
      ],
      'AUTO': [
        { url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800', title: 'Automotive workshop', category: 'Workshop', description: 'Modern automotive repair facility' },
        { url: 'https://images.unsplash.com/photo-1615906841282-a2b0c5845a61?w=800', title: 'Engine diagnostics', category: 'Training', description: 'Learning advanced engine diagnostic techniques' },
        { url: 'https://images.unsplash.com/photo-1589734760604-86cc61f96ddb?w=800', title: 'Student practice', category: 'Practical', description: 'Students practicing automotive repair skills' },
        { url: 'https://images.unsplash.com/photo-1609069985744-95be8e1c1d8b?w=800', title: 'Modern equipment', category: 'Equipment', description: 'State-of-the-art automotive equipment' }
      ]
    };

    return galleryMap[code] || [];
  };

  const generateTradeWorkshops = (code: string) => {
    // Generate workshop data based on trade
    return [
      { name: `${code} Fundamentals`, description: 'Introduction to basic concepts and techniques', duration: '2 weeks', capacity: 25, instructor: 'Professional Instructor', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400' },
      { name: `Advanced ${code}`, description: 'Advanced techniques and industry practices', duration: '3 weeks', capacity: 20, instructor: 'Senior Instructor', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400' }
    ];
  };

  const generateTradeInstructors = (code: string) => {
    return [
      { name: 'John Mugisha', role: 'Senior Instructor', experience: '15 years', specialization: `${code} Expert`, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', email: 'j.mugisha@school.rw' },
      { name: 'Marie Uwimana', role: 'Assistant Instructor', experience: '8 years', specialization: `${code} Specialist`, image: 'https://images.unsplash.com/photo-1494790108755-2616b612b134?w=150', email: 'm.uwimana@school.rw' }
    ];
  };

  const generateCareerPaths = (code: string) => {
    const careerMap: { [key: string]: any[] } = {
      'SOD': [
        { title: 'Full Stack Developer', description: 'Build complete web applications', averageSalary: '$50,000+', growthRate: '+15%' },
        { title: 'Mobile App Developer', description: 'Create mobile applications', averageSalary: '$55,000+', growthRate: '+18%' },
        { title: 'Software Engineer', description: 'Design and develop software systems', averageSalary: '$65,000+', growthRate: '+12%' }
      ],
      'BDC': [
        { title: 'Construction Manager', description: 'Oversee construction projects', averageSalary: '$45,000+', growthRate: '+10%' },
        { title: 'Site Supervisor', description: 'Manage construction sites', averageSalary: '$40,000+', growthRate: '+8%' },
        { title: 'Building Inspector', description: 'Ensure construction quality', averageSalary: '$42,000+', growthRate: '+7%' }
      ],
      'AUTO': [
        { title: 'Automotive Technician', description: 'Diagnose and repair vehicles', averageSalary: '$38,000+', growthRate: '+9%' },
        { title: 'Service Manager', description: 'Manage automotive service departments', averageSalary: '$48,000+', growthRate: '+6%' },
        { title: 'Auto Shop Owner', description: 'Run your own automotive business', averageSalary: '$55,000+', growthRate: '+12%' }
      ]
    };

    return careerMap[code] || [];
  };

  // Mock data as fallback
  const mockTrades: Trade[] = [
    {
      id: 'sod',
      title: 'Software Development',
      code: 'SOD',
      icon: Code,
      image: 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc2ODcxODI3MXww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Master the art of software development with cutting-edge technologies, real-world projects, and industry-standard practices.',
      features: ['Modern Programming Languages', 'Full-Stack Development', 'Mobile App Development', 'Database Management', 'Industry Projects'],
      levels: [],
      tools: [],
      gallery: [],
      workshops: [],
      instructors: [],
      careerPaths: [],
      statistics: { students: 0, successRate: 95, graduationRate: 92, employmentRate: 88 }
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trades...</p>
        </div>
      </div>
    );
  }

  // Filter functions
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || trade.code === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Our Trades
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover world-class technical programs that prepare you for successful careers in today's dynamic industries
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="text-lg px-6 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Users className="w-5 h-5 mr-2" />
                {trades.reduce((total, trade) => total + trade.statistics.students, 0)}+ Students
              </Badge>
              <Badge className="text-lg px-6 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Trophy className="w-5 h-5 mr-2" />
                95% Success Rate
              </Badge>
              <Badge className="text-lg px-6 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Briefcase className="w-5 h-5 mr-2" />
                Industry Partnerships
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search trades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {trades.map((trade) => (
                    <SelectItem key={trade.code} value={trade.code}>
                      {trade.code} - {trade.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
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
                onClick={() => setSelectedTrade(trade)}
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
                          {trade.statistics.students} Students
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
                            +{trade.features.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {trade.statistics.successRate}%
                          </div>
                          <div className="text-xs text-gray-600">Success Rate</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {trade.statistics.employmentRate}%
                          </div>
                          <div className="text-xs text-gray-600">Employment</div>
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No trades found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {selectedTrade.levels.map((level, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{level.level}</span>
                              <Badge variant="outline">{level.duration}</Badge>
                            </CardTitle>
                            <CardDescription>{level.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <h6 className="font-semibold mb-3">Core Modules:</h6>
                            <div className="space-y-2">
                              {level.modules.map((module, moduleIndex) => (
                                <div key={moduleIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="text-sm">{module}</span>
                                </div>
                              ))}
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
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Button
                        variant={galleryFilter === 'All' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGalleryFilter('All')}
                      >
                        All Photos
                      </Button>
                      {galleryCategories.map((category) => (
                        <Button
                          key={category}
                          variant={galleryFilter === category ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setGalleryFilter(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <AnimatePresence mode="wait">
                        {filteredGallery.map((item, index) => (
                          <motion.div
                            key={`${item.url}-${galleryFilter}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1 }}
                            className="group cursor-pointer relative"
                            onClick={() => setSelectedGalleryImage(item.url)}
                          >
                            <div className="aspect-square relative overflow-hidden rounded-lg">
                              <ImageWithFallback
                                src={item.url}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <h4 className="font-semibold mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-200">{item.description}</p>
                              </div>
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ZoomIn className="w-6 h-6 text-white" />
                              </div>
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-white/90 text-gray-800">
                                  {item.category}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
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