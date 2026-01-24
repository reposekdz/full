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

      {/* Trade Cards Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trades.map((trade, index) => {
            const Icon = trade.icon;
            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: index * 0.2, type: 'spring', stiffness: 100 }}
                whileHover={{ scale: 1.05, y: -15, rotateY: 5 }}
                onClick={() => onNavigate(`trade-${trade.id.toLowerCase()}`)}
                className="group relative cursor-pointer perspective-1000"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                />
                
                <Card className="relative border-4 border-yellow-300 shadow-2xl overflow-hidden hover:shadow-3xl transition-all">
                  <CardContent className="p-0">
                    <div className="relative h-64 overflow-hidden">
                      <motion.img
                        src={trade.imageUrl}
                        alt={trade.fullName}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.15, rotate: 2 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${trade.color} opacity-60 group-hover:opacity-40 transition-opacity`} />
                      
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-xl"
                      >
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                      </motion.div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-4 border-white/30">
                          <Icon className="h-20 w-20 text-white" />
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <h3 className="text-2xl font-black text-white mb-1">{trade.name}</h3>
                        <p className="text-sm text-white/90 font-semibold">{trade.fullName}</p>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white">
                      <p className="text-gray-700 mb-4 line-clamp-2">{trade.description}</p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        {trade.levels.slice(0, 3).map((level, idx) => (
                          <Badge key={idx} className={`bg-gradient-to-r ${trade.color} text-white text-xs`}>
                            {level}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <Users className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                          <p className="text-lg font-black text-gray-900">{trade.stats.students}</p>
                          <p className="text-xs text-gray-600">Abanyeshuri</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <Award className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                          <p className="text-lg font-black text-gray-900">{trade.stats.teachers}</p>
                          <p className="text-xs text-gray-600">Abarimu</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                          <p className="text-lg font-black text-gray-900">{trade.stats.successRate}%</p>
                          <p className="text-xs text-gray-600">Intsinzi</p>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full py-3 bg-gradient-to-r ${trade.color} text-white text-sm font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                      >
                        Reba Byinshi
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="absolute inset-0 border-4 border-transparent group-hover:border-yellow-400 rounded-3xl transition-all duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
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
