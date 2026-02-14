import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, HardHat, Wrench, ArrowLeft, BookOpen, Users, Trophy, 
  CheckCircle2, Star, Award, Target, Briefcase, Clock, Mail,
  Phone, MapPin, Calendar, TrendingUp, Zap, Sparkles, Rocket,
  GraduationCap, Building, Globe, Shield, Heart, Share2, Download,
  Play, ChevronRight, Eye, ThumbsUp, MessageCircle, Image as ImageIcon,
  ZoomIn, X
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { TradeTeachers } from '@/app/components/trades/TradeTeachers';

interface TradeDetailPageProps {
  tradeCode: string;
  onBack: () => void;
}

const TradeDetailPage: React.FC<TradeDetailPageProps> = React.memo(({ tradeCode, onBack }) => {
  const [trade, setTrade] = useState<any>(null);
  const [tradeData, setTradeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(`trade_${tradeCode}_active_tab`);
    return saved || 'overview';
  });
  const [gallery, setGallery] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const normalizedTradeCode = useMemo(() => tradeCode === 'AUT' ? 'AUTO' : tradeCode, [tradeCode]);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem(`trade_${tradeCode}_active_tab`, activeTab);
  }, [activeTab, tradeCode]);

  useEffect(() => {
    if (normalizedTradeCode === 'AUTO') {
      const heroImageFiles = [
        'IMG-20260128-WA0062.jpg', 'IMG-20260128-WA0067.jpg', 'IMG-20260128-WA0070.jpg',
        'IMG-20260128-WA0076.jpg', 'IMG-20260128-WA0080.jpg', 'IMG-20260128-WA0082.jpg',
        'IMG-20260128-WA0084.jpg', 'IMG-20260128-WA0087.jpg', 'IMG-20260128-WA0092.jpg',
        'IMG-20260128-WA0095.jpg', 'IMG-20260128-WA0101.jpg', 'IMG-20260128-WA0105.jpg',
        'IMG-20260128-WA0110.jpg', 'IMG-20260128-WA0116.jpg', 'IMG-20260128-WA0119.jpg'
      ];
      setHeroImages(heroImageFiles.map(img => `http://localhost:5000/uploads/hero/aut%20hero/${img}`));
    }
  }, [normalizedTradeCode]);

  // Auto-rotate hero images
  useEffect(() => {
    if (heroImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages]);

  useEffect(() => {
    let isMounted = true;
    const loadGallery = async () => {
      try {
        setLoadingGallery(true);
        const response = await fetch(`http://localhost:5000/api/trade-images/gallery/${normalizedTradeCode}`);
        const data = await response.json();
        if (isMounted && data.success && data.gallery) {
          setGallery(data.gallery);
        }
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        if (isMounted) setLoadingGallery(false);
      }
    };
    loadGallery();
    return () => { isMounted = false; };
  }, [normalizedTradeCode]);

  useEffect(() => {
    let isMounted = true;
    const loadTradeDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/trades/all');
        const data = await response.json();
        
        if (!isMounted || !data.success || !data.trades) return;
        
        // Fetch courses for the base trade code
        const coursesResponse = await fetch(`http://localhost:5000/api/trade-courses-api/trade/${normalizedTradeCode}`);
        const coursesData = await coursesResponse.json();
        const allCourses = coursesData.success ? coursesData.courses : [];
        
        const tradeGroups: any = {};
        data.trades.forEach((t: any) => {
          const baseType = t.code.replace(/L[345]/, '');
          if (!tradeGroups[baseType]) {
            const nameRw = baseType === 'SOD' ? 'Iterambere rya Software' : 
                          baseType === 'BDC' ? 'Ubwubatsi n\'Inyubako' : 
                          baseType === 'AUTO' ? 'Ikoranabuhanga ry\'Ibinyabiziga' : t.name;
            tradeGroups[baseType] = {
              baseType,
              name: nameRw,
              description: t.description_rw || t.description,
              levels: [],
              tradeId: t.id
            };
          }
          
          const level = t.code.match(/L[345]/)?.[0] || '';
          if (!level) return; // Skip if no level found
          
          const levelNumber = parseInt(level.replace('L', ''));
          const levelCourses = allCourses.filter((c: any) => c.level_number === levelNumber).map((c: any) => ({
            name: c.course_name,
            code: c.course_code || c.course_name
          }));
          
          console.log(`Level ${levelNumber} (${t.code}): ${levelCourses.length} courses`);
          
          tradeGroups[baseType].levels.push({
            level: `Urwego rwa ${levelNumber}`,
            code: t.code,
            duration: `Imyaka ${t.duration_years || 2}`,
            description: t.description_rw || t.description,
            courses: levelCourses,
            hasClasses: baseType === 'AUTO' && (level === 'L4' || level === 'L5'),
            classes: baseType === 'AUTO' && (level === 'L4' || level === 'L5') ? ['Itsinda A', 'Itsinda B'] : ['Itsinda Rimwe']
          });
        });

        const foundTrade = tradeGroups[normalizedTradeCode];
        if (foundTrade && isMounted) {
          setTrade({
            ...foundTrade,
            icon: getTradeIcon(normalizedTradeCode),
            statistics: {
              students: foundTrade.levels.reduce((sum: number, l: any) => sum + (l.total_students || 0), 0),
              successRate: 95,
              graduationRate: 92,
              employmentRate: 88
            }
          });
          setSelectedLevel(foundTrade.levels[0]);
          
          if (foundTrade.tradeId) {
            const detailResponse = await fetch(`http://localhost:5000/api/trades/${foundTrade.tradeId}`);
            const detailData = await detailResponse.json();
            if (isMounted && detailData.success) {
              setTradeData(detailData);
            }
          }
        }
      } catch (error) {
        console.error('Error loading trade:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTradeDetails();
    return () => { isMounted = false; };
  }, [normalizedTradeCode]);

  const getTradeIcon = useCallback((code: string) => {
    const normalized = code === 'AUT' ? 'AUTO' : code;
    if (normalized === 'SOD') return Code;
    if (normalized === 'BDC') return HardHat;
    if (normalized === 'AUTO') return Wrench;
    return Code;
  }, []);

  const getGradientColors = useCallback((code: string) => {
    const normalized = code === 'AUT' ? 'AUTO' : code;
    if (normalized === 'SOD') return 'from-emerald-500 via-green-400 to-lime-300';
    if (normalized === 'BDC') return 'from-amber-500 via-yellow-400 to-lime-300';
    if (normalized === 'AUTO') return 'from-green-600 via-emerald-500 to-teal-400';
    return 'from-green-600 to-yellow-400';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Tegereza amakuru y'umwuga...</p>
        </div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Umwuga ntubonetse</h2>
          <Button onClick={onBack}>Subira Inyuma</Button>
        </div>
      </div>
    );
  }

  const TradeIcon = trade.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section with Gradient and Image Carousel */}
      <div className={`relative bg-gradient-to-r ${getGradientColors(tradeCode)} text-white overflow-hidden`}>
        {/* Debug info */}
        {(tradeCode === 'AUTO' || tradeCode === 'AUT') && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-xs" style={{ zIndex: 100 }}>
            Hero: {heroImages.length} | Gallery: {gallery.length} | Loading: {loadingGallery ? 'Yes' : 'No'}
          </div>
        )}
        
        {(tradeCode === 'AUTO' || tradeCode === 'AUT') && heroImages.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
              style={{ zIndex: 0 }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImages[currentHeroIndex]})` }}
              />
            </motion.div>
          </AnimatePresence>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 via-teal-900/60 to-cyan-900/70" style={{ zIndex: 1 }}></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" style={{ zIndex: 2 }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" style={{ zIndex: 10 }}>
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Subira ku Myuga
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <TradeIcon className="w-12 h-12" />
              </div>
              <div>
                <Badge className="mb-2 bg-white/20 text-white hover:bg-white/30">
                  {tradeCode}
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold mb-2">
                  {trade.name}
                </h1>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl leading-relaxed">
              {trade.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <Users className="w-8 h-8 mb-2" />
                <div className="text-3xl font-bold">{trade.statistics.students}+</div>
                <div className="text-sm text-white/80">Abanyeshuri</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <Trophy className="w-8 h-8 mb-2" />
                <div className="text-3xl font-bold">{trade.statistics.successRate}%</div>
                <div className="text-sm text-white/80">Igipimo cy'Intsinzi</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <GraduationCap className="w-8 h-8 mb-2" />
                <div className="text-3xl font-bold">{trade.statistics.graduationRate}%</div>
                <div className="text-sm text-white/80">Kurangiza</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <Briefcase className="w-8 h-8 mb-2" />
                <div className="text-3xl font-bold">{trade.statistics.employmentRate}%</div>
                <div className="text-sm text-white/80">Akazi</div>
              </motion.div>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className={`bg-gradient-to-r ${getGradientColors(tradeCode)} text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all`}>
                  <Download className="w-5 h-5 mr-2" />
                  Kuramo Inyandiko
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className={`bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all`}>
                  <Play className="w-5 h-5 mr-2" />
                  Reba Amashusho
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all">
                  <Share2 className="w-5 h-5 mr-2" />
                  Sangiza
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Incamake
            </TabsTrigger>
            <TabsTrigger value="levels" className="text-sm font-medium">
              <BookOpen className="w-4 h-4 mr-2" />
              Inzego n'Amasomo
            </TabsTrigger>
            <TabsTrigger value="instructors" className="text-sm font-medium">
              <Users className="w-4 h-4 mr-2" />
              Abarimu
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-sm font-medium">
              <ImageIcon className="w-4 h-4 mr-2" />
              Amafoto
            </TabsTrigger>
            <TabsTrigger value="careers" className="text-sm font-medium">
              <Rocket className="w-4 h-4 mr-2" />
              Imyuga
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* What We Do Section with Images */}
              <Card className="border-2 border-gray-100 shadow-2xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${getGradientColors(tradeCode)} text-white`}>
                  <CardTitle className="flex items-center gap-3 text-3xl">
                    <Sparkles className="w-8 h-8" />
                    Ibyo Dukora
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    Reba ibikoresho byacu bigezweho n'amahugurwa y'ubuhanga
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {[
                      { title: 'Amahugurwa y\'Ubuhanga', desc: 'Ubunararibonye bw\'ibikoresho nyakuri', icon: Target },
                      { title: 'Amazu y\'Ikoranabuhanga', desc: 'Ibikoresho n\'uburyo bw\'inganda', icon: Building },
                      { title: 'Kwiga ku Mishinga', desc: 'Imishinga n\'ibibazo by\'ukuri', icon: Rocket },
                      { title: 'Ubufatanye n\'Inganda', desc: 'Gukorana n\'amasosiyete akomeye', icon: Briefcase },
                      { title: 'Porogaramu z\'Impamyabumenyi', desc: 'Impamyabumenyi zemewe n\'inganda', icon: Award },
                      { title: 'Ubufasha mu Kazi', desc: 'Gushyira mu kazi no kuyobora umwuga', icon: TrendingUp }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-gradient-to-br from-green-50 via-yellow-50 to-lime-50 p-6 rounded-2xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all"
                      >
                        <div className="p-3 bg-gradient-to-r from-green-500 to-yellow-400 rounded-xl w-fit mb-4">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-lg mb-2 text-gray-800">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tools & Equipment Section */}
                  {(() => {
                    const toolsImages = gallery.filter(item => item.category === 'Tools & Equipment');
                    return toolsImages.length > 0 && (
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold flex items-center gap-2">
                            <Wrench className="w-6 h-6 text-green-600" />
                            Ibikoresho n'Ibyuma ({toolsImages.length})
                          </h3>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setActiveTab('gallery');
                              setGalleryFilter('Tools & Equipment');
                            }}
                          >
                            Reba Byose <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {toolsImages.slice(0, 10).map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              whileHover={{ scale: 1.05, y: -5 }}
                              onClick={() => setSelectedImage(`http://localhost:5000${item.url}`)}
                              className="aspect-square bg-gradient-to-br from-green-100 via-yellow-100 to-lime-100 rounded-xl overflow-hidden shadow-lg cursor-pointer relative group"
                            >
                              <ImageWithFallback
                                src={`http://localhost:5000${item.url}`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs font-semibold truncate">{item.title}</p>
                              </div>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/90 rounded-full p-1.5">
                                  <ZoomIn className="w-4 h-4 text-gray-800" />
                                </div>
                              </div>
                              <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
                                Tool
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Facility Images Gallery */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <ImageIcon className="w-6 h-6 text-green-600" />
                      Amafoto Yose ({gallery.length})
                    </h3>
                    {loadingGallery ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Iratunganya amafoto...</p>
                      </div>
                    ) : gallery.length === 0 ? (
                      <div className="text-center py-8">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Nta mafoto ahari</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {gallery.slice(0, 8).map((item, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setSelectedImage(`http://localhost:5000${item.url}`)}
                            className="aspect-square bg-gradient-to-br from-green-200 via-yellow-200 to-lime-200 rounded-xl overflow-hidden shadow-lg cursor-pointer relative group"
                          >
                            <ImageWithFallback
                              src={`http://localhost:5000${item.url}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-xs font-semibold truncate">{item.title}</p>
                              <p className="text-xs text-white/80">{item.category}</p>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/90 rounded-full p-1">
                                <ZoomIn className="w-4 h-4 text-gray-800" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Meet Our Teachers Section */}
              <Card className="border-2 border-gray-100 shadow-2xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${getGradientColors(tradeCode)} text-white`}>
                  <CardTitle className="flex items-center gap-3 text-3xl">
                    <Users className="w-8 h-8" />
                    Hura n'Abarimu Bacu Banyobozi
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    Wiga ku banyobozi b'inganda bafite uburambe bw'imyaka myinshi
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'John Doe', role: 'Umwarimu Mukuru', exp: 'Imyaka 15+', spec: trade.name, rating: 4.9 },
                      { name: 'Jane Smith', role: 'Umwarimu w\'Ubuyobozi', exp: 'Imyaka 12+', spec: trade.name, rating: 4.8 },
                      { name: 'Mike Johnson', role: 'Umwarimu w\'Ikoranabuhanga', exp: 'Imyaka 10+', spec: trade.name, rating: 4.9 },
                      { name: 'Sarah Williams', role: 'Umuyobozi w\'Aho Dukora', exp: 'Imyaka 8+', spec: trade.name, rating: 4.7 },
                      { name: 'David Brown', role: 'Umuhanga w\'Inganda', exp: 'Imyaka 20+', spec: trade.name, rating: 5.0 },
                      { name: 'Emily Davis', role: 'Umuhugurwa w\'Ubuhanga', exp: 'Imyaka 9+', spec: trade.name, rating: 4.8 }
                    ].map((teacher, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="bg-gradient-to-br from-white via-green-50 to-yellow-50 rounded-2xl p-6 border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                            <AvatarFallback className={`text-xl font-bold bg-gradient-to-r ${getGradientColors(tradeCode)} text-white`}>
                              {teacher.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800">{teacher.name}</h4>
                            <p className="text-sm text-gray-600 mb-1">{teacher.role}</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold text-gray-700">{teacher.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span>Uburambe bw'Imyaka {teacher.exp}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target className="w-4 h-4 text-green-600" />
                            <span>{teacher.spec}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-green-600" />
                            <span className="truncate">{teacher.name.toLowerCase().replace(' ', '.')}@school.rw</span>
                          </div>
                        </div>
                        <Button className={`w-full mt-4 bg-gradient-to-r ${getGradientColors(tradeCode)} hover:opacity-90`}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Vugana n'Umwarimu
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-2 border-gray-100 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 via-yellow-50 to-lime-50">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Award className="w-6 h-6 text-green-600" />
                        Ibintu by'Ingenzi bya Porogaramu
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          'Ibikoresho by\'Inganda',
                          'Amahugurwa y\'Ubuhanga',
                          'Abarimu Banyobozi',
                          'Ubufasha mu Gushaka Akazi',
                          'Ibikoresho Bigezweho',
                          'Porogaramu z\'Impamyabumenyi',
                          'Amahirwe yo Gukora Imyitozo',
                          'Gahunda z\'Amahugurwa Yoroshye'
                        ].map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="font-medium text-gray-800">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-gray-100 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 via-lime-50 to-green-50">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Target className="w-6 h-6 text-yellow-600" />
                        Ibyavuye mu Kwiga
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {[
                          'Kumenya ubuhanga bw\'ibanze n\'uburyo bw\'inganda',
                          'Guteza imbere ubushobozi bwo gukemura ibibazo no gutekereza',
                          'Kubona uburambe bw\'ubuhanga n\'ikoranabuhanga rigezweho',
                          'Kubaka dosiye y\'umwuga y\'imishinga yarangiye',
                          'Kwitegura ibizamini by\'impamyabumenyi z\'inganda',
                          'Guhuza n\'abanyobozi b\'inganda n\'abo mwigana'
                        ].map((outcome, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="mt-1 p-1 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full">
                              <Star className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-gray-700 leading-relaxed">{outcome}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-2 border-gray-100 shadow-xl bg-gradient-to-br from-green-50 via-yellow-50 to-lime-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        Amakuru Yihuse
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Igihe</span>
                        <span className="font-semibold">Imyaka 2-3</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Inzego</span>
                        <span className="font-semibold">Inzego {trade.levels.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Amasomo Yose</span>
                        <span className="font-semibold">
                          Amasomo {trade.levels.reduce((sum: number, l: any) => sum + l.courses.length, 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Uburyo</span>
                        <span className="font-semibold">Igihe cyose</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Ururimi</span>
                        <span className="font-semibold">Icyongereza/Ikinyarwanda</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-gray-100 shadow-xl bg-gradient-to-br from-green-500 via-yellow-400 to-lime-400 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Zap className="w-5 h-5" />
                        Andikisha Ubu
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-white/90 text-sm">
                        Tangira urugendo rwawe muri {trade.name} uyu munsi!
                      </p>
                      <Button className="w-full bg-white text-green-700 hover:bg-gray-100 font-bold">
                        <Rocket className="w-4 h-4 mr-2" />
                        Andikisha Kwinjira
                      </Button>
                      <Button variant="outline" className="w-full border-white text-white hover:bg-white/20">
                        <Phone className="w-4 h-4 mr-2" />
                        Hamagara Kwinjira
                      </Button>
                      <Button variant="outline" className="w-full border-white text-white hover:bg-white/20">
                        <Download className="w-4 h-4 mr-2" />
                        Kuramo Inyandiko
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Levels & Courses Tab */}
          <TabsContent value="levels" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-4">Hitamo Urwego</h3>
                {trade.levels.map((level: any, index: number) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLevel(level)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedLevel?.code === level.code
                        ? `bg-gradient-to-r ${getGradientColors(tradeCode)} text-white shadow-lg`
                        : 'bg-white hover:bg-gray-50 border-2 border-gray-100'
                    }`}
                  >
                    <div className="font-semibold">{level.level}</div>
                    <div className={`text-sm ${selectedLevel?.code === level.code ? 'text-white/80' : 'text-gray-500'}`}>
                      {level.courses.length} Amasomo
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="lg:col-span-3">
                {selectedLevel && (
                  <motion.div
                    key={selectedLevel.code}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="border-2 border-gray-100 shadow-xl">
                      <CardHeader className={`bg-gradient-to-r ${getGradientColors(tradeCode)} text-white`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl">{selectedLevel.level}</CardTitle>
                            <CardDescription className="text-white/80 mt-2">
                              {selectedLevel.description}
                            </CardDescription>
                          </div>
                          <Badge className="bg-white/20 text-white">
                            {selectedLevel.duration}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        {selectedLevel.hasClasses && (
                          <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                            <h6 className="font-semibold mb-2 flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-600" />
                              Amatsinda: {selectedLevel.classes.join(' na ')}
                            </h6>
                            <p className="text-sm text-gray-600">
                              Abanyeshuri biga amasomo amwe ariko mu matsinda atandukanye
                            </p>
                          </div>
                        )}

                        <h6 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          Amasomo y'Ibanze ({selectedLevel.courses.length})
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedLevel.courses.map((course: any, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-md transition-all border border-gray-100"
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold block text-gray-800">
                                  {course.name}
                                </span>
                                <span className="text-xs text-gray-500">{course.code}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Instructors Tab */}
          <TabsContent value="instructors" className="space-y-6">
            <Card className="border-2 border-gray-100 shadow-xl">
              <CardHeader className={`bg-gradient-to-r ${getGradientColors(tradeCode)} text-white`}>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  Hura n'Abarimu Bacu Banyobozi
                </CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  Wiga ku banyobozi b'inganda bafite uburambe bw'imyaka myinshi
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {trade?.tradeId ? (
                  <TradeTeachers 
                    tradeId={trade.tradeId} 
                    gradientColors={getGradientColors(tradeCode)}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Nta makuru y'abarimu ahari</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card className="border-2 border-gray-100 shadow-xl">
              <CardHeader className={`bg-gradient-to-r ${getGradientColors(tradeCode)} text-white`}>
                <CardTitle className="text-2xl">Amafoto y'Ibikoresho n'Ibikorwa</CardTitle>
                <CardDescription className="text-white/90">
                  Reba ibikoresho byacu n'ibikorwa by'abanyeshuri
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {(() => {
                  const categories = Array.from(new Set(gallery.map(item => item.category)));
                  const filtered = galleryFilter === 'All' ? gallery : gallery.filter(item => item.category === galleryFilter);
                  
                  return (
                    <>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <Button
                          variant={galleryFilter === 'All' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setGalleryFilter('All')}
                          className={galleryFilter === 'All' ? `bg-gradient-to-r ${getGradientColors(tradeCode)}` : ''}
                        >
                          Ifoto Zose ({gallery.length})
                        </Button>
                        {categories.map((category) => {
                          const count = gallery.filter(item => item.category === category).length;
                          return (
                            <Button
                              key={category}
                              variant={galleryFilter === category ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setGalleryFilter(category)}
                              className={galleryFilter === category ? `bg-gradient-to-r ${getGradientColors(tradeCode)}` : ''}
                            >
                              {category} ({count})
                            </Button>
                          );
                        })}
                      </div>

                      {loadingGallery ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Iratunganya amafoto...</p>
                        </div>
                      ) : filtered.length === 0 ? (
                        <div className="text-center py-12">
                          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">Nta mafoto ahari</p>
                          <p className="text-sm text-gray-500 mt-1">Shyiramo amafoto mu bwoko bw'ibikoresho</p>
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
                                whileHover={{ scale: 1.05 }}
                                className="group cursor-pointer relative"
                                onClick={() => setSelectedImage(`http://localhost:5000${item.url}`)}
                              >
                                <div className="aspect-square relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-green-400 transition-colors shadow-lg">
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
                                    <Badge className={`bg-gradient-to-r ${getGradientColors(tradeCode)} text-white border-0`}>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Careers Tab */}
          <TabsContent value="careers" className="space-y-6">
            <Card className="border-2 border-gray-100 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-2xl">Amahirwe y'Akazi</CardTitle>
                <CardDescription>
                  Reba inzira z'akazi zishimishije nyuma yo kurangiza
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: 'Umukozi Muto', salary: '$30,000 - $50,000', growth: '+15%' },
                    { title: 'Umukozi Mukuru', salary: '$60,000 - $90,000', growth: '+20%' },
                    { title: 'Umuyobozi w\'Ikoranabuhanga', salary: '$80,000 - $120,000', growth: '+25%' },
                    { title: 'Umuyobozi w\'Umushinga', salary: '$70,000 - $100,000', growth: '+18%' }
                  ].map((career, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-white to-green-50 rounded-xl p-6 border-2 border-green-100 shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-lg mb-1">{career.title}</h4>
                          <Badge className="bg-green-100 text-green-700">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {career.growth} Ikura
                          </Badge>
                        </div>
                        <Briefcase className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Umushahara Rusange</span>
                        <span className="font-bold text-green-600">{career.salary}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            onClick={() => setSelectedImage(null)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white bg-black/20 hover:bg-black/40"
          >
            <X className="w-6 h-6" />
          </Button>
          <img 
            src={selectedImage} 
            alt="Gallery" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
});

export default TradeDetailPage;
