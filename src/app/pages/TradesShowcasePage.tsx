import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code,
  Building,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface TradesShowcasePageProps {
  onNavigate: (page: string) => void;
}

const TradesShowcasePage: React.FC<TradesShowcasePageProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const trades = [
    {
      id: 'SOD',
      name: 'SOD Program',
      fullName: 'Software Development',
      tagline: 'TVET Excellence',
      description: 'Wiga gukora porogaramu, kurema website, n\'aplikasiyo za murandasi',
      icon: Code,
      color: 'from-blue-500 via-indigo-500 to-purple-600',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      levels: ['Level 3', 'Level 4', 'Level 5'],
      highlights: [
        'Modern Programming Languages',
        'Web & Mobile Development',
        'Database Management',
        'Cloud Computing',
        'Industry Certifications'
      ],
      stats: { students: 450, teachers: 28, successRate: 94 }
    },
    {
      id: 'BDC',
      name: 'BDC Program',
      fullName: 'Building & Construction',
      tagline: 'TVET Excellence',
      description: 'Wiga ubwubatsi, gushushanya, n\'ugucunga imishinga y\'inyubako',
      icon: Building,
      color: 'from-orange-500 via-red-500 to-pink-600',
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
      levels: ['Level 3', 'Level 4', 'Level 5'],
      highlights: [
        'Construction Techniques',
        'Architectural Drawing',
        'Project Management',
        'Safety Standards',
        'Professional Certification'
      ],
      stats: { students: 380, teachers: 24, successRate: 91 }
    },
    {
      id: 'AUT',
      name: 'AUT Program',
      fullName: 'Automobile Technology',
      tagline: 'TVET Excellence',
      description: 'Wiga gusana imodoka, diagnostike, n\'ubugororangingo bw\'ibinyabiziga',
      icon: Wrench,
      color: 'from-green-500 via-teal-500 to-cyan-600',
      imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
      levels: ['Level 3', 'Level 4A', 'Level 4B', 'Level 5A', 'Level 5B'],
      highlights: [
        'Engine Diagnostics',
        'Auto Repair & Maintenance',
        'Electrical Systems',
        'Modern Technology',
        'Industry Partnerships'
      ],
      stats: { students: 418, teachers: 32, successRate: 93 }
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trades.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + trades.length) % trades.length);
  };

  const currentTrade = trades[currentSlide];
  const Icon = currentTrade.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-yellow-300 to-green-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-300 to-yellow-300 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center py-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-2"
        >
          <Sparkles className="h-8 w-8 text-yellow-500 mr-3" />
          <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-600 bg-clip-text text-transparent">
            Imyuga Duha
          </h1>
          <Sparkles className="h-8 w-8 text-green-500 ml-3" />
        </motion.div>
        <p className="text-xl text-gray-600 font-medium">Our Professional Trade Programs</p>
      </div>

      {/* Main Showcase */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-4 border-yellow-300 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left Side - Image/Visual */}
                  <div className="relative min-h-[500px] overflow-hidden">
                    <img 
                      src={currentTrade.imageUrl}
                      alt={currentTrade.fullName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
                    
                    <div className="relative p-12 flex flex-col justify-center items-center h-full">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 0.8 }}
                        className="mb-6"
                      >
                        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-white/30">
                          <Icon className="h-32 w-32 text-white" />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center"
                      >
                        <Badge className="bg-yellow-500/90 backdrop-blur-sm text-white border-yellow-300/50 text-xl px-6 py-2 mb-4">
                          {currentTrade.tagline}
                        </Badge>
                        <h2 className="text-5xl font-black text-white mb-2 drop-shadow-lg">
                          {currentTrade.name}
                        </h2>
                        <p className="text-2xl text-white/90 font-semibold drop-shadow-md">
                          {currentTrade.fullName}
                        </p>
                      </motion.div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border-2 border-white/30"
                        >
                          <Users className="h-6 w-6 text-white mx-auto mb-1" />
                          <p className="text-2xl font-black text-white">{currentTrade.stats.students}</p>
                          <p className="text-xs text-white/80">Students</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border-2 border-white/30"
                        >
                          <Award className="h-6 w-6 text-white mx-auto mb-1" />
                          <p className="text-2xl font-black text-white">{currentTrade.stats.teachers}</p>
                          <p className="text-xs text-white/80">Teachers</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border-2 border-white/30"
                        >
                          <TrendingUp className="h-6 w-6 text-white mx-auto mb-1" />
                          <p className="text-2xl font-black text-white">{currentTrade.stats.successRate}%</p>
                          <p className="text-xs text-white/80">Success</p>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Details */}
                  <div className="p-12 bg-white">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-3xl font-black text-gray-900 mb-4">
                        Ibyerekeye Uyu Mwuga
                      </h3>
                      <p className="text-lg text-gray-700 mb-6">
                        {currentTrade.description}
                      </p>

                      {/* Levels */}
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Inzego:</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentTrade.levels.map((level, idx) => (
                            <motion.div
                              key={level}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                            >
                              <Badge className={`bg-gradient-to-r ${currentTrade.color} text-white text-sm px-4 py-2`}>
                                {level}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="mb-8">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Ibintu Biziga:</h4>
                        <div className="space-y-2">
                          {currentTrade.highlights.map((highlight, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + idx * 0.1 }}
                              className="flex items-center"
                            >
                              <CheckCircle className={`h-5 w-5 mr-2 bg-gradient-to-r ${currentTrade.color} bg-clip-text text-transparent`} />
                              <span className="text-gray-700">{highlight}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-yellow-500 via-yellow-400 to-green-500 hover:from-yellow-600 hover:via-yellow-500 hover:to-green-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-0"
                          size="lg"
                          onClick={() => onNavigate('register')}
                        >
                          Tangira
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 border-3 border-yellow-400 text-gray-800 font-bold py-6 text-lg hover:bg-gradient-to-r hover:from-green-500 hover:to-yellow-500 hover:text-white hover:border-transparent transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                          size="lg"
                          onClick={() => onNavigate('trades')}
                        >
                          Menya Byinshi
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            onClick={prevSlide}
            className="bg-gradient-to-r from-yellow-500 to-green-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
            size="icon"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Dots */}
          <div className="flex gap-2">
            {trades.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all ${
                  idx === currentSlide
                    ? 'w-12 h-3 bg-gradient-to-r from-yellow-500 to-green-500'
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                } rounded-full`}
              />
            ))}
          </div>

          <Button
            onClick={nextSlide}
            className="bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
            size="icon"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Bottom Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 text-center pb-12"
      >
        <Button
          variant="outline"
          onClick={() => onNavigate('home')}
          className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 text-lg px-8 py-3"
        >
          Subira Ahabanza
        </Button>
      </motion.div>
    </div>
  );
};

export default TradesShowcasePage;
