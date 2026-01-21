import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useContent } from '@/app/contexts/ContentContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const { t } = useLanguage();
  const { slides, loading } = useContent();

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading || slides.length === 0) {
    return (
      <div className="relative h-[600px] bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] overflow-hidden bg-gray-900">
      {/* Background Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <ImageWithFallback
            src={slides[currentSlide].image_url}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <motion.div
              key={currentSlide + '-content'}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1">
                TVET Excellence
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8">
                {slides[currentSlide].subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                  {slides[currentSlide].button_text || t('getStarted')}
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 bg-white/10 backdrop-blur-sm text-white border-white hover:bg-white/20">
                  {t('learnMore')}
                </Button>
              </div>
            </motion.div>

            {/* Slide Previews */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {slides.map((slide, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentSlide(index)}
                  className={`relative h-32 rounded-xl overflow-hidden cursor-pointer ${
                    currentSlide === index ? 'ring-4 ring-blue-500' : ''
                  }`}
                >
                  <ImageWithFallback
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-black transition-opacity ${
                    currentSlide === index ? 'bg-opacity-30' : 'bg-opacity-60'
                  }`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white font-bold text-center px-2 text-sm">
                      {slide.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-4">
        {/* Progress Indicators */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group"
            >
              <div className={`h-2 rounded-full transition-all ${
                currentSlide === index 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 w-2 group-hover:w-4'
              }`} />
            </button>
          ))}
        </div>

        {/* Play/Pause */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsPlaying(!isPlaying)}
          className="rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>

      {/* Arrow Controls */}
      <Button
        size="icon"
        variant="ghost"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Hero;
