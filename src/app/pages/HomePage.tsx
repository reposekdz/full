import React, { useState, useEffect } from 'react';
import Hero from '@/app/components/Hero';
import CampusGallerySection from '@/app/components/CampusGallerySection';
import { motion } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  GraduationCap,
  Trophy,
  Building,
  Clock,
  Calendar,
  Star,
  Quote,
  CheckCircle,
  Target,
  Briefcase,
  Globe,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import sodImage from '@/assets/image slides/SOD slides.png';
import bdcImage from '@/assets/image slides/BDC slides.jpg';
import autImage from '@/assets/image slides/AUT slides.png';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [newsArticles, setNewsArticles] = useState([]);
  const [displayedNewsCount, setDisplayedNewsCount] = useState(8);
  const [testimonials, setTestimonials] = useState([]);
  const [schoolStats, setSchoolStats] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [dynamicFeatures, setDynamicFeatures] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    Users,
    GraduationCap,
    Briefcase,
    Trophy,
    Award,
    Target,
    TrendingUp,
    BookOpen,
    Building,
    Globe
  };

  // Default fallback data with real images from backend
  const defaultTrades = [
    {
      id: 1,
      name: 'Software Development',
      titleKey: 'softwareDevelopment',
      image: sodImage,
      code: 'SOD',
    },
    {
      id: 2,
      name: 'Building Construction',
      titleKey: 'buildingConstruction',
      image: bdcImage,
      code: 'BDC',
    },
    {
      id: 3,
      name: 'Automobile Technology',
      titleKey: 'automobileTechnology',
      image: autImage,
      code: 'AUT',
    },
  ];

  const getTradeImageUrl = (trade: any) => {
    if (trade.image_url) {
      return trade.image_url.startsWith('/uploads') ? `http://localhost:5000${trade.image_url}` : trade.image_url;
    }
    if (trade.image) return trade.image;
    if (trade.code === 'SOD') return sodImage;
    if (trade.code === 'BDC') return bdcImage;
    if (trade.code === 'AUT') return autImage;
    return `http://localhost:5000/uploads/trades/${trade.code?.toLowerCase()}.jpg`;
  };

  const defaultStats = [
    {
      id: 1,
      stat_key: 'students',
      value: '1,248',
      label: 'Abanyeshuri',
      icon: 'Users',
      color: 'from-blue-500 to-indigo-500',
      is_active: true,
      sort_order: 1
    },
    {
      id: 2,
      stat_key: 'teachers',
      value: '84',
      label: 'Abarimu',
      icon: 'GraduationCap',
      color: 'from-green-500 to-teal-500',
      is_active: true,
      sort_order: 2
    },
    {
      id: 3,
      stat_key: 'employment',
      value: '95%',
      label: 'Gushirwa mu kazi',
      icon: 'Briefcase',
      color: 'from-yellow-500 to-orange-500',
      is_active: true,
      sort_order: 3
    },
    {
      id: 4,
      stat_key: 'awards',
      value: '25+',
      label: 'Ibihembo',
      icon: 'Trophy',
      color: 'from-orange-500 to-red-500',
      is_active: true,
      sort_order: 4
    },
  ];

  // Fetch all dynamic content from API
  useEffect(() => {
    const fetchAllContent = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch all content in parallel
        const [newsRes, testimonialsRes, statsRes, achievementsRes, eventsRes, slidesRes, tradesRes, featuresRes] = await Promise.all([
          fetch(`${API_BASE}/news`).catch(() => ({ json: () => ({ success: false }) })),
          fetch(`${API_BASE}/homepage/testimonials`).catch(() => ({ json: () => ({ success: false }) })),
          fetch(`${API_BASE}/homepage/stats`).catch(() => ({ json: () => ({ success: false }) })),
          fetch(`${API_BASE}/homepage/achievements`).catch(() => ({ json: () => ({ success: false }) })),
          fetch(`${API_BASE}/homepage/events`).catch(() => ({ json: () => ({ success: false }) })),
          fetch(`${API_BASE}/homepage/hero-slides`).catch(() => ({ json: () => ({ success: false }) })),
          fetch(`${API_BASE}/homepage/trades`).catch(() => ({ json: () => ({ success: false }) })),
          fetch(`${API_BASE}/homepage/features`).catch(() => ({ json: () => ({ success: false }) }))
        ]);

        // Process news articles
        try {
          const newsData = await newsRes.json();
          if (newsData.success && newsData.articles && newsData.articles.length > 0) {
            const transformedArticles = newsData.articles.map((article: any) => ({
              id: article.id,
              title: article.title,
              description: article.description,
              publish_date: new Date(article.date_published || article.publish_date).toLocaleDateString('rw-RW', { year: 'numeric', month: 'long', day: 'numeric' }),
              category: article.category,
              image_url: article.image_url,
              author: article.author,
              is_active: article.is_active,
              views: article.views || 0,
              likes: article.likes || 0,
              sort_order: article.id
            }));
            setNewsArticles(transformedArticles);
          }
        } catch (error) {
          console.log('News API error:', error);
        }

        // Process testimonials
        try {
          const testimonialsData = await testimonialsRes.json();
          if (testimonialsData.success && testimonialsData.testimonials && testimonialsData.testimonials.length > 0) {
            setTestimonials(testimonialsData.testimonials);
          }
        } catch (error) {
          console.log('Testimonials API error:', error);
        }

        // Process school statistics
        try {
          const statsData = await statsRes.json();
          if (statsData.success) {
            const transformedStats = [
              {
                id: 1,
                stat_key: 'students',
                value: statsData.students?.toString() || '1,248',
                label: 'Abanyeshuri',
                icon: 'Users',
                color: 'from-blue-500 to-indigo-500',
                is_active: true,
                sort_order: 1
              },
              {
                id: 2,
                stat_key: 'teachers',
                value: statsData.teachers?.toString() || '84',
                label: 'Abarimu',
                icon: 'GraduationCap',
                color: 'from-green-500 to-teal-500',
                is_active: true,
                sort_order: 2
              },
              {
                id: 3,
                stat_key: 'employment',
                value: statsData.employmentRate || '95%',
                label: 'Gushirwa mu kazi',
                icon: 'Briefcase',
                color: 'from-yellow-500 to-orange-500',
                is_active: true,
                sort_order: 3
              },
              {
                id: 4,
                stat_key: 'awards',
                value: statsData.awards?.toString() || '25+',
                label: 'Ibihembo',
                icon: 'Trophy',
                color: 'from-orange-500 to-red-500',
                is_active: true,
                sort_order: 4
              }
            ];
            setSchoolStats(transformedStats);
          } else {
            setSchoolStats(defaultStats);
          }
        } catch (error) {
          console.log('Stats API error:', error);
          setSchoolStats(defaultStats);
        }

        // Process achievements
        try {
          const achievementsData = await achievementsRes.json();
          if (achievementsData.success && achievementsData.achievements && achievementsData.achievements.length > 0) {
            setAchievements(achievementsData.achievements);
          }
        } catch (error) {
          console.log('Achievements API error:', error);
        }

        // Process events
        try {
          const eventsData = await eventsRes.json();
          if (eventsData.success && eventsData.events && eventsData.events.length > 0) {
            setUpcomingEvents(eventsData.events);
          }
        } catch (error) {
          console.log('Events API error:', error);
        }

        // Process hero slides
        try {
          const slidesData = await slidesRes.json();
          if (slidesData.success && slidesData.slides && slidesData.slides.length > 0) {
            setHeroSlides(slidesData.slides);
          }
        } catch (error) {
          console.log('Slides API error:', error);
        }

        // Process trades
        try {
          const tradesData = await tradesRes.json();
          if (tradesData.success && tradesData.trades && tradesData.trades.length > 0) {
            setTrades(tradesData.trades);
          } else {
            setTrades(defaultTrades);
          }
        } catch (error) {
          console.log('Trades API error:', error);
          setTrades(defaultTrades);
        }

        // Process features
        try {
          const featuresData = await featuresRes.json();
          if (featuresData.success && featuresData.features && featuresData.features.length > 0) {
            setDynamicFeatures(featuresData.features);
          }
        } catch (error) {
          console.log('Features API error:', error);
        }

      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load some content. Using default data.');
        // Set default data on error
        setSchoolStats(defaultStats);
        setTrades(defaultTrades);
      } finally {
        setLoading(false);
      }
    };

    fetchAllContent();
  }, []);

  const refreshContent = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Content...</h2>
          <p className="text-gray-600">Fetching latest data from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex items-center justify-between">
            <p>{error}</p>
            <Button onClick={refreshContent} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      )}
      
      <Hero />

      {/* Statistics Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent px-2">
              Ishuri ry'Imyuga n'Ubumenyi Ngiro
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              Ishuri ry'ubuhanga rifite imikorere myiza kandi ryizera
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {schoolStats.map((stat, index) => {
              const IconComponent = iconMap[stat.icon] || Users;
              return (
                <motion.div
                  key={stat.stat_key || stat.label}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-gray-900 mb-1 sm:mb-2">{stat.value}</h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trades Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-6 sm:mb-8 md:mb-12 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent px-2"
          >
            {t('tradesOffered')}
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {(trades.length > 0 ? trades : defaultTrades).slice(0, 6).map((trade, index) => (
              <motion.div
                key={trade.id || trade.code}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl cursor-pointer"
                onClick={() => onNavigate('trades')}
              >
                <div className="aspect-[4/3] relative">
                  <ImageWithFallback
                    src={getTradeImageUrl(trade)}
                    alt={trade.name || t(trade.titleKey)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
                    {trade.name || t(trade.titleKey)}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#ADFF2F] font-bold text-base sm:text-lg">
                      {trade.code}
                    </span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white transform group-hover:translate-x-2 transition-transform" />
                  </div>
                  {trade.duration_months && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{trade.duration_months} months</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {trades.length > 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <Button
                onClick={() => onNavigate('trades')}
                className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Reba Amahugurwa Yose ({trades.length})
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* News Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-gray-50 to-yellow-50/30">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent px-2">
              Amakuru Y\'Ishuri
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              Amakuru mashya n\'ibikorwa by\'ishuri ryacu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {newsArticles.slice(0, displayedNewsCount).map((article, index) => (
              <motion.div
                key={article.id || index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all h-full overflow-hidden group cursor-pointer" onClick={() => onNavigate(`article/${article.id}`)}>
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={article.image_url?.startsWith('/uploads') ? `http://localhost:5000${article.image_url}` : article.image_url || article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800';
                      }}
                    />
                    <Badge className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 text-xs sm:text-sm">
                      {article.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {article.publish_date || article.date}
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200">
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{article.author}</span>
                      <button onClick={(e) => { e.stopPropagation(); onNavigate(`article/${article.id}`); }} className="flex items-center gap-1 text-[#ADFF2F] hover:text-green-600 transition-colors">
                        <span className="text-xs font-bold">Read More</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform flex-shrink-0" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {newsArticles.length > 8 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mt-8 gap-4"
            >
              {displayedNewsCount < newsArticles.length && (
                <button
                  onClick={() => setDisplayedNewsCount(prev => prev + 8)}
                  className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Tangaza Andi Makuru ({newsArticles.length - displayedNewsCount})
                </button>
              )}
              {displayedNewsCount > 8 && (
                <button
                  onClick={() => setDisplayedNewsCount(8)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Garagaza Bike
                </button>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-500 via-green-500 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4 text-white">
              Ibyo Abantu Bavuga
            </h2>
            <p className="text-white/90 text-lg">
              Icyo abanyeshuri, ababyeyi, n\'abarimu bavuga ku ishuri ryacu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all bg-white/95 backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14 border-2 border-yellow-400">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-lg font-bold">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <div className="flex gap-1 mt-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <Quote className="w-8 h-8 text-yellow-500 opacity-50" />
                    </div>
                    <p className="text-gray-700 italic">
                      "{testimonial.quote}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Ibihembo N\'Intsinzi
            </h2>
            <p className="text-gray-600 text-lg">
              Ibyo twagezeho mu myaka yashize
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id || index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all h-full bg-gradient-to-br from-yellow-50 to-green-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <Badge className="mb-3 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                      {achievement.year}
                    </Badge>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Gallery Section */}
      <CampusGallerySection />

      {/* Dual Portal Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-200"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-7 h-7 text-yellow-600" />
                {t('upcomingEvents')}
              </h3>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3).map((event, i) => (
                  <div key={event.id || i} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#ADFF2F]/10 to-blue-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-br from-[#ADFF2F] to-teal-500 text-white rounded-lg p-3 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-2xl font-black">
                          {new Date(event.event_date).getDate()}
                        </div>
                        <div className="text-xs">
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {language === 'rw' ? event.title_rw || event.title : event.title}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {event.event_time ? new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'} • {event.location}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {language === 'rw' ? event.description_rw || event.description : event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      {event.priority && (
                        <Badge className={`text-xs ${
                          event.priority === 'high' ? 'bg-red-500' :
                          event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        } text-white`}>
                          {event.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                )) : [
                  { title: 'Inama y\'Ababyeyi', date: '25', month: 'JAN', time: '2:00 PM', location: 'Icyumba Gikuru' },
                  { title: 'Ikizamini cy\'Igice', date: '28', month: 'JAN', time: '8:00 AM', location: 'Amaklasi Yose' },
                  { title: 'Umukino wa Basketball', date: '30', month: 'JAN', time: '4:00 PM', location: 'Terrain ya Siporo' }
                ].map((event, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#ADFF2F]/10 to-blue-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-br from-[#ADFF2F] to-teal-500 text-white rounded-lg p-3 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-2xl font-black">{event.date}</div>
                        <div className="text-xs">{event.month}</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {event.time} • {event.location}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Student & Parent Portal */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#ADFF2F] via-teal-500 to-blue-600 rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-black text-white mb-6">{t('studentParentPortal')}</h3>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('login')}
                  className="w-full flex items-center justify-between bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-6 rounded-xl transition-all border-2 border-white/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-lg block">{t('studentPortal')}</span>
                      <span className="text-sm text-white/80">Injira kuri dashbord yawe</span>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('register')}
                  className="w-full flex items-center justify-between bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-6 rounded-xl transition-all border-2 border-white/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-lg block">{t('studentAndParent')}</span>
                      <span className="text-sm text-white/80">Reba amakuru y\'abana bawe</span>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>

                <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Imiterere Yose
                  </h4>
                  <ul className="space-y-2 text-white/90 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Reba amanota yawe
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Kubungabunga kwitabira
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Kwishyura amafaranga
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Kubona amakuru y\'ishuri
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Kuki Watora Ishuri Ryacu?
            </h2>
            <p className="text-gray-600 text-lg">
              Impamvu zitandukanye zo guhitamo ishuri ryacu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dynamicFeatures.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || GraduationCap;
              return (
                <motion.div
                  key={feature.id || index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all h-full">
                    <CardContent className="p-8 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {language === 'rw' ? feature.title_rw : feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'rw' ? feature.description_rw : feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
