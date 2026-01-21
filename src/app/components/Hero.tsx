import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Code, Building2, Car, Sparkles, ArrowRight, Users, Trophy, GraduationCap, Star, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useContent } from '@/app/contexts/ContentContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

const skillCards = [
  {
    id: 'sod',
    titleKey: 'softwareDevelopment',
    titleRw: 'Iterambere rya Porogaramu',
    code: 'SOD',
    icon: Code,
    image: 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc2ODcxODI3MXww&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    glowColor: 'shadow-blue-500/50',
    bgGradient: 'from-blue-500/20 to-indigo-500/20',
    description: 'Kwiga gukora porogaramu z\'ikoranabuhanga',
    descriptionEn: 'Learn modern software development',
    students: 156,
    duration: '2 Years',
    rating: 4.9,
    page: 'trade-sod'
  },
  {
    id: 'bdc',
    titleKey: 'buildingConstruction',
    titleRw: 'Ubwubatsi bw\'Inyubako',
    code: 'BDC',
    icon: Building2,
    image: 'https://images.unsplash.com/photo-1672072830247-85ac23671e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzY4NzMwNzQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glowColor: 'shadow-orange-500/50',
    bgGradient: 'from-orange-500/20 to-amber-500/20',
    description: 'Kwiga ubwubatsi bw\'amazu n\'inyubako',
    descriptionEn: 'Master construction techniques',
    students: 124,
    duration: '2 Years',
    rating: 4.8,
    page: 'trade-bdc'
  },
  {
    id: 'auto',
    titleKey: 'automobileTechnology',
    titleRw: 'Ikoranabuhanga ry\'Imodoka',
    code: 'AUTO',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW9iaWxlJTIwbWVjaGFuaWMlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3Njg4MDYyMTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    glowColor: 'shadow-green-500/50',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    description: 'Kwiga ikoranabuhanga ry\'imodoka',
    descriptionEn: 'Automotive technology expertise',
    students: 98,
    duration: '2 Years',
    rating: 4.7,
    page: 'trade-aut'
  }
];

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { slides, loading } = useContent();

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(slides.length, 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.max(slides.length, 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1));

  const handleCardClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  if (loading || slides.length === 0) {
    return (
      <div className="relative h-[800px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl">{language === 'rw' ? 'Gutegereza...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[850px] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Slides with Parallax Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <ImageWithFallback
            src={slides[currentSlide]?.image_url || skillCards[0].image}
            alt={slides[currentSlide]?.title || 'Hero'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Main Content - Split Layout */}
      <div className="relative z-10 h-full py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[700px]">
            
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white text-lg px-6 py-2 font-bold border-0 shadow-lg">
                  TVET Excellence 2026
                </Badge>
                <Sparkles className="w-8 h-8 text-green-400 animate-pulse" />
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight"
              >
                <span className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
                  {language === 'rw' ? 'Garden TVET' : 'Garden TVET'}
                </span>
                <br />
                <span className="text-white">
                  {language === 'rw' ? 'Ishuri ry\'Ubumenyi' : 'Technical School'}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-xl"
              >
                {language === 'rw' 
                  ? 'Twigisha ubumenyi bw\'ikoranabuhanga buzakugeza ku ntsinzi. Hitamo umwuga wawe maze utangire urugendo rwawe rwo gutsinda.' 
                  : 'We teach technical skills that lead to success. Choose your trade and start your journey to excellence.'}
              </motion.p>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-6"
              >
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-3xl font-black text-white">500+</p>
                  <p className="text-sm text-gray-300">{language === 'rw' ? 'Abanyeshuri' : 'Students'}</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-3xl font-black text-white">95%</p>
                  <p className="text-sm text-gray-300">{language === 'rw' ? 'Intsinzi' : 'Success'}</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <GraduationCap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-black text-white">3</p>
                  <p className="text-sm text-gray-300">{language === 'rw' ? 'Amahugurwa' : 'Trades'}</p>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => onNavigate && onNavigate('trades')}
                  className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {language === 'rw' ? 'Reba Amahugurwa' : 'View All Trades'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate && onNavigate('login')}
                  className="rounded-full px-8 py-6 text-lg font-bold bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  {language === 'rw' ? 'Injira' : 'Get Started'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Side - Trade Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4"
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
              >
                <div className="w-12 h-1 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full" />
                {language === 'rw' ? 'Amahugurwa Yacu' : 'Our Trades'}
              </motion.h2>

              {skillCards.map((card, index) => {
                const Icon = card.icon;
                const isHovered = hoveredCard === card.id;
                
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.15 }}
                    onMouseEnter={() => setHoveredCard(card.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleCardClick(card.page)}
                    className="cursor-pointer group"
                  >
                    <Card className={`relative overflow-hidden border-0 bg-white/10 backdrop-blur-xl transition-all duration-500 ${
                      isHovered 
                        ? `scale-[1.02] shadow-2xl ${card.glowColor} border-2 border-white/30` 
                        : 'shadow-lg hover:shadow-xl border border-white/10'
                    }`}>
                      <CardContent className="p-0">
                        <div className="flex items-stretch">
                          {/* Card Image */}
                          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
                            <motion.img
                              src={card.image}
                              alt={language === 'rw' ? card.titleRw : t(card.titleKey)}
                              className="w-full h-full object-cover"
                              animate={{ 
                                scale: isHovered ? 1.15 : 1,
                              }}
                              transition={{ duration: 0.5 }}
                            />
                            <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-60 mix-blend-multiply`} />
                            
                            {/* Icon Overlay */}
                            <motion.div
                              animate={{ 
                                rotate: isHovered ? 10 : 0,
                                scale: isHovered ? 1.1 : 1,
                              }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-xl border-2 border-white/30`}>
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                            </motion.div>
                          </div>

                          {/* Card Content */}
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`bg-gradient-to-r ${card.gradient} text-white font-black text-sm px-3 py-0.5 border-0`}>
                                  {card.code}
                                </Badge>
                                <div className="flex items-center text-yellow-400">
                                  <Star className="w-4 h-4 fill-current" />
                                  <span className="text-sm font-bold ml-1">{card.rating}</span>
                                </div>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-1">
                                {language === 'rw' ? card.titleRw : t(card.titleKey)}
                              </h3>
                              <p className="text-sm text-gray-300 line-clamp-1">
                                {language === 'rw' ? card.description : card.descriptionEn}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {card.students}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {card.duration}
                                </span>
                              </div>
                              <motion.div
                                animate={{ x: isHovered ? 5 : 0 }}
                                className="flex items-center text-white text-sm font-semibold"
                              >
                                {language === 'rw' ? 'Reba' : 'View'}
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Shine Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                          initial={{ x: '-100%' }}
                          animate={{ x: isHovered ? '200%' : '-100%' }}
                          transition={{ duration: 0.8 }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {/* View All Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center pt-4"
              >
                <Button
                  variant="ghost"
                  onClick={() => onNavigate && onNavigate('trades')}
                  className="text-white hover:text-yellow-400 hover:bg-white/10 font-semibold"
                >
                  {language === 'rw' ? 'Reba Byose' : 'View All Trades'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-4">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group"
            >
              <motion.div 
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'bg-gradient-to-r from-yellow-400 to-green-400 w-10' 
                    : 'bg-white/50 w-2 group-hover:w-4 group-hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsPlaying(!isPlaying)}
          className="rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>

      {/* Arrow Controls */}
      <Button
        size="icon"
        variant="ghost"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-12 h-12"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-12 h-12"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Hero;
